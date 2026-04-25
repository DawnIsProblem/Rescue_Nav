package com.rescuenav.backend.route.service;

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
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
final class HeuristicEmergencyRoutePlanner implements EmergencyRoutePlanner {

    private static final String EMERGENCY_WARNING =
            "긴급 경로는 추정 기반 안내입니다. 실제 출동 전에는 현장 판단이 반드시 필요합니다.";
    private static final String EMERGENCY_LEGAL_WARNING =
            "긴급 경로 안내는 긴급차량의 법규 특례를 전제로 합니다. 최종 판단과 실시간 안전 확인은 반드시 현장에서 수행해야 합니다.";
    private static final double DETOUR_RATIO_THRESHOLD = 1.8;
    private static final double SHORT_RANGE_THRESHOLD_METERS = 2_500.0;
    private static final long LONG_ETA_THRESHOLD_SECONDS = 480L;
    private static final int MAX_EXPOSED_CANDIDATES = 5;
    private static final double MIN_SHORTCUT_GAIN_METERS = 80.0;

    @Override
    public EmergencyRouteSummary calculate(
            RoutePoint origin,
            RouteCalculationResponse.ResolvedDestination destination,
            RouteSummary standardRoute,
            VehicleType vehicleType,
            VehicleProfile vehicleProfile
    ) {
        RoutePoint destinationPoint = new RoutePoint(destination.lat(), destination.lng());
        double straightLineDistance = RouteGeometryUtils.calculateDistanceMeters(origin, destinationPoint);
        boolean suspiciousDetour = isSuspiciousDetour(straightLineDistance, standardRoute);
        log.info(
                "route.calculate.emergency.detourCheck planner=heuristic straightLineDistanceMeters={} standardDistanceMeters={} standardEtaSeconds={} suspiciousDetour={}",
                Math.round(straightLineDistance),
                standardRoute.distanceMeters(),
                standardRoute.etaSeconds(),
                suspiciousDetour
        );

        PlanResult plan = plan(
                standardRoute.path(),
                standardRoute.distanceMeters(),
                standardRoute.etaSeconds(),
                vehicleProfile
        );

        log.info(
                "route.calculate.emergency.graphEvaluated planner=heuristic suspiciousDetour={} shortcutCount={} candidateCount={} plannedDistanceMeters={} plannedEtaSeconds={}",
                suspiciousDetour,
                plan.usedShortcuts().size(),
                plan.exposedCandidates().size(),
                plan.distanceMeters(),
                plan.etaSeconds()
        );

        if (!suspiciousDetour || !plan.hasShortcut()) {
            return buildEmergencyFallbackRoute(
                    standardRoute,
                    vehicleType,
                    plan.exposedCandidates().size(),
                    !suspiciousDetour
                            ? "일반 경로가 우회 경로로 판단되지 않아 일반 경로를 그대로 반환합니다."
                            : "로컬 그래프에서 유의미한 긴급 단축 경로를 찾지 못해 일반 경로를 반환합니다."
            );
        }

        List<String> assumptions = buildHeuristicAssumptions(true);
        double confidence = calculateConfidence(suspiciousDetour, plan, true);

        log.info(
                "route.calculate.emergency.selected planner=heuristic strategy={} distanceMeters={} etaSeconds={} pathPointCount={} turnCount={} shortcutCount={}",
                RouteStrategyType.GRAPH_EMERGENCY_SHORTCUT,
                plan.distanceMeters(),
                plan.etaSeconds(),
                plan.path().size(),
                plan.turnCount(),
                plan.usedShortcuts().size()
        );

        return new EmergencyRouteSummary(
                plan.distanceMeters(),
                plan.etaSeconds(),
                plan.path(),
                new EmergencyRouteMeta(
                        RouteStrategyType.GRAPH_EMERGENCY_SHORTCUT,
                        plan.exposedCandidates().size(),
                        EMERGENCY_WARNING,
                        EMERGENCY_LEGAL_WARNING,
                        "일반 경로가 단거리 우회로 판단되었고, 하나 이상의 유효한 단축 후보가 발견되어 휴리스틱 기반 긴급 경로를 선택했습니다.",
                        assumptions,
                        confidence,
                        false,
                        EmergencyFallbackReason.NONE,
                        "",
                        RouteStrategyType.GRAPH_EMERGENCY_SHORTCUT,
                        null,
                        vehicleType.name(),
                        plan.exposedCandidates()
                )
        );
    }

