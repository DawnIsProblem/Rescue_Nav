package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.dto.EmergencyRouteSummary;
import com.rescuenav.backend.route.dto.RouteStrategyType;
import com.rescuenav.backend.route.dto.RouteCalculationResponse;
import com.rescuenav.backend.route.dto.RoutePoint;
import com.rescuenav.backend.route.dto.RouteSummary;
import com.rescuenav.backend.route.dto.VehicleType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
@RequiredArgsConstructor
@Slf4j
class CompositeEmergencyRoutePlanner implements EmergencyRoutePlanner {

    private final OsmGraphEmergencyRoutePlanner osmGraphEmergencyRoutePlanner;
    private final HeuristicEmergencyRoutePlanner heuristicEmergencyRoutePlanner;

    @Override
    public EmergencyRouteSummary calculate(
            RoutePoint origin,
            RouteCalculationResponse.ResolvedDestination destination,
            RouteSummary standardRoute,
            VehicleType vehicleType,
            VehicleProfile vehicleProfile
    ) {
        EmergencyRoutePlanResult graphResult = osmGraphEmergencyRoutePlanner.calculateWithResult(
                origin,
                destination,
                standardRoute,
                vehicleType,
                vehicleProfile
        );
        if (graphResult.succeeded()) {
            return graphResult.route();
        }

        log.warn(
                "route.calculate.emergency.primary.failed primaryStrategy={} reason={} message={}",
                RouteStrategyType.OSM_GRAPH_ASTAR,
                graphResult.fallbackReason(),
                graphResult.fallbackMessage()
        );

        EmergencyRouteSummary fallbackRoute = heuristicEmergencyRoutePlanner.calculate(
                origin,
                destination,
                standardRoute,
                vehicleType,
                vehicleProfile
        );
        log.warn(
                "route.calculate.emergency.fallback.selected primaryStrategy={} fallbackStrategy={} reason={}",
                RouteStrategyType.OSM_GRAPH_ASTAR,
                fallbackRoute.meta().strategy(),
                graphResult.fallbackReason()
        );
        return fallbackRoute.withFallback(
                graphResult.fallbackReason(),
                graphResult.fallbackMessage(),
                RouteStrategyType.OSM_GRAPH_ASTAR
        );
    }
}
