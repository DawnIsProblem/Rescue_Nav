package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.config.RouteGraphProperties;
import com.rescuenav.backend.route.dto.RoutePoint;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RoadGraphWarmupTest {

    @Test
    void shouldLoadGraphOnceWhenPreloadEnabled() {
        AtomicInteger invocationCount = new AtomicInteger();
        RoadGraphLoader loader = () -> {
            invocationCount.incrementAndGet();
            return Optional.of(new RoadGraphSnapshot(
                    Map.of("n1", new RoadGraphSnapshot.GraphNode("n1", new RoutePoint(35.95, 126.96), "INTERSECTION", false, false, false)),
                    Map.of("n1", List.of())
            ));
        };
        RouteGraphProperties properties = new RouteGraphProperties(
                true,
                "supabase",
                true,
                "",
                "",
                "http://localhost",
                "test-key",
                1000,
                5000L,
                5,
                1500.0,
                0.6,
                1.8
        );
        RoadGraphWarmup warmup = new RoadGraphWarmup(loader, properties);

        warmup.warmUpOnStartup();

        assertEquals(1, invocationCount.get());
    }

    @Test
    void shouldSkipWarmupWhenPreloadDisabled() {
        AtomicInteger invocationCount = new AtomicInteger();
        RoadGraphLoader loader = () -> {
            invocationCount.incrementAndGet();
            return Optional.empty();
        };
        RouteGraphProperties properties = new RouteGraphProperties(
                true,
                "supabase",
                false,
                "",
                "",
                "http://localhost",
                "test-key",
                1000,
                5000L,
                5,
                1500.0,
                0.6,
                1.8
        );
        RoadGraphWarmup warmup = new RoadGraphWarmup(loader, properties);

        warmup.warmUpOnStartup();

        assertEquals(0, invocationCount.get());
    }
}
