package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.dto.RoutePoint;
import com.rescuenav.backend.route.dto.VehicleType;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HeuristicEmergencyRoutePlannerTest {

    private final HeuristicEmergencyRoutePlanner planner = new HeuristicEmergencyRoutePlanner();

    @Test
    void shouldUseEmergencyShortcutWhenLoopCreatesLargeDetour() {
        List<RoutePoint> path = List.of(
                new RoutePoint(37.0, 127.0),
                new RoutePoint(37.0, 127.00030),
                new RoutePoint(37.00045, 127.00030),
                new RoutePoint(37.00045, 126.99955),
                new RoutePoint(37.0, 126.99955),
                new RoutePoint(37.0, 127.00005)
        );

        long standardDistance = Math.round(totalDistance(path));
        HeuristicEmergencyRoutePlanner.PlanResult plan = planner.plan(
                path,
                standardDistance,
                150L,
                VehicleProfile.from(VehicleType.FIRE_TRUCK)
        );

        assertTrue(plan.hasShortcut());
        assertTrue(plan.distanceMeters() < standardDistance);
        assertTrue(plan.path().size() < path.size());
    }

    @Test
    void shouldKeepStandardPathWhenNoMeaningfulShortcutExists() {
        List<RoutePoint> path = List.of(
                new RoutePoint(37.0, 127.0),
                new RoutePoint(37.0, 127.00010),
                new RoutePoint(37.0, 127.00020),
                new RoutePoint(37.0, 127.00030),
                new RoutePoint(37.0, 127.00040)
        );

        long standardDistance = Math.round(totalDistance(path));
        HeuristicEmergencyRoutePlanner.PlanResult plan = planner.plan(
                path,
                standardDistance,
                60L,
                VehicleProfile.from(VehicleType.AMBULANCE)
        );

        assertFalse(plan.hasShortcut());
        assertTrue(plan.path().equals(path));
    }

    private double totalDistance(List<RoutePoint> path) {
        double total = 0.0;
        for (int index = 0; index < path.size() - 1; index++) {
            total += RouteGeometryUtils.calculateDistanceMeters(path.get(index), path.get(index + 1));
        }
        return total;
    }
}
