package com.rescuenav.backend.external.kakao.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record KakaoDirectionsResponse(
        @JsonProperty("routes")
        List<KakaoRoute> routes
) {

    public static KakaoDirectionsResponse empty() {
        return new KakaoDirectionsResponse(List.of());
    }

    public List<KakaoRoute> routes() {
        return routes == null ? List.of() : routes;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KakaoRoute(
            @JsonProperty("summary")
            KakaoSummary summary,

            @JsonProperty("sections")
            List<KakaoSection> sections
    ) {
        public List<KakaoSection> sections() {
            return sections == null ? List.of() : sections;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KakaoSummary(
            @JsonProperty("distance")
            long distance,

            @JsonProperty("duration")
            long duration
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KakaoSection(
            @JsonProperty("roads")
            List<KakaoRoad> roads
    ) {
        public List<KakaoRoad> roads() {
            return roads == null ? List.of() : roads;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KakaoRoad(
            @JsonProperty("vertexes")
            List<Double> vertexes
    ) {
        public List<Double> vertexes() {
            return vertexes == null ? List.of() : vertexes;
        }
    }
}
