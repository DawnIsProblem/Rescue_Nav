package com.rescuenav.backend.external.kakao.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record KakaoKeywordSearchResponse(
        @JsonProperty("documents")
        List<KakaoPlaceDocument> documents
) {
    public List<KakaoPlaceDocument> documents() {
        return documents == null ? List.of() : documents;
    }

    public static KakaoKeywordSearchResponse empty() {
        return new KakaoKeywordSearchResponse(List.of());
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KakaoPlaceDocument(
            @JsonProperty("place_name")
            String placeName,

            @JsonProperty("address_name")
            String addressName,

            @JsonProperty("road_address_name")
            String roadAddressName,

            @JsonProperty("x")
            String longitude,

            @JsonProperty("y")
            String latitude
    ) {
        public String addressName() {
            return addressName == null ? "" : addressName;
        }

        public String roadAddressName() {
            return roadAddressName == null ? "" : roadAddressName;
        }
    }
}
