package com.rescuenav.backend.external.kakao.client;

import com.rescuenav.backend.common.exception.CustomException;
import com.rescuenav.backend.external.kakao.dto.KakaoKeywordSearchResponse;
import java.time.Duration;
import java.util.concurrent.TimeoutException;
import com.rescuenav.backend.place.error.PlaceErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
@RequiredArgsConstructor
public class KakaoPlaceSearchClient {

    private final WebClient.Builder webClientBuilder;
    private final KakaoLocalProperties kakaoLocalProperties;

    public KakaoKeywordSearchResponse searchByKeyword(String query) {
        String restApiKey = kakaoLocalProperties.restApiKey();
        if (restApiKey == null || restApiKey.isBlank()) {
            throw new CustomException(PlaceErrorCode.KAKAO_API_KEY_MISSING);
        }

        try {
            return webClientBuilder
                    .baseUrl(kakaoLocalProperties.baseUrl())
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "KakaoAK " + restApiKey)
                    .build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/local/search/keyword.json")
                            .queryParam("query", query)
                            .build())
                    .retrieve()
                    .bodyToMono(KakaoKeywordSearchResponse.class)
                    .timeout(Duration.ofMillis(kakaoLocalProperties.requestTimeoutMillis()))
                    .onErrorMap(
                            TimeoutException.class,
                            exception -> new CustomException(PlaceErrorCode.PLACE_SEARCH_RESPONSE_UNAVAILABLE)
                    )
                    .blockOptional()
                    .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_SEARCH_RESPONSE_UNAVAILABLE));
        } catch (WebClientResponseException exception) {
            if (exception.getStatusCode().value() == 401 || exception.getStatusCode().value() == 403) {
                throw new CustomException(PlaceErrorCode.KAKAO_API_ACCESS_DENIED);
            }
            throw new CustomException(PlaceErrorCode.PLACE_SEARCH_EXTERNAL_FAILURE);
        } catch (WebClientRequestException exception) {
            throw new CustomException(PlaceErrorCode.PLACE_SEARCH_RESPONSE_UNAVAILABLE);
        } catch (CustomException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new CustomException(PlaceErrorCode.PLACE_SEARCH_EXTERNAL_FAILURE);
        }
    }
}
