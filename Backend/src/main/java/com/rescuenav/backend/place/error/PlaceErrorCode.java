package com.rescuenav.backend.place.error;

import com.rescuenav.backend.common.error.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PlaceErrorCode implements ErrorCode {
    EMPTY_SEARCH_KEYWORD(HttpStatus.BAD_REQUEST, "PLACE_400", "The search keyword must not be empty."),
    KAKAO_API_KEY_MISSING(HttpStatus.INTERNAL_SERVER_ERROR, "PLACE_500", "The Kakao API key is not configured."),
    KAKAO_API_ACCESS_DENIED(HttpStatus.BAD_GATEWAY, "PLACE_501", "Kakao API access was denied. Check the REST API key and registered server IPs."),
    PLACE_SEARCH_EXTERNAL_FAILURE(HttpStatus.BAD_GATEWAY, "PLACE_502", "Failed to retrieve destination search results."),
    PLACE_SEARCH_RESPONSE_UNAVAILABLE(HttpStatus.BAD_GATEWAY, "PLACE_503", "Kakao place search did not return a response."),
    PLACE_SEARCH_EMPTY_RESULT(HttpStatus.NOT_FOUND, "PLACE_404", "No destination search results were found."),
    PLACE_SEARCH_COORDINATE_PARSING_FAILED(HttpStatus.BAD_GATEWAY, "PLACE_504", "Failed to parse coordinates from the Kakao place search response.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
