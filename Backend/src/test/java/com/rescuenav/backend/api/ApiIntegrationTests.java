package com.rescuenav.backend.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rescuenav.backend.common.exception.CustomException;
import com.rescuenav.backend.external.kakao.client.KakaoMobilityClient;
import com.rescuenav.backend.external.kakao.client.KakaoPlaceSearchClient;
import com.rescuenav.backend.external.kakao.dto.KakaoAddressSearchResponse;
import com.rescuenav.backend.external.kakao.dto.KakaoDirectionsResponse;
import com.rescuenav.backend.external.kakao.dto.KakaoKeywordSearchResponse;
import com.rescuenav.backend.place.error.PlaceErrorCode;
import com.rescuenav.backend.route.error.RouteErrorCode;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private KakaoPlaceSearchClient kakaoPlaceSearchClient;

    @MockitoBean
    private KakaoMobilityClient kakaoMobilityClient;

    @AfterEach
    void tearDown() {
        Mockito.reset(kakaoPlaceSearchClient, kakaoMobilityClient);
    }

    @Test
    void placeSearchShouldReturnResults() throws Exception {
        when(kakaoPlaceSearchClient.searchByKeyword("강남세브란스병원"))
                .thenReturn(new KakaoKeywordSearchResponse(List.of(
                        new KakaoKeywordSearchResponse.KakaoPlaceDocument(
                                "강남세브란스병원",
                                "서울 강남구 도곡동 146-92",
                                "서울 강남구 언주로 211",
                                "127.0467282",
                                "37.4923615"
                        )
                )));

        mockMvc.perform(get("/api/places/search")
                        .param("query", "강남세브란스병원"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("PLACE_SEARCH_SUCCESS"))
                .andExpect(jsonPath("$.data[0].name").value("강남세브란스병원"))
                .andExpect(jsonPath("$.data[0].lat").value(37.4923615))
                .andExpect(jsonPath("$.data[0].lng").value(127.0467282));
    }

    @Test
    void placeSearchShouldFailWhenQueryParameterIsMissing() throws Exception {
        mockMvc.perform(get("/api/places/search"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("COMMON_400"))
                .andExpect(jsonPath("$.message").value("query parameter is required."));
    }

    @Test
    void placeSearchShouldFailWhenQueryIsBlank() throws Exception {
        mockMvc.perform(get("/api/places/search")
                        .param("query", "   "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("PLACE_400"))
                .andExpect(jsonPath("$.message").value("The search keyword must not be empty."));
    }

    @Test
    void placeSearchShouldReturnNotFoundWhenNoResultExists() throws Exception {
        when(kakaoPlaceSearchClient.searchByKeyword("없는장소"))
                .thenReturn(KakaoKeywordSearchResponse.empty());

        mockMvc.perform(get("/api/places/search")
                        .param("query", "없는장소"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("PLACE_404"));
    }

    @Test
    void routeCalculationShouldReturnCalculatedRoutes() throws Exception {
        when(kakaoMobilityClient.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(successDirectionsResponse());

        mockMvc.perform(post("/api/routes/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routeRequest(
                                37.498095,
                                127.02761,
                                "서울 강남구 언주로 211",
                                "06273",
                                37.4923615,
                                127.0467282,
                                "FIRE_TRUCK"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("ROUTE_CALCULATION_SUCCESS"))
                .andExpect(jsonPath("$.data.destination.address").value("서울 강남구 언주로 211"))
                .andExpect(jsonPath("$.data.emergencyRoute.meta.vehicleType").value("FIRE_TRUCK"))
                .andExpect(jsonPath("$.data.emergencyRoute.meta.legalWarning").isString())
                .andExpect(jsonPath("$.data.emergencyRoute.meta.reason").isString())
                .andExpect(jsonPath("$.data.emergencyRoute.meta.assumptions").isArray())
                .andExpect(jsonPath("$.data.emergencyRoute.meta.confidence").isNumber())
                .andExpect(jsonPath("$.data.emergencyRoute.meta.fallbackUsed").isBoolean())
                .andExpect(jsonPath("$.data.emergencyRoute.meta.fallbackReason").isString())
                .andExpect(jsonPath("$.data.emergencyRoute.meta.primaryStrategy").isString());
    }

    @Test
    void routeCalculationShouldFailWhenRequestBodyIsMalformed() throws Exception {
        mockMvc.perform(post("/api/routes/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("COMMON_401"));
    }

    @Test
    void routeCalculationShouldFailWhenCoordinatesAreInvalid() throws Exception {
        mockMvc.perform(post("/api/routes/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routeRequest(
                                91.0,
                                127.02761,
                                "서울 강남구 언주로 211",
                                "06273",
                                37.4923615,
                                127.0467282,
                                "AMBULANCE"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("COMMON_400"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("origin.lat")));
    }

    @Test
    void routeCalculationShouldFailWhenDestinationCoordinatesAreIncomplete() throws Exception {
        mockMvc.perform(post("/api/routes/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "origin": { "lat": 37.498095, "lng": 127.02761 },
                                  "destination": {
                                    "address": "서울 강남구 언주로 211",
                                    "lat": 37.4923615
                                  },
                                  "vehicleType": "AMBULANCE"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("COMMON_400"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("destination.lat and destination.lng must be provided together.")));
    }

    @Test
    void routeCalculationShouldReturnNotFoundWhenGeocodingHasNoResult() throws Exception {
        when(kakaoMobilityClient.searchAddress(anyString()))
                .thenReturn(KakaoAddressSearchResponse.empty());

        mockMvc.perform(post("/api/routes/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "origin": { "lat": 37.498095, "lng": 127.02761 },
                                  "destination": { "address": "없는 목적지" },
                                  "vehicleType": "FIRE_TRUCK"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("ROUTE_404"));
    }

    @Test
    void routeCalculationShouldFailWhenKakaoReturnsInvalidVertexData() throws Exception {
        when(kakaoMobilityClient.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(invalidVertexDirectionsResponse());

        mockMvc.perform(post("/api/routes/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routeRequest(
                                37.498095,
                                127.02761,
                                "서울 강남구 언주로 211",
                                "06273",
                                37.4923615,
                                127.0467282,
                                "FIRE_TRUCK"
                        ))))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("ROUTE_511"));
    }

    @Test
    void placeSearchShouldPropagateExternalAccessDenied() throws Exception {
        when(kakaoPlaceSearchClient.searchByKeyword("권한없음"))
                .thenThrow(new CustomException(PlaceErrorCode.KAKAO_API_ACCESS_DENIED));

        mockMvc.perform(get("/api/places/search")
                        .param("query", "권한없음"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("PLACE_501"));
    }

    @Test
    void routeCalculationShouldPropagateRouteCalculationFailure() throws Exception {
        when(kakaoMobilityClient.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenThrow(new CustomException(RouteErrorCode.STANDARD_ROUTE_RESPONSE_UNAVAILABLE));

        mockMvc.perform(post("/api/routes/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routeRequest(
                                37.498095,
                                127.02761,
                                "서울 강남구 언주로 211",
                                "06273",
                                37.4923615,
                                127.0467282,
                                "FIRE_TRUCK"
                        ))))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("ROUTE_509"));
    }

    private Map<String, Object> routeRequest(
            double originLat,
            double originLng,
            String destinationAddress,
            String zonecode,
            Double destinationLat,
            Double destinationLng,
            String vehicleType
    ) {
        return Map.of(
                "origin", Map.of(
                        "lat", originLat,
                        "lng", originLng
                ),
                "destination", Map.of(
                        "address", destinationAddress,
                        "zonecode", zonecode,
                        "lat", destinationLat,
                        "lng", destinationLng
                ),
                "vehicleType", vehicleType
        );
    }

    private KakaoDirectionsResponse successDirectionsResponse() {
        return new KakaoDirectionsResponse(List.of(
                new KakaoDirectionsResponse.KakaoRoute(
                        new KakaoDirectionsResponse.KakaoSummary(2450L, 420L),
                        List.of(new KakaoDirectionsResponse.KakaoSection(
                                List.of(new KakaoDirectionsResponse.KakaoRoad(List.of(
                                        127.02761, 37.498095,
                                        127.03210, 37.49670,
                                        127.04020, 37.49460,
                                        127.0467282, 37.4923615
                                )))
                        ))
                )
        ));
    }

    private KakaoDirectionsResponse invalidVertexDirectionsResponse() {
        return new KakaoDirectionsResponse(List.of(
                new KakaoDirectionsResponse.KakaoRoute(
                        new KakaoDirectionsResponse.KakaoSummary(2450L, 420L),
                        List.of(new KakaoDirectionsResponse.KakaoSection(
                                List.of(new KakaoDirectionsResponse.KakaoRoad(List.of(
                                        127.02761, 37.498095, 127.03210
                                )))
                        ))
                )
        ));
    }
}
