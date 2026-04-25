package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.dto.EmergencyFallbackReason;
import com.rescuenav.backend.route.dto.EmergencyRouteSummary;

record EmergencyRoutePlanResult(
        EmergencyRouteSummary route,
        EmergencyFallbackReason fallbackReason,
        String fallbackMessage
) {

    static EmergencyRoutePlanResult success(EmergencyRouteSummary route) {
        return new EmergencyRoutePlanResult(route, EmergencyFallbackReason.NONE, "");
    }

    static EmergencyRoutePlanResult failure(EmergencyFallbackReason reason, String message) {
        return new EmergencyRoutePlanResult(null, reason, message);
    }

    boolean succeeded() {
        return route != null;
    }
}