    PlanResult plan(List<RoutePoint> rawStandardPath, long standardDistanceMeters, long standardEtaSeconds, VehicleProfile vehicleProfile) {
        List<RoutePoint> standardPath = RouteGeometryUtils.normalizePath(rawStandardPath);
        if (standardPath.size() < 4 || standardDistanceMeters <= 0 || standardEtaSeconds <= 0) {
            return PlanResult.empty(standardPath);
        }

        double[] cumulativeDistances = buildCumulativeDistances(standardPath);
        double totalPathDistance = cumulativeDistances[cumulativeDistances.length - 1];
        if (totalPathDistance <= 0.0) {
            return PlanResult.empty(standardPath);
        }

        ArrayList<List<Edge>> graph = new ArrayList<>(standardPath.size());
        for (int index = 0; index < standardPath.size(); index++) {
            graph.add(new ArrayList<>());
        }

        for (int index = 0; index < standardPath.size() - 1; index++) {
            double segmentDistance = cumulativeDistances[index + 1] - cumulativeDistances[index];
            if (segmentDistance <= 0.0) {
                continue;
            }

            double segmentEta = (segmentDistance / totalPathDistance) * standardEtaSeconds;
            graph.get(index).add(Edge.standard(index + 1, segmentDistance, segmentEta));
        }

        ArrayList<ShortcutCandidate> shortcutCandidates = generateShortcutCandidates(
                standardPath,
                cumulativeDistances,
                standardDistanceMeters,
                standardEtaSeconds,
                vehicleProfile
        );
        for (ShortcutCandidate candidate : shortcutCandidates) {
            graph.get(candidate.startIndex()).add(
                    Edge.shortcut(candidate.endIndex(), candidate.shortcutDistanceMeters(), candidate.shortcutEtaSeconds(), candidate.score())
            );
        }

        return runDijkstra(standardPath, graph, shortcutCandidates);
    }

    private EmergencyRouteSummary buildEmergencyFallbackRoute(
            RouteSummary standardRoute,
            VehicleType vehicleType,
            int candidateCount,
            String reason
    ) {
        log.warn(
                "route.calculate.emergency.fallback planner=heuristic strategy={} reason={} distanceMeters={} etaSeconds={} pathPointCount={} candidateCount={} vehicleType={}",
                RouteStrategyType.STANDARD_FALLBACK,
                reason,
                standardRoute.distanceMeters(),
                standardRoute.etaSeconds(),
                standardRoute.path().size(),
                candidateCount,
                vehicleType
        );

        return new EmergencyRouteSummary(
                standardRoute.distanceMeters(),
                standardRoute.etaSeconds(),
                standardRoute.path(),
                new EmergencyRouteMeta(
                        RouteStrategyType.STANDARD_FALLBACK,
                        candidateCount,
                        EMERGENCY_WARNING,
                        EMERGENCY_LEGAL_WARNING,
                        reason,
                        buildHeuristicAssumptions(false),
                        calculateFallbackConfidence(candidateCount),
                        false,
                        EmergencyFallbackReason.NONE,
                        "",
                        RouteStrategyType.STANDARD_FALLBACK,
                        null,
                        vehicleType.name(),
                        List.of()
                )
        );
    }

    private List<String> buildHeuristicAssumptions(boolean shortcutSelected) {
        ArrayList<String> assumptions = new ArrayList<>();
        assumptions.add("긴급 주행 상황을 가정하여 신호 대기 영향이 일반 주행보다 낮게 반영됩니다.");
        assumptions.add("버스전용차로와 긴급 진입로는 일반 주행보다 완화된 조건으로 통행 가능하다고 가정합니다.");
        assumptions.add("더 빠른 경로가 추정되는 경우 긴급 경로에서는 유턴 제한이 일부 완화될 수 있다고 가정합니다.");
        assumptions.add("일방통행 도로의 역주행은 이 휴리스틱 모델에서 제외됩니다.");
        assumptions.add(
                shortcutSelected
                        ? "이 경로는 검증된 긴급 도로망 그래프가 아니라 일반 경로 geometry에서 추정한 단축 edge를 사용합니다."
                        : "추정된 긴급 단축 경로를 채택하지 않았기 때문에 일반 카카오 경로를 fallback 경로로 사용합니다."
        );
        return List.copyOf(assumptions);
    }

    private double calculateConfidence(boolean suspiciousDetour, PlanResult plan, boolean shortcutSelected) {
        double confidence = 0.42;
        if (suspiciousDetour) {
            confidence += 0.18;
        }
        if (shortcutSelected) {
            confidence += 0.12;
        }
        if (!plan.exposedCandidates().isEmpty()) {
            confidence += Math.min(0.16, plan.exposedCandidates().size() * 0.03);
        }
        if (plan.turnCount() <= 2) {
            confidence += 0.05;
        }
        return Math.min(0.95, confidence);
    }

