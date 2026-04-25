package com.rescuenav.backend.route.dto;

public record RouteCalculationResponse(
        RoutePoint origin,
        ResolvedDestination destination,
        RouteSummary standardRoute,
        EmergencyRouteSummary emergencyRoute
) {

    public record ResolvedDestination(
            String address,
            String zonecode,
            double lat,
            double lng
    ) {
    }
}
