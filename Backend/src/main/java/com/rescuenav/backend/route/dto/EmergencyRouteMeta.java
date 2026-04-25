package com.rescuenav.backend.route.dto;

import java.util.List;

public record EmergencyRouteMeta(
        RouteStrategyType strategy,
        int candidateCount,
        String warning,
        String legalWarning,
        String reason,
        java.util.List<String> assumptions,
        Double confidence,
        boolean fallbackUsed,
        EmergencyFallbackReason fallbackReason,
        String fallbackMessage,
        RouteStrategyType primaryStrategy,
        RouteStrategyType fallbackStrategy,
        String vehicleType,
        List<CandidateRouteSummary> evaluatedCandidates
) {
}
