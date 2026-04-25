package com.rescuenav.backend.route.dto;

import java.util.List;

public record EmergencyRouteSummary(
        long distanceMeters,
        long etaSeconds,
        List<RoutePoint> path,
        EmergencyRouteMeta meta
) {

    public EmergencyRouteSummary withFallback(
            EmergencyFallbackReason fallbackReason,
            String fallbackMessage,
            RouteStrategyType primaryStrategy
    ) {
        return new EmergencyRouteSummary(
                distanceMeters,
                etaSeconds,
                path,
                new EmergencyRouteMeta(
                        meta.strategy(),
                        meta.candidateCount(),
                        meta.warning(),
                        meta.legalWarning(),
                        meta.reason(),
                        meta.assumptions(),
                        meta.confidence(),
                        true,
                        fallbackReason,
                        fallbackMessage,
                        primaryStrategy,
                        meta.strategy(),
                        meta.vehicleType(),
                        meta.evaluatedCandidates()
                )
        );
    }
}
