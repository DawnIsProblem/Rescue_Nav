package com.rescuenav.backend.route.service;

import com.rescuenav.backend.common.exception.CustomException;
import com.rescuenav.backend.external.kakao.client.KakaoMobilityClient;
import com.rescuenav.backend.external.kakao.dto.KakaoAddressSearchResponse;
import com.rescuenav.backend.route.dto.EmergencyRouteSummary;
import com.rescuenav.backend.route.dto.RouteCalculationRequest;
import com.rescuenav.backend.route.dto.RouteCalculationResponse;
import com.rescuenav.backend.route.dto.RoutePoint;
import com.rescuenav.backend.route.dto.RouteSummary;
import com.rescuenav.backend.route.dto.VehicleType;
import com.rescuenav.backend.route.error.RouteErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class RouteCalculationService {

    private final KakaoMobilityClient kakaoMobilityClient;
    private final StandardRoutePlanner standardRoutePlanner;
    private final EmergencyRoutePlanner emergencyRoutePlanner;

    public RouteCalculationResponse calculate(RouteCalculationRequest request) {
        validateDestinationAddress(request.destination().address());
        VehicleType vehicleType = request.vehicleType() == null ? VehicleType.FIRE_TRUCK : request.vehicleType();
        VehicleProfile vehicleProfile = VehicleProfile.from(vehicleType);
        log.info(
                "route.calculate.start vehicleType={} widthCm={} heightCm={} lengthCm={} weightKg={} minTurnRadiusM={} originLat={} originLng={} destinationAddress={} destinationLat={} destinationLng={}",
                vehicleType,
                vehicleProfile.widthCm(),
                vehicleProfile.heightCm(),
                vehicleProfile.lengthCm(),
                vehicleProfile.weightKg(),
                vehicleProfile.minTurnRadiusM(),
                request.origin().lat(),
                request.origin().lng(),
                request.destination().address(),
                request.destination().lat(),
                request.destination().lng()
        );

        RoutePoint origin = new RoutePoint(
                request.origin().lat(),
                request.origin().lng()
        );

        RouteCalculationResponse.ResolvedDestination destination = resolveDestination(request.destination());
        RouteSummary standardRoute = standardRoutePlanner.calculate(origin, destination);
        log.info(
                "route.calculate.standard summary distanceMeters={} etaSeconds={} pathPointCount={}",
                standardRoute.distanceMeters(),
                standardRoute.etaSeconds(),
                standardRoute.path().size()
        );
        EmergencyRouteSummary emergencyRoute = emergencyRoutePlanner.calculate(
                origin,
                destination,
                standardRoute,
                vehicleType,
                vehicleProfile
        );

        return new RouteCalculationResponse(
                origin,
                destination,
                standardRoute,
                emergencyRoute
        );
    }

    private void validateDestinationAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            throw new CustomException(RouteErrorCode.MISSING_DESTINATION_ADDRESS);
        }
    }

    private RouteCalculationResponse.ResolvedDestination resolveDestination(
            RouteCalculationRequest.Destination destination
    ) {
        if (destination.lat() != null && destination.lng() != null) {
            return new RouteCalculationResponse.ResolvedDestination(
                    destination.address().trim(),
                    destination.zonecode(),
                    destination.lat(),
                    destination.lng()
            );
        }

        KakaoAddressSearchResponse response = kakaoMobilityClient.searchAddress(destination.address().trim());
        KakaoAddressSearchResponse.KakaoAddressDocument document = response.documents().stream()
                .findFirst()
                .orElseThrow(() -> new CustomException(RouteErrorCode.DESTINATION_GEOCODING_EMPTY_RESULT));

        try {
            return new RouteCalculationResponse.ResolvedDestination(
                    destination.address().trim(),
                    destination.zonecode(),
                    Double.parseDouble(document.latitude()),
                    Double.parseDouble(document.longitude())
            );
        } catch (NumberFormatException exception) {
            throw new CustomException(RouteErrorCode.DESTINATION_GEOCODING_INVALID_RESPONSE);
        }
    }

}
