package com.rescuenav.backend.route.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RouteCalculationRequest(
        @NotNull @Valid Origin origin,
        @NotNull @Valid Destination destination,
        VehicleType vehicleType
) {

    public record Origin(
            @NotNull
            @DecimalMin(value = "-90.0", message = "origin.lat must be greater than or equal to -90.")
            @DecimalMax(value = "90.0", message = "origin.lat must be less than or equal to 90.")
            Double lat,

            @NotNull
            @DecimalMin(value = "-180.0", message = "origin.lng must be greater than or equal to -180.")
            @DecimalMax(value = "180.0", message = "origin.lng must be less than or equal to 180.")
            Double lng
    ) {
    }

    public record Destination(
            @NotBlank(message = "destination.address must not be blank.")
            String address,
            String zonecode,

            @DecimalMin(value = "-90.0", message = "destination.lat must be greater than or equal to -90.")
            @DecimalMax(value = "90.0", message = "destination.lat must be less than or equal to 90.")
            Double lat,

            @DecimalMin(value = "-180.0", message = "destination.lng must be greater than or equal to -180.")
            @DecimalMax(value = "180.0", message = "destination.lng must be less than or equal to 180.")
            Double lng
    ) {
        @AssertTrue(message = "destination.lat and destination.lng must be provided together.")
        public boolean hasCompleteCoordinates() {
            return (lat == null) == (lng == null);
        }
    }
}
