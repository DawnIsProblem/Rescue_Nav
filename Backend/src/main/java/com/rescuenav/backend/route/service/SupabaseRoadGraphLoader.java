package com.rescuenav.backend.route.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.rescuenav.backend.route.config.RouteGraphProperties;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
@Slf4j
class SupabaseRoadGraphLoader implements RoadGraphLoader {

    private final WebClient.Builder webClientBuilder;
    private final RouteGraphProperties routeGraphProperties;
    private volatile RoadGraphSnapshot cachedGraph;
    private volatile String cachedVersionId;

    @Override
    public Optional<RoadGraphSnapshot> loadActiveGraph() {
        if (!routeGraphProperties.enabled()) {
            return Optional.empty();
        }
        if (!"supabase".equalsIgnoreCase(routeGraphProperties.source())) {
            return Optional.empty();
        }
        if (routeGraphProperties.supabaseUrl() == null || routeGraphProperties.supabaseUrl().isBlank()
                || routeGraphProperties.supabaseKey() == null || routeGraphProperties.supabaseKey().isBlank()) {
            log.warn("route.graph.supabase.skipped reason=missingCredentials");
            return Optional.empty();
        }

        log.info(
                "route.graph.supabase.load.start baseUrl={} pageSize={} timeoutMillis={}",
                routeGraphProperties.supabaseUrl(),
                routeGraphProperties.supabasePageSize(),
                routeGraphProperties.supabaseTimeoutMillis()
        );
        String activeVersionId = fetchActiveVersionId();
        if (activeVersionId == null || activeVersionId.isBlank()) {
            return Optional.empty();
        }

        if (activeVersionId.equals(cachedVersionId) && cachedGraph != null) {
            return Optional.of(cachedGraph);
        }

        synchronized (this) {
            if (activeVersionId.equals(cachedVersionId) && cachedGraph != null) {
                return Optional.of(cachedGraph);
            }
            RoadGraphSnapshot loadedGraph = fetchGraph(activeVersionId);
            if (loadedGraph == null) {
                return Optional.empty();
            }
            cachedVersionId = activeVersionId;
            cachedGraph = loadedGraph;
            return Optional.of(loadedGraph);
        }
    }

    private String fetchActiveVersionId() {
        long startedAt = System.currentTimeMillis();
        log.info("route.graph.supabase.activeVersion.fetch.start");
        JsonNode payload = webClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/rest/v1/road_graph_version")
                        .queryParam("select", "version_id,version_name")
                        .queryParam("is_active", "eq.true")
                        .queryParam("import_status", "eq.READY")
                        .queryParam("limit", "1")
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofMillis(routeGraphProperties.supabaseTimeoutMillis()))
                .block();

