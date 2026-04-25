package com.rescuenav.backend.external.kakao.client;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "kakao.local")
public record KakaoLocalProperties(
        String baseUrl,
        String restApiKey,
        String mobilityBaseUrl,
        long requestTimeoutMillis
) {
}