    private double calculateFallbackConfidence(int candidateCount) {
        return Math.max(0.2, 0.48 - Math.min(0.18, candidateCount * 0.03));
    }

    private boolean isSuspiciousDetour(double straightLineDistance, RouteSummary standardRoute) {
        if (straightLineDistance <= 0.0) {
            return false;
        }

        double detourRatio = standardRoute.distanceMeters() / straightLineDistance;
        return straightLineDistance <= SHORT_RANGE_THRESHOLD_METERS
                && (detourRatio >= DETOUR_RATIO_THRESHOLD || standardRoute.etaSeconds() >= LONG_ETA_THRESHOLD_SECONDS);
    }

    private ArrayList<ShortcutCandidate> generateShortcutCandidates(
            List<RoutePoint> path,
            double[] cumulativeDistances,
            long standardDistanceMeters,
            long standardEtaSeconds,
            VehicleProfile vehicleProfile
    ) {
        ArrayList<ShortcutCandidate> candidates = new ArrayList<>();
        double shortcutSpeedMultiplier = vehicleProfile.shortcutSpeedMultiplier();
        double shortcutRiskWeight = vehicleProfile.shortcutRiskWeight();
        double dimensionRiskPenalty = vehicleProfile.dimensionRiskPenalty();

        for (int startIndex = 0; startIndex < path.size() - vehicleProfile.minShortcutNodeGap(); startIndex++) {
            for (int endIndex = startIndex + vehicleProfile.minShortcutNodeGap(); endIndex < path.size(); endIndex++) {
                double pathDistanceBetween = cumulativeDistances[endIndex] - cumulativeDistances[startIndex];
                if (pathDistanceBetween <= MIN_SHORTCUT_GAIN_METERS) {
                    continue;
                }

                double directDistance = RouteGeometryUtils.calculateDistanceMeters(path.get(startIndex), path.get(endIndex));
                if (directDistance <= 0.0 || directDistance > vehicleProfile.maxShortcutDistanceMeters()) {
                    continue;
                }

                double gainDistance = pathDistanceBetween - directDistance;
                double gainRatio = pathDistanceBetween / directDistance;
                if (gainDistance < MIN_SHORTCUT_GAIN_METERS || gainRatio < vehicleProfile.minShortcutGainRatio()) {
                    continue;
                }
                if (!isVehicleCompatible(path, startIndex, endIndex, directDistance, vehicleProfile)) {
                    continue;
                }

                double standardSegmentEta = standardEtaSeconds * (pathDistanceBetween / standardDistanceMeters);
                double shortcutEta = Math.max(2.0, standardSegmentEta / shortcutSpeedMultiplier);
                double riskPenalty = directDistance * shortcutRiskWeight + dimensionRiskPenalty;
                double score = shortcutEta + riskPenalty - gainDistance * 0.08;

                candidates.add(new ShortcutCandidate(
                        startIndex,
                        endIndex,
                        directDistance,
                        shortcutEta,
                        gainDistance,
                        gainRatio,
                        score
                ));
            }
        }

        return candidates;
    }

    private boolean isVehicleCompatible(
            List<RoutePoint> path,
            int startIndex,
            int endIndex,
            double directDistance,
            VehicleProfile vehicleProfile
    ) {
        int nodeGap = endIndex - startIndex;
        if (vehicleProfile.vehicleType() == VehicleType.FIRE_TRUCK) {
            if (nodeGap < vehicleProfile.minShortcutNodeGap()) {
                return false;
            }
            if (directDistance < vehicleProfile.minTurnRadiusM() * 2.0) {
                return false;
            }
            double inferredSegmentDensity = nodeGap / Math.max(directDistance, 1.0);
            return inferredSegmentDensity <= 0.12;
        }

        return directDistance >= vehicleProfile.minTurnRadiusM() * 1.8;
    }

