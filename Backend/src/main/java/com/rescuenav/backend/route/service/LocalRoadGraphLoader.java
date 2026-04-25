package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.config.RouteGraphProperties;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
class LocalRoadGraphLoader implements RoadGraphLoader {

    private final RouteGraphProperties routeGraphProperties;
    private volatile RoadGraphSnapshot cachedGraph;

    @Override
    public Optional<RoadGraphSnapshot> loadActiveGraph() {
        if (!routeGraphProperties.enabled()) {
            return Optional.empty();
        }
        if (!"local".equalsIgnoreCase(routeGraphProperties.source())) {
            return Optional.empty();
        }

        RoadGraphSnapshot localCache = cachedGraph;
        if (localCache != null) {
            return Optional.of(localCache);
        }

        synchronized (this) {
            if (cachedGraph != null) {
                return Optional.of(cachedGraph);
            }
            cachedGraph = loadGraphFromDirectory(Path.of(routeGraphProperties.dataDir()));
            return Optional.ofNullable(cachedGraph);
        }
    }

    private RoadGraphSnapshot loadGraphFromDirectory(Path dataDirectory) {
        if (routeGraphProperties.dataDir() == null || routeGraphProperties.dataDir().isBlank()) {
            log.warn("route.graph.load.skipped reason=emptyDataDir");
            return null;
        }
        Path nodesPath = dataDirectory.resolve("road_graph_nodes.csv");
        Path edgesPath = dataDirectory.resolve("road_graph_edges.csv");
        if (!Files.exists(nodesPath) || !Files.exists(edgesPath)) {
            log.warn("route.graph.load.skipped reason=missingFiles dataDir={}", dataDirectory);
            return null;
        }

        try {
            var nodes = CsvRoadGraphParser.parseNodes(Files.readAllLines(nodesPath, StandardCharsets.UTF_8));
            var adjacency = CsvRoadGraphParser.parseEdges(Files.readAllLines(edgesPath, StandardCharsets.UTF_8), nodes);
            log.info(
                    "route.graph.load.success dataDir={} nodeCount={} adjacencySourceCount={}",
                    dataDirectory,
                    nodes.size(),
                    adjacency.size()
            );
            return new RoadGraphSnapshot(nodes, adjacency);
        } catch (IOException exception) {
            log.warn("route.graph.load.failed dataDir={} message={}", dataDirectory, exception.getMessage());
            return null;
        }
    }
}
