package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.dto.VehicleType;

record VehicleProfile(
        VehicleType vehicleType,
        int widthCm,
        int heightCm,
        int lengthCm,
        int weightKg,
        double minTurnRadiusM,
        double shortcutSpeedMultiplier,
        double shortcutRiskWeight,
        double maxShortcutDistanceMeters,
        double minShortcutGainRatio,
        int minShortcutNodeGap
) {
    static VehicleProfile from(VehicleType vehicleType) {
        if (vehicleType == VehicleType.AMBULANCE) {
            return new VehicleProfile(
                    VehicleType.AMBULANCE,
                    210,
                    280,
                    600,
                    4_000,
                    9.0,
                    1.45,
                    0.18,
                    120.0,
                    1.9,
                    3
            );
        }

        return new VehicleProfile(
                VehicleType.FIRE_TRUCK,
                250,
                320,
                850,
                12_000,
                12.0,
                1.28,
                0.34,
                95.0,
                2.15,
                4
        );
    }

    double dimensionRiskPenalty() {
        double sizePenalty = (widthCm - 200) * 0.012;
        double heightPenalty = Math.max(0, heightCm - 250) * 0.008;
        double weightPenalty = Math.max(0, weightKg - 3_500) * 0.00008;
        double turnPenalty = minTurnRadiusM * 0.45;
        return sizePenalty + heightPenalty + weightPenalty + turnPenalty;
    }
}
