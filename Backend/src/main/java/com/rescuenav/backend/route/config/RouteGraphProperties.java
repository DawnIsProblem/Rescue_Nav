package com.rescuenav.backend.route.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "route.graph")
public record RouteGraphProperties(
        boolean enabled,
        String source,
        boolean preloadOnStartup,
        String dataDir,
        String snapshotPath,
        String supabaseUrl,
        String supabaseKey,
        int supabasePageSize,
        long supabaseTimeoutMillis,
        int nearestNodeLimit,
        double nearestNodeMaxDistanceMeters,
        double etaCorrectionRatioMin,
        double etaCorrectionRatioMax
) {

    public RouteGraphProperties {
        source = (source == null || source.isBlank()) ? "local" : source;
        snapshotPath = snapshotPath == null ? "" : snapshotPath;
        supabasePageSize = supabasePageSize <= 0 ? 5000 : supabasePageSize;
        supabaseTimeoutMillis = supabaseTimeoutMillis <= 0 ? 5000L : supabaseTimeoutMillis;
        nearestNodeLimit = nearestNodeLimit <= 0 ? 5 : nearestNodeLimit;
        nearestNodeMaxDistanceMeters = nearestNodeMaxDistanceMeters <= 0.0 ? 1_500.0 : nearestNodeMaxDistanceMeters;
        etaCorrectionRatioMin = etaCorrectionRatioMin <= 0.0 ? 0.6 : etaCorrectionRatioMin;
        etaCorrectionRatioMax = etaCorrectionRatioMax <= 0.0 ? 1.8 : etaCorrectionRatioMax;
    }
}
