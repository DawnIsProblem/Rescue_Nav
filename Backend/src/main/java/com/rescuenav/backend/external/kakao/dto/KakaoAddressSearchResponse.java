package com.rescuenav.backend.external.kakao.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record KakaoAddressSearchResponse(
        @JsonProperty("documents")
        List<KakaoAddressDocument> documents
) {
    public List<KakaoAddressDocument> documents() {
        return documents == null ? List.of() : documents;
    }

    public static KakaoAddressSearchResponse empty() {
        return new KakaoAddressSearchResponse(List.of());
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record KakaoAddressDocument(
            @JsonProperty("address_name")
            String addressName,

            @JsonProperty("x")
            String longitude,

            @JsonProperty("y")
            String latitude
    ) {
    }
}
