package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.config.RouteGraphProperties;
import com.rescuenav.backend.route.dto.CandidateRouteSummary;
import com.rescuenav.backend.route.dto.EmergencyFallbackReason;
import com.rescuenav.backend.route.dto.EmergencyRouteMeta;
import com.rescuenav.backend.route.dto.EmergencyRouteSummary;
import com.rescuenav.backend.route.dto.RouteCalculationResponse;
import com.rescuenav.backend.route.dto.RoutePoint;
import com.rescuenav.backend.route.dto.RouteStrategyType;
import com.rescuenav.backend.route.dto.RouteSummary;
import com.rescuenav.backend.route.dto.VehicleType;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.PriorityQueue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
class OsmGraphEmergencyRoutePlanner {

    private static final String WARNING =
            "OSM 그래프 기반 긴급 경로는 추정 경로입니다. 최종 경로 판단은 현장 상황을 우선해야 합니다.";
    private static final String LEGAL_WARNING =
            "긴급 경로 안내는 긴급차량의 법규 특례를 전제로 하며, 일방통행 도로의 역주행은 제외합니다.";

    private final RoadGraphLoader roadGraphLoader;
    private final RouteGraphProperties routeGraphProperties;

    Optional<EmergencyRouteSummary> calculateIfAvailable(
            RoutePoint origin,
            RouteCalculationResponse.ResolvedDestination destination,
            RouteSummary standardRoute,
            VehicleType vehicleType,
            VehicleProfile vehicleProfile
    ) {
        EmergencyRoutePlanResult result = calculateWithResult(origin, destination, standardRoute, vehicleType, vehicleProfile);
        return result.succeeded() ? Optional.of(result.route()) : Optional.empty();
    }

    EmergencyRoutePlanResult calculateWithResult(
            RoutePoint origin,
            RouteCalculationResponse.ResolvedDestination destination,
            RouteSummary standardRoute,
            VehicleType vehicleType,
            VehicleProfile vehicleProfile
    ) {
        Optional<RoadGraphSnapshot> loadedGraph = roadGraphLoader.loadActiveGraph();
        if (loadedGraph.isEmpty()) {
            return EmergencyRoutePlanResult.failure(
                    EmergencyFallbackReason.GRAPH_NOT_LOADED,
                    "OSM 그래프를 불러오지 못했습니다. graph source, snapshot 경로 또는 Supabase 그래프 구성을 확인해 주세요."
            );
        }

        RoadGraphSnapshot graph = loadedGraph.get();
        Optional<RoadGraphSnapshot.GraphNode> startNode = nearestNode(graph, origin);
        Optional<RoadGraphSnapshot.GraphNode> destinationNode = nearestNode(
                graph,
                new RoutePoint(destination.lat(), destination.lng())
        );

        if (startNode.isEmpty() && destinationNode.isEmpty()) {
            log.info("route.calculate.emergency.osmGraph.skipped reason=noNearbyGraphNode point=originAndDestination");
            return EmergencyRoutePlanResult.failure(
                    EmergencyFallbackReason.NEAREST_NODE_NOT_FOUND,
                    "출발지와 목적지가 모두 현재 로드된 OSM 그래프 범위 밖에 있습니다."
            );
        }
        if (startNode.isEmpty()) {
            log.info("route.calculate.emergency.osmGraph.skipped reason=noNearbyGraphNode point=origin");
            return EmergencyRoutePlanResult.failure(
                    EmergencyFallbackReason.ORIGIN_OUT_OF_GRAPH_RANGE,
                    "출발지가 현재 로드된 OSM 그래프 범위 밖에 있습니다."
            );
        }
        if (destinationNode.isEmpty()) {
            log.info("route.calculate.emergency.osmGraph.skipped reason=noNearbyGraphNode point=destination");
            return EmergencyRoutePlanResult.failure(
                    EmergencyFallbackReason.DESTINATION_OUT_OF_GRAPH_RANGE,
                    "목적지가 현재 로드된 OSM 그래프 범위 밖에 있습니다."
            );
        }

        Optional<GraphRoute> graphEmergencyRoute = findRoute(graph, startNode.get(), destinationNode.get(), vehicleType, true);
        if (graphEmergencyRoute.isEmpty()) {
            log.info("route.calculate.emergency.osmGraph.skipped reason=noEmergencyGraphRoute");
            return EmergencyRoutePlanResult.failure(
                    EmergencyFallbackReason.ASTAR_PATH_NOT_FOUND,
                    "가장 가까운 그래프 노드 사이에서 A*가 긴급 경로를 찾지 못했습니다."
            );
        }

        Optional<GraphRoute> graphStandardRoute = findRoute(graph, startNode.get(), destinationNode.get(), vehicleType, false);
        long correctedEta = correctedEtaSeconds(graphEmergencyRoute.get(), graphStandardRoute, standardRoute);
        EmergencyRouteSummary summary = buildSummary(
                startNode.get(),
                destinationNode.get(),
                graphEmergencyRoute.get(),
                correctedEta,
                standardRoute,
                vehicleType
        );
        return EmergencyRoutePlanResult.success(summary);
    }

