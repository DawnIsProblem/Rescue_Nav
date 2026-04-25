package com.rescuenav.backend.route.dto;

public record CandidateRouteSummary(
        RoutePoint targetPoint,
        long distanceMeters,
        long etaSeconds,
        double finalApproachDistanceMeters,
        int turnCount,
        double score
) {
}
