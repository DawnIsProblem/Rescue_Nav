package com.rescuenav.backend.route.dto;

import java.util.List;

public record RouteSummary(
        long distanceMeters,
        long etaSeconds,
        List<RoutePoint> path
) {
}
