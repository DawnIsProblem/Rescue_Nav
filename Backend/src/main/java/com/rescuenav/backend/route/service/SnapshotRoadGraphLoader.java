package com.rescuenav.backend.route.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rescuenav.backend.route.config.RouteGraphProperties;
import com.rescuenav.backend.route.dto.RoutePoint;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.zip.GZIPInputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
class SnapshotRoadGraphLoader implements RoadGraphLoader {

    private final ObjectMapper objectMapper;
    private final RouteGraphProperties routeGraphProperties;
    private volatile RoadGraphSnapshot cachedGraph;

    @Override
    public Optional<RoadGraphSnapshot> loadActiveGraph() {
        if (!routeGraphProperties.enabled()) {
            return Optional.empty();
        }
        if (!"snapshot".equalsIgnoreCase(routeGraphProperties.source())) {
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
            cachedGraph = loadGraph(Path.of(routeGraphProperties.snapshotPath()));
            return Optional.ofNullable(cachedGraph);
        }
    }

    private RoadGraphSnapshot loadGraph(Path snapshotPath) {
        if (routeGraphProperties.snapshotPath().isBlank()) {
            log.warn("route.graph.snapshot.skipped reason=emptySnapshotPath");
            return null;
        }
        if (!Files.exists(snapshotPath)) {
            log.warn("route.graph.snapshot.skipped reason=missingFile snapshotPath={}", snapshotPath);
            return null;
        }

        long startedAt = System.currentTimeMillis();
        log.info("route.graph.snapshot.load.start snapshotPath={}", snapshotPath);
        try (InputStream fileInputStream = Files.newInputStream(snapshotPath);
             InputStream inputStream = snapshotPath.toString().endsWith(".gz")
                     ? new GZIPInputStream(fileInputStream)
                     : fileInputStream) {
            JsonNode root = objectMapper.readTree(inputStream);
            RoadGraphSnapshot graph = parseSnapshot(root);
            log.info(
                    "route.graph.snapshot.load.success snapshotPath={} versionId={} nodeCount={} edgeCount={} adjacencySourceCount={} elapsedMs={} elapsedSeconds={}",
                    snapshotPath,
                    root.path("versionId").asText(""),
                    graph.nodes().size(),
                    graph.edgeCount(),
                    graph.adjacency().size(),
                    System.currentTimeMillis() - startedAt,
                    String.format("%.2f", (System.currentTimeMillis() - startedAt) / 1000.0)
            );
            return graph;
        } catch (IOException exception) {
            log.warn("route.graph.snapshot.load.failed snapshotPath={} message={}", snapshotPath, exception.getMessage());
            return null;
        }
    }

    private RoadGraphSnapshot parseSnapshot(JsonNode root) {
        Map<String, RoadGraphSnapshot.GraphNode> nodes = new HashMap<>();
        for (JsonNode row : root.path("nodes")) {
            RoadGraphSnapshot.GraphNode node = new RoadGraphSnapshot.GraphNode(
                    row.path("id").asText(),
                    new RoutePoint(row.path("lat").asDouble(), row.path("lng").asDouble()),
                    row.path("type").asText("INTERSECTION"),
                    row.path("signalized").asBoolean(false),
                    row.path("emergencyUTurnPermitted").asBoolean(false),
                    row.path("fireAccessEntry").asBoolean(false)
            );
            nodes.put(node.id(), node);
        }

        Map<String, List<RoadGraphSnapshot.GraphEdge>> adjacency = new HashMap<>();
        for (JsonNode row : root.path("edges")) {
            RoadGraphSnapshot.GraphNode fromNode = nodes.get(row.path("from").asText());
            RoadGraphSnapshot.GraphNode toNode = nodes.get(row.path("to").asText());
            if (fromNode == null || toNode == null) {
                continue;
            }
            RoadGraphSnapshot.GraphEdge edge = new RoadGraphSnapshot.GraphEdge(
                    row.path("id").asText(),
                    row.path("from").asText(),
                    row.path("to").asText(),
                    fromNode.point(),
                    toNode.point(),
                    row.path("lengthMeters").asDouble(),
                    row.path("baseSpeedKph").asDouble(),
                    row.path("emergencySpeedKph").asDouble(),
                    row.path("turnPenaltySeconds").asDouble(0.0),
                    row.path("signalPenaltySeconds").asDouble(0.0),
                    row.path("busLane").asBoolean(false),
                    row.path("busLaneAllowedEmergency").asBoolean(false),
                    row.path("fireAccessRoad").asBoolean(false),
                    row.path("uTurnEdge").asBoolean(false),
                    row.path("uTurnAllowedEmergency").asBoolean(false),
                    row.path("blockedForFireTruck").asBoolean(false),
                    row.path("blockedForAmbulance").asBoolean(false),
                    row.path("emergencyPreferred").asBoolean(false),
                    row.path("roadType").asText("road")
            );
            adjacency.computeIfAbsent(edge.fromNodeId(), ignored -> new ArrayList<>()).add(edge);
        }

        Map<String, List<RoadGraphSnapshot.GraphEdge>> immutableAdjacency = new HashMap<>();
        for (Map.Entry<String, List<RoadGraphSnapshot.GraphEdge>> entry : adjacency.entrySet()) {
            immutableAdjacency.put(entry.getKey(), List.copyOf(entry.getValue()));
        }
        return new RoadGraphSnapshot(Map.copyOf(nodes), Map.copyOf(immutableAdjacency));
    }
}
