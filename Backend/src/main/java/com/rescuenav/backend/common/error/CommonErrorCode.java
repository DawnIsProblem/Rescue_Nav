package com.rescuenav.backend.common.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CommonErrorCode implements ErrorCode {
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "COMMON_400", "The request contains invalid input values."),
    INVALID_REQUEST_BODY(HttpStatus.BAD_REQUEST, "COMMON_401", "The request body is malformed or unreadable."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_500", "An unexpected server error occurred.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
