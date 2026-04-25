package com.rescuenav.backend.route.dto;

public enum EmergencyFallbackReason {
    NONE,
    GRAPH_DISABLED,
    GRAPH_NOT_LOADED,
    NEAREST_NODE_NOT_FOUND,
    ORIGIN_OUT_OF_GRAPH_RANGE,
    DESTINATION_OUT_OF_GRAPH_RANGE,
    ASTAR_PATH_NOT_FOUND,
    UNKNOWN_ERROR
}
