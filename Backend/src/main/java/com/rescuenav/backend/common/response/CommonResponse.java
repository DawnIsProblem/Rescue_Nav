package com.rescuenav.backend.common.response;

import com.rescuenav.backend.common.error.ErrorCode;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CommonResponse<T> {

    private final boolean success;
    private final String code;
    private final String message;
    private final T data;

    public static <T> CommonResponse<T> success(String code, String message, T data) {
        return new CommonResponse<>(true, code, message, data);
    }

    public static CommonResponse<Void> success(String code, String message) {
        return new CommonResponse<>(true, code, message, null);
    }

    public static CommonResponse<Void> failure(String code, String message) {
        return new CommonResponse<>(false, code, message, null);
    }

    public static CommonResponse<Void> failure(ErrorCode errorCode) {
        return failure(errorCode.getCode(), errorCode.getMessage());
    }
}
