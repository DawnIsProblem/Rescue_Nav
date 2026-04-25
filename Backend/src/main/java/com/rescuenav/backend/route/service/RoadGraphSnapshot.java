package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.dto.RoutePoint;
import java.util.Collection;
import java.util.List;
import java.util.Map;

record RoadGraphSnapshot(
        Map<String, GraphNode> nodes,
        Map<String, List<GraphEdge>> adjacency
) {
    Collection<GraphNode> nodeValues() {
        return nodes.values();
    }

    List<GraphEdge> outgoingEdges(String nodeId) {
        return adjacency.getOrDefault(nodeId, List.of());
    }

    int edgeCount() {
        return adjacency.values().stream()
                .mapToInt(List::size)
                .sum();
    }

    record GraphNode(
            String id,
            RoutePoint point,
            String nodeType,
            boolean signalized,
            boolean emergencyUTurnPermitted,
            boolean fireAccessEntry
    ) {
    }

    record GraphEdge(
            String id,
            String fromNodeId,
            String toNodeId,
            RoutePoint fromPoint,
            RoutePoint toPoint,
            double lengthMeters,
            double baseSpeedKph,
            double emergencySpeedKph,
            double turnPenaltySeconds,
            double signalPenaltySeconds,
            boolean busLane,
            boolean busLaneAllowedEmergency,
            boolean fireAccessRoad,
            boolean uTurnEdge,
            boolean uTurnAllowedEmergency,
            boolean blockedForFireTruck,
            boolean blockedForAmbulance,
            boolean emergencyPreferred,
            String roadType
    ) {
    }
}
