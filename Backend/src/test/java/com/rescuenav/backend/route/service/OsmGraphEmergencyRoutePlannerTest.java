package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.config.RouteGraphProperties;
import com.rescuenav.backend.route.dto.EmergencyRouteSummary;
import com.rescuenav.backend.route.dto.RouteCalculationResponse;
import com.rescuenav.backend.route.dto.RoutePoint;
import com.rescuenav.backend.route.dto.RouteStrategyType;
import com.rescuenav.backend.route.dto.RouteSummary;
import com.rescuenav.backend.route.dto.VehicleType;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OsmGraphEmergencyRoutePlannerTest {

    @Test
    void shouldBuildEmergencyRouteFromLocalGraph() throws Exception {
        RouteGraphProperties properties = new RouteGraphProperties(
                true,
                "local",
                false,
                sampleGraphPath().toString(),
                "",
                "",
                "",
                1000,
                5000L,
                5,
                1_500.0,
                0.6,
                1.8
        );
        LocalRoadGraphLoader loader = new LocalRoadGraphLoader(properties);
        OsmGraphEmergencyRoutePlanner planner = new OsmGraphEmergencyRoutePlanner(loader, properties);

        Optional<EmergencyRouteSummary> route = planner.calculateIfAvailable(
                new RoutePoint(35.950000, 126.960000),
                new RouteCalculationResponse.ResolvedDestination("sample", "54500", 35.948500, 126.964000),
                new RouteSummary(
                        650,
                        120,
                        List.of(
                                new RoutePoint(35.950000, 126.960000),
                                new RoutePoint(35.950000, 126.962000),
                                new RoutePoint(35.948500, 126.964000)
                        )
                ),
                VehicleType.FIRE_TRUCK,
                VehicleProfile.from(VehicleType.FIRE_TRUCK)
        );

        assertTrue(route.isPresent());
        assertEquals(RouteStrategyType.OSM_GRAPH_ASTAR, route.get().meta().strategy());
        assertTrue(route.get().distanceMeters() > 0);
        assertTrue(route.get().etaSeconds() > 0);
        assertTrue(route.get().path().size() >= 3);
    }

    @Test
    void shouldReturnEmptyWhenGraphIsDisabled() throws Exception {
        RouteGraphProperties properties = new RouteGraphProperties(
                false,
                "local",
                false,
                sampleGraphPath().toString(),
                "",
                "",
                "",
                1000,
                5000L,
                5,
                1_500.0,
                0.6,
                1.8
        );
        LocalRoadGraphLoader loader = new LocalRoadGraphLoader(properties);
        OsmGraphEmergencyRoutePlanner planner = new OsmGraphEmergencyRoutePlanner(loader, properties);

        Optional<EmergencyRouteSummary> route = planner.calculateIfAvailable(
                new RoutePoint(35.950000, 126.960000),
                new RouteCalculationResponse.ResolvedDestination("sample", "54500", 35.948500, 126.964000),
                new RouteSummary(100, 50, List.of(new RoutePoint(35.95, 126.96), new RoutePoint(35.9485, 126.964))),
                VehicleType.AMBULANCE,
                VehicleProfile.from(VehicleType.AMBULANCE)
        );

        assertTrue(route.isEmpty());
    }

    private Path sampleGraphPath() throws URISyntaxException {
        return Path.of(getClass().getResource("/graph/sample").toURI());
    }
}
