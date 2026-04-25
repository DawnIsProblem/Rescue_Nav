package com.rescuenav.backend.external.kakao.client;

import com.rescuenav.backend.common.exception.CustomException;
import com.rescuenav.backend.external.kakao.dto.KakaoAddressSearchResponse;
import com.rescuenav.backend.external.kakao.dto.KakaoDirectionsResponse;
import com.rescuenav.backend.route.error.RouteErrorCode;
import java.time.Duration;
import java.util.concurrent.TimeoutException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
@RequiredArgsConstructor
public class KakaoMobilityClient {

    private final WebClient.Builder webClientBuilder;
    private final KakaoLocalProperties kakaoLocalProperties;

    public KakaoAddressSearchResponse searchAddress(String address) {
        String restApiKey = kakaoLocalProperties.restApiKey();
        if (restApiKey == null || restApiKey.isBlank()) {
            throw new CustomException(RouteErrorCode.KAKAO_API_KEY_MISSING);
        }

        try {
            return webClientBuilder
                    .baseUrl(kakaoLocalProperties.baseUrl())
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "KakaoAK " + restApiKey)
                    .build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/local/search/address.json")
                            .queryParam("query", address)
                            .build())
                    .retrieve()
                    .bodyToMono(KakaoAddressSearchResponse.class)
                    .timeout(Duration.ofMillis(kakaoLocalProperties.requestTimeoutMillis()))
                    .onErrorMap(
                            TimeoutException.class,
                            exception -> new CustomException(RouteErrorCode.DESTINATION_GEOCODING_RESPONSE_UNAVAILABLE)
                    )
                    .blockOptional()
                    .orElseThrow(() -> new CustomException(RouteErrorCode.DESTINATION_GEOCODING_RESPONSE_UNAVAILABLE));
        } catch (WebClientResponseException exception) {
            throw mapRouteError(exception, RouteErrorCode.DESTINATION_GEOCODING_FAILED);
        } catch (WebClientRequestException exception) {
            throw new CustomException(RouteErrorCode.DESTINATION_GEOCODING_RESPONSE_UNAVAILABLE);
        } catch (CustomException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new CustomException(RouteErrorCode.DESTINATION_GEOCODING_FAILED);
        }
    }

    public KakaoDirectionsResponse getDirections(double originLat, double originLng, double destinationLat, double destinationLng) {
        return getDirections(
                originLat,
                originLng,
                destinationLat,
                destinationLng,
                RouteErrorCode.STANDARD_ROUTE_CALCULATION_FAILED
        );
    }

    public KakaoDirectionsResponse getEmergencyDirections(
            double originLat,
            double originLng,
            double destinationLat,
            double destinationLng
    ) {
        return getDirections(
                originLat,
                originLng,
                destinationLat,
                destinationLng,
                RouteErrorCode.EMERGENCY_ROUTE_CALCULATION_FAILED
        );
    }

    private KakaoDirectionsResponse getDirections(
            double originLat,
            double originLng,
            double destinationLat,
            double destinationLng,
            RouteErrorCode failureCode
    ) {
        String restApiKey = kakaoLocalProperties.restApiKey();
        if (restApiKey == null || restApiKey.isBlank()) {
            throw new CustomException(RouteErrorCode.KAKAO_API_KEY_MISSING);
        }

        try {
            return webClientBuilder
                    .baseUrl(kakaoLocalProperties.mobilityBaseUrl())
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "KakaoAK " + restApiKey)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                    .build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/directions")
                            .queryParam("origin", originLng + "," + originLat)
                            .queryParam("destination", destinationLng + "," + destinationLat)
                            .build())
                    .retrieve()
                    .bodyToMono(KakaoDirectionsResponse.class)
                    .timeout(Duration.ofMillis(kakaoLocalProperties.requestTimeoutMillis()))
                    .onErrorMap(
                            TimeoutException.class,
                            exception -> new CustomException(RouteErrorCode.STANDARD_ROUTE_RESPONSE_UNAVAILABLE)
                    )
                    .blockOptional()
                    .orElseThrow(() -> new CustomException(RouteErrorCode.STANDARD_ROUTE_RESPONSE_UNAVAILABLE));
        } catch (WebClientResponseException exception) {
            throw mapRouteError(exception, failureCode);
        } catch (WebClientRequestException exception) {
            throw new CustomException(RouteErrorCode.STANDARD_ROUTE_RESPONSE_UNAVAILABLE);
        } catch (CustomException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new CustomException(failureCode);
        }
    }

    private CustomException mapRouteError(WebClientResponseException exception, RouteErrorCode fallbackErrorCode) {
        HttpStatusCode statusCode = exception.getStatusCode();
        if (statusCode.value() == 401 || statusCode.value() == 403) {
            return new CustomException(RouteErrorCode.KAKAO_API_ACCESS_DENIED);
        }
        return new CustomException(fallbackErrorCode);
    }
}