    private PlanResult runDijkstra(
            List<RoutePoint> standardPath,
            List<List<Edge>> graph,
            List<ShortcutCandidate> shortcutCandidates
    ) {
        int nodeCount = standardPath.size();
        double[] distance = new double[nodeCount];
        int[] previous = new int[nodeCount];
        Edge[] previousEdge = new Edge[nodeCount];
        Arrays.fill(distance, Double.POSITIVE_INFINITY);
        Arrays.fill(previous, -1);
        distance[0] = 0.0;

        PriorityQueue<State> queue = new PriorityQueue<>(Comparator.comparingDouble(State::cost));
        queue.offer(new State(0, 0.0));

        while (!queue.isEmpty()) {
            State current = queue.poll();
            if (current.cost() > distance[current.nodeIndex()]) {
                continue;
            }
            if (current.nodeIndex() == nodeCount - 1) {
                break;
            }

            for (Edge edge : graph.get(current.nodeIndex())) {
                double nextCost = current.cost() + edge.cost();
                if (nextCost >= distance[edge.toIndex()]) {
                    continue;
                }

                distance[edge.toIndex()] = nextCost;
                previous[edge.toIndex()] = current.nodeIndex();
                previousEdge[edge.toIndex()] = edge;
                queue.offer(new State(edge.toIndex(), nextCost));
            }
        }

        if (!Double.isFinite(distance[nodeCount - 1])) {
            return PlanResult.empty(standardPath);
        }

        ArrayList<RoutePoint> route = new ArrayList<>();
        ArrayList<ShortcutCandidate> usedShortcuts = new ArrayList<>();
        int cursor = nodeCount - 1;
        route.add(standardPath.get(cursor));

        while (cursor > 0) {
            Edge edge = previousEdge[cursor];
            int parent = previous[cursor];
            if (edge == null || parent < 0) {
                return PlanResult.empty(standardPath);
            }

            if (edge.shortcut()) {
                usedShortcuts.add(resolveShortcut(parent, cursor, shortcutCandidates));
            }

            route.add(standardPath.get(parent));
            cursor = parent;
        }

        List<RoutePoint> plannedPath = route.reversed();
        long distanceMeters = Math.round(calculatePathDistance(plannedPath));
        long etaSeconds = Math.max(1L, Math.round(distance[nodeCount - 1]));
        int turnCount = RouteGeometryUtils.estimateTurnCount(plannedPath);

        List<CandidateRouteSummary> exposedCandidates = shortcutCandidates.stream()
                .sorted(Comparator.comparingDouble(ShortcutCandidate::score))
                .limit(MAX_EXPOSED_CANDIDATES)
                .map(candidate -> new CandidateRouteSummary(
                        standardPath.get(candidate.endIndex()),
                        Math.round(candidate.pathDistanceSavedMeters() + candidate.shortcutDistanceMeters()),
                        Math.max(1L, Math.round(candidate.shortcutEtaSeconds())),
                        candidate.shortcutDistanceMeters(),
                        1,
                        candidate.score()
                ))
                .toList();

        return new PlanResult(
                plannedPath,
                distanceMeters,
                etaSeconds,
                turnCount,
                List.copyOf(usedShortcuts.reversed()),
                exposedCandidates
        );
    }

    private ShortcutCandidate resolveShortcut(int startIndex, int endIndex, List<ShortcutCandidate> candidates) {
        return candidates.stream()
                .filter(candidate -> candidate.startIndex() == startIndex && candidate.endIndex() == endIndex)
                .findFirst()
                .orElseThrow();
    }

    private double[] buildCumulativeDistances(List<RoutePoint> path) {
        double[] cumulativeDistances = new double[path.size()];
        for (int index = 1; index < path.size(); index++) {
            cumulativeDistances[index] = cumulativeDistances[index - 1]
                    + RouteGeometryUtils.calculateDistanceMeters(path.get(index - 1), path.get(index));
        }
        return cumulativeDistances;
    }

    private double calculatePathDistance(List<RoutePoint> path) {
        double total = 0.0;
        for (int index = 0; index < path.size() - 1; index++) {
            total += RouteGeometryUtils.calculateDistanceMeters(path.get(index), path.get(index + 1));
        }
        return total;
    }

    record PlanResult(
            List<RoutePoint> path,
            long distanceMeters,
            long etaSeconds,
            int turnCount,
            List<ShortcutCandidate> usedShortcuts,
            List<CandidateRouteSummary> exposedCandidates
    ) {
        static PlanResult empty(List<RoutePoint> standardPath) {
            return new PlanResult(standardPath, 0L, 0L, 0, List.of(), List.of());
        }

        boolean hasShortcut() {
            return !usedShortcuts.isEmpty();
        }
    }

    record ShortcutCandidate(
            int startIndex,
            int endIndex,
            double shortcutDistanceMeters,
            double shortcutEtaSeconds,
            double pathDistanceSavedMeters,
            double gainRatio,
            double score
    ) {
    }

    private record Edge(
            int toIndex,
            double distanceMeters,
            double cost,
            boolean shortcut
    ) {
        private static Edge standard(int toIndex, double distanceMeters, double etaSeconds) {
            return new Edge(toIndex, distanceMeters, etaSeconds, false);
        }

        private static Edge shortcut(int toIndex, double distanceMeters, double etaSeconds, double score) {
            return new Edge(toIndex, distanceMeters, Math.max(1.0, etaSeconds + Math.max(0.0, score * 0.15)), true);
        }
    }

    private record State(int nodeIndex, double cost) {
    }
}
