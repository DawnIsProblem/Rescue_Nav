package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.config.RouteGraphProperties;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SupabaseRoadGraphLoaderTest {

    private HttpServer httpServer;

    @AfterEach
    void tearDown() {
        if (httpServer != null) {
            httpServer.stop(0);
        }
    }

    @Test
    void shouldLoadActiveGraphFromSupabaseRestApi() throws Exception {
        httpServer = HttpServer.create(new InetSocketAddress(0), 0);
        httpServer.createContext("/rest/v1/road_graph_version", exchange ->
                writeJson(exchange, """
                        [{"version_id":"v1","version_name":"iksan_osm_2026_04_21_v1"}]
                        """));
        httpServer.createContext("/rest/v1/road_graph_nodes", exchange -> {
            if (!isFirstPage(exchange)) {
                writeJson(exchange, "[]");
                return;
            }
            writeJson(exchange, """
                        [
                          {"node_id":"n1","lat":35.95,"lng":126.96,"node_type":"INTERSECTION","signalized":false,"u_turn_permitted_emergency":false,"fire_access_entry":false},
                          {"node_id":"n2","lat":35.95,"lng":126.962,"node_type":"INTERSECTION","signalized":true,"u_turn_permitted_emergency":false,"fire_access_entry":false},
                          {"node_id":"n3","lat":35.9485,"lng":126.964,"node_type":"INTERSECTION","signalized":false,"u_turn_permitted_emergency":false,"fire_access_entry":true}
                        ]
                        """);
        });
        httpServer.createContext("/rest/v1/road_graph_edges", exchange -> {
            if (!isFirstPage(exchange)) {
                writeJson(exchange, "[]");
                return;
            }
            writeJson(exchange, """
                        [
                          {"edge_id":"e1","from_node_id":"n1","to_node_id":"n2","length_meters":180.0,"base_speed_kph":30.0,"emergency_speed_kph":36.0,"turn_penalty_seconds":0.0,"signal_penalty_seconds":10.0,"bus_lane":false,"bus_lane_allowed_emergency":false,"fire_access_road":false,"u_turn_edge":false,"u_turn_allowed_emergency":false,"blocked_for_fire_truck":false,"blocked_for_ambulance":false,"is_emergency_preferred":false,"road_type":"primary"},
                          {"edge_id":"e2","from_node_id":"n2","to_node_id":"n3","length_meters":220.0,"base_speed_kph":20.0,"emergency_speed_kph":35.0,"turn_penalty_seconds":4.0,"signal_penalty_seconds":8.0,"bus_lane":true,"bus_lane_allowed_emergency":true,"fire_access_road":true,"u_turn_edge":false,"u_turn_allowed_emergency":false,"blocked_for_fire_truck":false,"blocked_for_ambulance":false,"is_emergency_preferred":true,"road_type":"secondary"}
                        ]
                        """);
        });
        httpServer.start();

        String baseUrl = "http://127.0.0.1:" + httpServer.getAddress().getPort();
        RouteGraphProperties properties = new RouteGraphProperties(
                true,
                "supabase",
                false,
                "",
                "",
                baseUrl,
                "test-key",
                1000,
                5000L,
                5,
                1_500.0,
                0.6,
                1.8
        );
        SupabaseRoadGraphLoader loader = new SupabaseRoadGraphLoader(WebClient.builder(), properties);

        Optional<RoadGraphSnapshot> graph = loader.loadActiveGraph();

        assertTrue(graph.isPresent());
        assertEquals(3, graph.get().nodes().size());
        assertEquals(1, graph.get().outgoingEdges("n1").size());
        assertEquals("n2", graph.get().outgoingEdges("n1").getFirst().toNodeId());
    }

    private void writeJson(HttpExchange exchange, String body) throws IOException {
        byte[] payload = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, payload.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(payload);
        }
    }

    private boolean isFirstPage(HttpExchange exchange) {
        String query = exchange.getRequestURI().getRawQuery();
        return query == null || query.contains("offset=0");
    }
}
