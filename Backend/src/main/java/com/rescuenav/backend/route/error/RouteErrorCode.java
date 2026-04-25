package com.rescuenav.backend.route.error;

import com.rescuenav.backend.common.error.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum RouteErrorCode implements ErrorCode {
    MISSING_DESTINATION_ADDRESS(HttpStatus.BAD_REQUEST, "ROUTE_400", "The destination address must not be empty."),
    KAKAO_API_KEY_MISSING(HttpStatus.INTERNAL_SERVER_ERROR, "ROUTE_500", "The Kakao API key is not configured."),
    KAKAO_API_ACCESS_DENIED(HttpStatus.BAD_GATEWAY, "ROUTE_501", "Kakao API access was denied. Check the REST API key and registered server IPs."),
    DESTINATION_GEOCODING_FAILED(HttpStatus.BAD_GATEWAY, "ROUTE_502", "Failed to geocode the destination address."),
    DESTINATION_GEOCODING_RESPONSE_UNAVAILABLE(HttpStatus.BAD_GATEWAY, "ROUTE_507", "Kakao geocoding did not return a response."),
    DESTINATION_GEOCODING_EMPTY_RESULT(HttpStatus.NOT_FOUND, "ROUTE_404", "No coordinates were found for the destination address."),
    DESTINATION_GEOCODING_INVALID_RESPONSE(HttpStatus.BAD_GATEWAY, "ROUTE_508", "The Kakao geocoding response contained invalid coordinates."),
    STANDARD_ROUTE_CALCULATION_FAILED(HttpStatus.BAD_GATEWAY, "ROUTE_503", "Failed to calculate the standard route."),
    STANDARD_ROUTE_RESPONSE_UNAVAILABLE(HttpStatus.BAD_GATEWAY, "ROUTE_509", "Kakao Mobility did not return a route response."),
    STANDARD_ROUTE_EMPTY_RESULT(HttpStatus.BAD_GATEWAY, "ROUTE_504", "No standard route result was returned by Kakao Mobility."),
    STANDARD_ROUTE_INVALID_RESPONSE(HttpStatus.BAD_GATEWAY, "ROUTE_510", "The Kakao Mobility route response was missing required route data."),
    STANDARD_ROUTE_INVALID_VERTEX_DATA(HttpStatus.BAD_GATEWAY, "ROUTE_511", "The Kakao Mobility route response contained invalid path vertex data."),
    EMERGENCY_ROUTE_CALCULATION_FAILED(HttpStatus.BAD_GATEWAY, "ROUTE_505", "Failed to estimate the emergency access route."),
    EMERGENCY_ROUTE_EMPTY_RESULT(HttpStatus.BAD_GATEWAY, "ROUTE_506", "No emergency access route candidate could be estimated.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
