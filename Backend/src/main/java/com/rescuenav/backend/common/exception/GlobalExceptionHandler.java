package com.rescuenav.backend.common.exception;

import com.rescuenav.backend.common.error.CommonErrorCode;
import com.rescuenav.backend.common.response.CommonResponse;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<CommonResponse<Void>> handleCustomException(CustomException exception) {
        var errorCode = exception.getErrorCode();
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(CommonResponse.failure(errorCode));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponse<Void>> handleValidationException(
            MethodArgumentNotValidException exception
    ) {
        String detailMessage = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::formatFieldError)
                .distinct()
                .collect(Collectors.joining("; "));

        String message = detailMessage.isBlank()
                ? CommonErrorCode.INVALID_INPUT_VALUE.getMessage()
                : "%s Details: %s".formatted(CommonErrorCode.INVALID_INPUT_VALUE.getMessage(), detailMessage);

        return ResponseEntity
                .status(CommonErrorCode.INVALID_INPUT_VALUE.getStatus())
                .body(CommonResponse.failure(CommonErrorCode.INVALID_INPUT_VALUE.getCode(), message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponse<Void>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException exception
    ) {
        return ResponseEntity
                .status(CommonErrorCode.INVALID_REQUEST_BODY.getStatus())
                .body(CommonResponse.failure(CommonErrorCode.INVALID_REQUEST_BODY));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<CommonResponse<Void>> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException exception
    ) {
        String message = "%s parameter is required.".formatted(exception.getParameterName());
        return ResponseEntity
                .status(CommonErrorCode.INVALID_INPUT_VALUE.getStatus())
                .body(CommonResponse.failure(CommonErrorCode.INVALID_INPUT_VALUE.getCode(), message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonResponse<Void>> handleException(Exception exception) {
        return ResponseEntity
                .status(CommonErrorCode.INTERNAL_SERVER_ERROR.getStatus())
                .body(CommonResponse.failure(CommonErrorCode.INTERNAL_SERVER_ERROR));
    }

    private String formatFieldError(FieldError fieldError) {
        String defaultMessage = fieldError.getDefaultMessage();
        if (defaultMessage == null || defaultMessage.isBlank()) {
            return "%s is invalid.".formatted(fieldError.getField());
        }
        return "%s: %s".formatted(fieldError.getField(), defaultMessage);
    }
}