    private Optional<RoadGraphSnapshot.GraphNode> nearestNode(
            RoadGraphSnapshot graph,
            RoutePoint point
    ) {
        return graph.nodeValues().stream()
                .map(node -> new NodeCandidate(node, RouteGeometryUtils.calculateDistanceMeters(point, node.point())))
                .filter(candidate -> candidate.distanceMeters() <= routeGraphProperties.nearestNodeMaxDistanceMeters())
                .min(Comparator.comparingDouble(NodeCandidate::distanceMeters))
                .map(NodeCandidate::node);
    }

    private Optional<GraphRoute> findRoute(
            RoadGraphSnapshot graph,
            RoadGraphSnapshot.GraphNode startNode,
            RoadGraphSnapshot.GraphNode destinationNode,
            VehicleType vehicleType,
            boolean emergencyMode
    ) {
        HashMap<String, Double> gScore = new HashMap<>();
        HashMap<String, String> previous = new HashMap<>();
        HashMap<String, RoadGraphSnapshot.GraphEdge> previousEdge = new HashMap<>();
        PriorityQueue<SearchState> open = new PriorityQueue<>(Comparator.comparingDouble(SearchState::estimatedTotalCost));

        gScore.put(startNode.id(), 0.0);
        open.offer(new SearchState(startNode.id(), 0.0, heuristicSeconds(startNode.point(), destinationNode.point(), emergencyMode)));

        while (!open.isEmpty()) {
            SearchState current = open.poll();
            if (current.nodeId().equals(destinationNode.id())) {
                return Optional.of(reconstructRoute(graph, destinationNode.id(), previous, previousEdge, gScore.get(destinationNode.id())));
            }
            if (current.actualCost() > gScore.getOrDefault(current.nodeId(), Double.POSITIVE_INFINITY)) {
                continue;
            }

            for (RoadGraphSnapshot.GraphEdge edge : graph.outgoingEdges(current.nodeId())) {
                if (!isEdgeUsable(edge, vehicleType, emergencyMode)) {
                    continue;
                }
                double nextCost = current.actualCost() + edgeTraversalSeconds(edge, emergencyMode);
                if (nextCost >= gScore.getOrDefault(edge.toNodeId(), Double.POSITIVE_INFINITY)) {
                    continue;
                }

                gScore.put(edge.toNodeId(), nextCost);
                previous.put(edge.toNodeId(), current.nodeId());
                previousEdge.put(edge.toNodeId(), edge);
                double estimatedTotal = nextCost + heuristicSeconds(edge.toPoint(), destinationNode.point(), emergencyMode);
                open.offer(new SearchState(edge.toNodeId(), nextCost, estimatedTotal));
            }
        }

        return Optional.empty();
    }

    private boolean isEdgeUsable(RoadGraphSnapshot.GraphEdge edge, VehicleType vehicleType, boolean emergencyMode) {
        if (vehicleType == VehicleType.FIRE_TRUCK && edge.blockedForFireTruck()) {
            return false;
        }
        if (vehicleType == VehicleType.AMBULANCE && edge.blockedForAmbulance()) {
            return false;
        }
        if (!emergencyMode && edge.fireAccessRoad()) {
            return false;
        }
        if (!emergencyMode && edge.busLane() && !edge.busLaneAllowedEmergency()) {
            return false;
        }
        if (edge.uTurnEdge() && !emergencyMode) {
            return false;
        }
        if (edge.uTurnEdge() && emergencyMode && !edge.uTurnAllowedEmergency()) {
            return false;
        }
        return true;
    }

    private double edgeTraversalSeconds(RoadGraphSnapshot.GraphEdge edge, boolean emergencyMode) {
        double speedKph = emergencyMode ? edge.emergencySpeedKph() : edge.baseSpeedKph();
        double travelSeconds = edge.lengthMeters() / Math.max(1.0, speedKph * (1000.0 / 3600.0));
        double signalPenalty = emergencyMode ? Math.min(2.0, edge.signalPenaltySeconds() * 0.2) : edge.signalPenaltySeconds();
        double turnPenalty = emergencyMode ? edge.turnPenaltySeconds() * 0.4 : edge.turnPenaltySeconds();
        double emergencyPreferenceBonus = emergencyMode && edge.emergencyPreferred() ? 1.0 : 0.0;
        return Math.max(1.0, travelSeconds + signalPenalty + turnPenalty - emergencyPreferenceBonus);
    }

    private double heuristicSeconds(RoutePoint current, RoutePoint target, boolean emergencyMode) {
        double speedKph = emergencyMode ? 60.0 : 40.0;
        double straightLineDistance = RouteGeometryUtils.calculateDistanceMeters(current, target);
        return straightLineDistance / Math.max(1.0, speedKph * (1000.0 / 3600.0));
    }

