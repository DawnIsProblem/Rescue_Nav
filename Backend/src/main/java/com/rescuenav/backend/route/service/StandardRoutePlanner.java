package com.rescuenav.backend.route.service;

import com.rescuenav.backend.common.exception.CustomException;
import com.rescuenav.backend.external.kakao.client.KakaoMobilityClient;
import com.rescuenav.backend.external.kakao.dto.KakaoDirectionsResponse;
import com.rescuenav.backend.route.dto.RouteCalculationResponse;
import com.rescuenav.backend.route.dto.RoutePoint;
import com.rescuenav.backend.route.dto.RouteSummary;
import com.rescuenav.backend.route.error.RouteErrorCode;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class StandardRoutePlanner {

    private final KakaoMobilityClient kakaoMobilityClient;

    RouteSummary calculate(
            RoutePoint origin,
            RouteCalculationResponse.ResolvedDestination destination
    ) {
        KakaoDirectionsResponse.KakaoRoute route = getFirstRoute(
                kakaoMobilityClient.getDirections(
                        origin.lat(),
                        origin.lng(),
                        destination.lat(),
                        destination.lng()
                )
        );
        return toRouteSummary(route);
    }

    private KakaoDirectionsResponse.KakaoRoute getFirstRoute(KakaoDirectionsResponse directionsResponse) {
        return directionsResponse.routes().stream()
                .findFirst()
                .orElseThrow(() -> new CustomException(RouteErrorCode.STANDARD_ROUTE_EMPTY_RESULT));
    }

    private RouteSummary toRouteSummary(KakaoDirectionsResponse.KakaoRoute route) {
        KakaoDirectionsResponse.KakaoSummary summary = route.summary();
        if (summary == null) {
            throw new CustomException(RouteErrorCode.STANDARD_ROUTE_INVALID_RESPONSE);
        }

        List<RoutePoint> path = route.sections().stream()
                .flatMap(section -> section.roads().stream())
                .flatMap(road -> toRoutePoints(road.vertexes()).stream())
                .toList();
        if (path.isEmpty()) {
            throw new CustomException(RouteErrorCode.STANDARD_ROUTE_INVALID_RESPONSE);
        }

        return new RouteSummary(summary.distance(), summary.duration(), path);
    }

    private List<RoutePoint> toRoutePoints(List<Double> vertexes) {
        if (vertexes == null || vertexes.isEmpty()) {
            return List.of();
        }

        if (vertexes.size() % 2 != 0) {
            throw new CustomException(RouteErrorCode.STANDARD_ROUTE_INVALID_VERTEX_DATA);
        }

        ArrayList<RoutePoint> points = new ArrayList<>(vertexes.size() / 2);
        for (int index = 0; index < vertexes.size(); index += 2) {
            if (vertexes.get(index) == null || vertexes.get(index + 1) == null) {
                throw new CustomException(RouteErrorCode.STANDARD_ROUTE_INVALID_VERTEX_DATA);
            }
            points.add(new RoutePoint(vertexes.get(index + 1), vertexes.get(index)));
        }
        return List.copyOf(points);
    }
}