        if (payload == null || !payload.isArray() || payload.isEmpty()) {
            log.warn("route.graph.supabase.activeVersion.missing");
            return null;
        }
        String versionId = payload.get(0).path("version_id").asText();
        log.info(
                "route.graph.supabase.activeVersion.fetch.success versionId={} elapsedMs={}",
                versionId,
                System.currentTimeMillis() - startedAt
        );
        return versionId;
    }

    private RoadGraphSnapshot fetchGraph(String versionId) {
        log.info("route.graph.supabase.graph.fetch.start versionId={}", versionId);
        List<JsonNode> nodeRows = fetchPagedRows("road_graph_nodes", nodeSelect(), versionId);
        List<JsonNode> edgeRows = fetchPagedRows("road_graph_edges", edgeSelect(), versionId);
        if (nodeRows.isEmpty() || edgeRows.isEmpty()) {
            log.warn("route.graph.supabase.empty versionId={} nodeCount={} edgeCount={}", versionId, nodeRows.size(), edgeRows.size());
            return null;
        }

        Map<String, RoadGraphSnapshot.GraphNode> nodes = new HashMap<>();
        for (JsonNode row : nodeRows) {
            RoadGraphSnapshot.GraphNode node = new RoadGraphSnapshot.GraphNode(
                    row.path("node_id").asText(),
                    new com.rescuenav.backend.route.dto.RoutePoint(
                            row.path("lat").asDouble(),
                            row.path("lng").asDouble()
                    ),
                    row.path("node_type").asText("INTERSECTION"),
                    row.path("signalized").asBoolean(false),
                    row.path("u_turn_permitted_emergency").asBoolean(false),
                    row.path("fire_access_entry").asBoolean(false)
            );
            nodes.put(node.id(), node);
        }

        Map<String, List<RoadGraphSnapshot.GraphEdge>> adjacency = new HashMap<>();
        for (JsonNode row : edgeRows) {
            RoadGraphSnapshot.GraphNode fromNode = nodes.get(row.path("from_node_id").asText());
            RoadGraphSnapshot.GraphNode toNode = nodes.get(row.path("to_node_id").asText());
            if (fromNode == null || toNode == null) {
                continue;
            }
            RoadGraphSnapshot.GraphEdge edge = new RoadGraphSnapshot.GraphEdge(
                    row.path("edge_id").asText(),
                    row.path("from_node_id").asText(),
                    row.path("to_node_id").asText(),
                    fromNode.point(),
                    toNode.point(),
                    row.path("length_meters").asDouble(),
                    row.path("base_speed_kph").asDouble(),
                    row.path("emergency_speed_kph").asDouble(),
                    row.path("turn_penalty_seconds").asDouble(0.0),
                    row.path("signal_penalty_seconds").asDouble(0.0),
                    row.path("bus_lane").asBoolean(false),
                    row.path("bus_lane_allowed_emergency").asBoolean(false),
                    row.path("fire_access_road").asBoolean(false),
                    row.path("u_turn_edge").asBoolean(false),
                    row.path("u_turn_allowed_emergency").asBoolean(false),
                    row.path("blocked_for_fire_truck").asBoolean(false),
                    row.path("blocked_for_ambulance").asBoolean(false),
                    row.path("is_emergency_preferred").asBoolean(false),
                    row.path("road_type").asText("road")
            );
            adjacency.computeIfAbsent(edge.fromNodeId(), ignored -> new ArrayList<>()).add(edge);
        }

        Map<String, List<RoadGraphSnapshot.GraphEdge>> immutableAdjacency = new HashMap<>();
        for (Map.Entry<String, List<RoadGraphSnapshot.GraphEdge>> entry : adjacency.entrySet()) {
            immutableAdjacency.put(entry.getKey(), List.copyOf(entry.getValue()));
        }
        int edgeCount = immutableAdjacency.values().stream()
                .mapToInt(List::size)
                .sum();
        log.info(
                "route.graph.supabase.load.success versionId={} nodeCount={} edgeCount={} adjacencySourceCount={}",
                versionId,
                nodes.size(),
                edgeCount,
                immutableAdjacency.size()
        );
        return new RoadGraphSnapshot(Map.copyOf(nodes), Map.copyOf(immutableAdjacency));
    }

    private List<JsonNode> fetchPagedRows(String tableName, String selectClause, String versionId) {
        ArrayList<JsonNode> rows = new ArrayList<>();
        int offset = 0;
        int pageSize = routeGraphProperties.supabasePageSize();
        long startedAt = System.currentTimeMillis();
        int pageCount = 0;

        while (true) {
            int currentOffset = offset;
            pageCount++;
            boolean shouldLogPage = shouldLogPage(pageCount);
            if (shouldLogPage) {
                log.info(
                        "route.graph.supabase.page.fetch.start table={} versionId={} page={} offset={} limit={}",
                        tableName,
                        versionId,
                        pageCount,
                        currentOffset,
                        pageSize
                );
            }
            List<JsonNode> page = webClient()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/rest/v1/" + tableName)
                            .queryParam("select", selectClause)
                            .queryParam("version_id", "eq." + versionId)
                            .queryParam("order", tableName.equals("road_graph_nodes") ? "node_id.asc" : "edge_id.asc")
                            .queryParam("limit", pageSize)
                            .queryParam("offset", currentOffset)
                            .build())
                    .retrieve()
                    .bodyToFlux(JsonNode.class)
                    .timeout(Duration.ofMillis(routeGraphProperties.supabaseTimeoutMillis()))
                    .collectList()
                    .block();

            if (page == null || page.isEmpty()) {
                log.info(
                        "route.graph.supabase.page.fetch.empty table={} versionId={} offset={} pageCount={} elapsedMs={}",
                        tableName,
                        versionId,
                        currentOffset,
                        pageCount,
                        System.currentTimeMillis() - startedAt
                );
                break;
            }
            if (shouldLogPage) {
                log.info(
                        "route.graph.supabase.page.fetch.success table={} versionId={} page={} offset={} rowCount={} totalRowsSoFar={}",
                        tableName,
                        versionId,
                        pageCount,
                        currentOffset,
                        page.size(),
                        rows.size() + page.size()
                );
            }
            if (pageCount == 1 && page.size() < pageSize) {
                log.info(
                        "route.graph.supabase.page.fetch.capped table={} requestedLimit={} actualFirstPageRows={} note=continuingUntilEmptyPage",
                        tableName,
                        pageSize,
                        page.size()
                );
            }
            rows.addAll(page);
            offset += page.size();
        }

        log.info(
                "route.graph.supabase.rows.fetch.complete table={} versionId={} totalRows={} pageCount={} elapsedMs={}",
                tableName,
                versionId,
                rows.size(),
                pageCount,
                System.currentTimeMillis() - startedAt
        );
        return List.copyOf(rows);
    }

    private boolean shouldLogPage(int pageCount) {
        return pageCount == 1 || pageCount % 10 == 0;
    }

    private WebClient webClient() {
        return webClientBuilder
                .baseUrl(routeGraphProperties.supabaseUrl())
                .defaultHeader("apikey", routeGraphProperties.supabaseKey())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + routeGraphProperties.supabaseKey())
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private String nodeSelect() {
        return "node_id,lat,lng,node_type,signalized,u_turn_permitted_emergency,fire_access_entry";
    }

    private String edgeSelect() {
        return "edge_id,from_node_id,to_node_id,length_meters,base_speed_kph,emergency_speed_kph,turn_penalty_seconds,signal_penalty_seconds,bus_lane,bus_lane_allowed_emergency,fire_access_road,u_turn_edge,u_turn_allowed_emergency,blocked_for_fire_truck,blocked_for_ambulance,is_emergency_preferred,road_type";
    }
}