    private GraphRoute reconstructRoute(
            RoadGraphSnapshot graph,
            String destinationNodeId,
            HashMap<String, String> previous,
            HashMap<String, RoadGraphSnapshot.GraphEdge> previousEdge,
            double totalCostSeconds
    ) {
        ArrayList<RoutePoint> reversedPath = new ArrayList<>();
        ArrayList<CandidateRouteSummary> usedCandidates = new ArrayList<>();
        double totalDistance = 0.0;
        int uTurnCount = 0;

        String currentNodeId = destinationNodeId;
        RoadGraphSnapshot.GraphNode destinationNode = graph.nodes().get(destinationNodeId);
        reversedPath.add(destinationNode.point());

        while (previous.containsKey(currentNodeId)) {
            RoadGraphSnapshot.GraphEdge edge = previousEdge.get(currentNodeId);
            if (edge == null) {
                break;
            }
            totalDistance += edge.lengthMeters();
            if (edge.uTurnEdge()) {
                uTurnCount++;
            }
            usedCandidates.add(new CandidateRouteSummary(
                    edge.toPoint(),
                    Math.round(edge.lengthMeters()),
                    Math.round(edgeTraversalSeconds(edge, true)),
                    RouteGeometryUtils.calculateDistanceMeters(edge.toPoint(), destinationNode.point()),
                    edge.uTurnEdge() ? 1 : 0,
                    edge.emergencyPreferred() ? -1.0 : 0.0
            ));
            currentNodeId = previous.get(currentNodeId);
            RoadGraphSnapshot.GraphNode previousNode = graph.nodes().get(currentNodeId);
            if (previousNode == null) {
                break;
            }
            reversedPath.add(previousNode.point());
        }

        List<RoutePoint> path = reversedPath.reversed();
        return new GraphRoute(
                path,
                Math.round(totalDistance),
                Math.max(1L, Math.round(totalCostSeconds)),
                uTurnCount,
                List.copyOf(usedCandidates.reversed())
        );
    }

    private long correctedEtaSeconds(
            GraphRoute graphEmergencyRoute,
            Optional<GraphRoute> graphStandardRoute,
            RouteSummary standardRoute
    ) {
        if (graphStandardRoute.isEmpty() || graphStandardRoute.get().etaSeconds() <= 0) {
            return graphEmergencyRoute.etaSeconds();
        }

        double ratio = (double) standardRoute.etaSeconds() / (double) graphStandardRoute.get().etaSeconds();
        ratio = Math.max(routeGraphProperties.etaCorrectionRatioMin(), Math.min(routeGraphProperties.etaCorrectionRatioMax(), ratio));
        return Math.max(1L, Math.round(graphEmergencyRoute.etaSeconds() * ratio));
    }

    private EmergencyRouteSummary buildSummary(
            RoadGraphSnapshot.GraphNode startNode,
            RoadGraphSnapshot.GraphNode destinationNode,
            GraphRoute graphRoute,
            long correctedEta,
            RouteSummary standardRoute,
            VehicleType vehicleType
    ) {
        double savingsRatio = standardRoute.distanceMeters() <= 0
                ? 0.0
                : 1.0 - ((double) graphRoute.distanceMeters() / (double) standardRoute.distanceMeters());
        double confidence = Math.max(0.35, Math.min(0.9, 0.58 + Math.max(0.0, savingsRatio) * 0.5));

        ArrayList<String> assumptions = new ArrayList<>();
        assumptions.add("이 경로는 로컬에 적재된 OSM 기반 방향 그래프에서 계산됩니다.");
        assumptions.add("긴급 주행을 가정하여 신호 지연은 일반 주행보다 크게 낮춰 반영됩니다.");
        assumptions.add("태그가 존재하는 경우 버스전용차로, 긴급 유턴, 소방활동로를 사용할 수 있다고 가정합니다.");
        assumptions.add("일방통행 도로의 역주행은 제외됩니다.");
        assumptions.add("ETA는 카카오 일반 경로 ETA와 로컬 그래프 일반 ETA의 비율로 보정됩니다.");

        return new EmergencyRouteSummary(
                graphRoute.distanceMeters(),
                correctedEta,
                graphRoute.path(),
                new EmergencyRouteMeta(
                        RouteStrategyType.OSM_GRAPH_ASTAR,
                        graphRoute.candidateSummaries().size(),
                        WARNING,
                        LEGAL_WARNING,
                        "긴급 경로는 로컬 OSM 그래프에서 A* 탐색으로 계산한 뒤, 카카오 일반 경로 ETA를 기준으로 보정했습니다.",
                        List.copyOf(assumptions),
                        confidence,
                        false,
                        EmergencyFallbackReason.NONE,
                        "",
                        RouteStrategyType.OSM_GRAPH_ASTAR,
                        null,
                        vehicleType.name(),
                        graphRoute.candidateSummaries()
                )
        );
    }

    private record SearchState(
            String nodeId,
            double actualCost,
            double estimatedTotalCost
    ) {
    }

    private record NodeCandidate(
            RoadGraphSnapshot.GraphNode node,
            double distanceMeters
    ) {
    }

    private record GraphRoute(
            List<RoutePoint> path,
            long distanceMeters,
            long etaSeconds,
            int uTurnCount,
            List<CandidateRouteSummary> candidateSummaries
    ) {
    }
}
