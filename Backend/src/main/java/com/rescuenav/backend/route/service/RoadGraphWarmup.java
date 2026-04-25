package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.config.RouteGraphProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
class RoadGraphWarmup {

    private final RoadGraphLoader roadGraphLoader;
    private final RouteGraphProperties routeGraphProperties;

    @EventListener(ApplicationReadyEvent.class)
    public void warmUpOnStartup() {
        if (!routeGraphProperties.enabled()) {
            log.info("route.graph.warmup.skipped reason=graphDisabled");
            return;
        }
        if (!routeGraphProperties.preloadOnStartup()) {
            log.info("route.graph.warmup.skipped reason=preloadDisabled");
            return;
        }

        long startedAt = System.currentTimeMillis();
        log.info("route.graph.warmup.start source={}", routeGraphProperties.source());
        var graph = roadGraphLoader.loadActiveGraph();
        long elapsedMs = System.currentTimeMillis() - startedAt;

        if (graph.isPresent()) {
            RoadGraphSnapshot snapshot = graph.get();
            log.info(
                    "route.graph.warmup.success source={} elapsedMs={} elapsedSeconds={} nodeCount={} edgeCount={} adjacencySourceCount={}",
                    routeGraphProperties.source(),
                    elapsedMs,
                    String.format("%.2f", elapsedMs / 1000.0),
                    snapshot.nodes().size(),
                    snapshot.edgeCount(),
                    snapshot.adjacency().size()
            );
            return;
        }

        log.warn(
                "route.graph.warmup.failed source={} elapsedMs={}",
                routeGraphProperties.source(),
                elapsedMs
        );
    }
}
