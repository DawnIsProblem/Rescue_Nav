package com.rescuenav.backend.place.dto;

public record PlaceSearchResult(
        String name,
        String address,
        double lat,
        double lng
) {
}
