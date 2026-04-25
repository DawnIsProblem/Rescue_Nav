package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.dto.RoutePoint;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class CsvRoadGraphParser {

    private CsvRoadGraphParser() {
    }

    static Map<String, RoadGraphSnapshot.GraphNode> parseNodes(List<String> lines) {
        if (lines.isEmpty()) {
            return Map.of();
        }

        String[] headers = parseCsvLine(lines.getFirst());
        Map<String, RoadGraphSnapshot.GraphNode> nodes = new HashMap<>();
        for (int index = 1; index < lines.size(); index++) {
            if (lines.get(index).isBlank()) {
                continue;
            }
            Map<String, String> row = row(headers, parseCsvLine(lines.get(index)));
            RoadGraphSnapshot.GraphNode node = new RoadGraphSnapshot.GraphNode(
                    row.get("node_id"),
                    new RoutePoint(
                            Double.parseDouble(row.get("lat")),
                            Double.parseDouble(row.get("lng"))
                    ),
                    row.getOrDefault("node_type", "INTERSECTION"),
                    Boolean.parseBoolean(row.getOrDefault("signalized", "false")),
                    Boolean.parseBoolean(row.getOrDefault("u_turn_permitted_emergency", "false")),
                    Boolean.parseBoolean(row.getOrDefault("fire_access_entry", "false"))
            );
            nodes.put(node.id(), node);
        }
        return Map.copyOf(nodes);
    }

    static Map<String, List<RoadGraphSnapshot.GraphEdge>> parseEdges(
            List<String> lines,
            Map<String, RoadGraphSnapshot.GraphNode> nodes
    ) {
        if (lines.isEmpty()) {
            return Map.of();
        }

        String[] headers = parseCsvLine(lines.getFirst());
        Map<String, List<RoadGraphSnapshot.GraphEdge>> adjacency = new HashMap<>();
        for (int index = 1; index < lines.size(); index++) {
            if (lines.get(index).isBlank()) {
                continue;
            }
            Map<String, String> row = row(headers, parseCsvLine(lines.get(index)));
            RoadGraphSnapshot.GraphNode fromNode = nodes.get(row.get("from_node_id"));
            RoadGraphSnapshot.GraphNode toNode = nodes.get(row.get("to_node_id"));
            if (fromNode == null || toNode == null) {
                continue;
            }

            RoadGraphSnapshot.GraphEdge edge = new RoadGraphSnapshot.GraphEdge(
                    row.get("edge_id"),
                    row.get("from_node_id"),
                    row.get("to_node_id"),
                    fromNode.point(),
                    toNode.point(),
                    parseDouble(row.get("length_meters")),
                    parseDouble(row.get("base_speed_kph")),
                    parseDouble(row.get("emergency_speed_kph")),
                    parseDouble(row.get("turn_penalty_seconds")),
                    parseDouble(row.get("signal_penalty_seconds")),
                    parseBoolean(row.get("bus_lane")),
                    parseBoolean(row.get("bus_lane_allowed_emergency")),
                    parseBoolean(row.get("fire_access_road")),
                    parseBoolean(row.get("u_turn_edge")),
                    parseBoolean(row.get("u_turn_allowed_emergency")),
                    parseBoolean(row.get("blocked_for_fire_truck")),
                    parseBoolean(row.get("blocked_for_ambulance")),
                    parseBoolean(row.get("is_emergency_preferred")),
                    row.getOrDefault("road_type", "road")
            );
            adjacency.computeIfAbsent(edge.fromNodeId(), ignored -> new ArrayList<>()).add(edge);
        }

        Map<String, List<RoadGraphSnapshot.GraphEdge>> immutableAdjacency = new HashMap<>();
        for (Map.Entry<String, List<RoadGraphSnapshot.GraphEdge>> entry : adjacency.entrySet()) {
            immutableAdjacency.put(entry.getKey(), List.copyOf(entry.getValue()));
        }
        return Map.copyOf(immutableAdjacency);
    }

    private static String[] parseCsvLine(String line) {
        ArrayList<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;

        for (int index = 0; index < line.length(); index++) {
            char currentChar = line.charAt(index);
            if (currentChar == '"') {
                if (quoted && index + 1 < line.length() && line.charAt(index + 1) == '"') {
                    current.append('"');
                    index++;
                } else {
                    quoted = !quoted;
                }
                continue;
            }

            if (currentChar == ',' && !quoted) {
                values.add(current.toString());
                current.setLength(0);
                continue;
            }
            current.append(currentChar);
        }
        values.add(current.toString());
        return values.toArray(String[]::new);
    }

    private static Map<String, String> row(String[] headers, String[] values) {
        HashMap<String, String> row = new HashMap<>();
        for (int index = 0; index < headers.length; index++) {
            row.put(headers[index], index < values.length ? values[index] : "");
        }
        return row;
    }

    private static double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return 0.0;
        }
        return Double.parseDouble(value);
    }

    private static boolean parseBoolean(String value) {
        return Boolean.parseBoolean(value == null ? "false" : value);
    }
}
