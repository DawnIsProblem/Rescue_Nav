package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.dto.EmergencyRouteSummary;
import com.rescuenav.backend.route.dto.RouteCalculationResponse;
import com.rescuenav.backend.route.dto.RoutePoint;
import com.rescuenav.backend.route.dto.RouteSummary;
import com.rescuenav.backend.route.dto.VehicleType;

public interface EmergencyRoutePlanner {

    EmergencyRouteSummary calculate(
            RoutePoint origin,
            RouteCalculationResponse.ResolvedDestination destination,
            RouteSummary standardRoute,
            VehicleType vehicleType,
            VehicleProfile vehicleProfile
    );
}
