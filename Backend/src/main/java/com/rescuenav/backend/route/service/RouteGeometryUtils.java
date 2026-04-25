package com.rescuenav.backend.route.service;

import com.rescuenav.backend.route.dto.RoutePoint;
import java.util.ArrayList;
import java.util.List;

final class RouteGeometryUtils {

    private static final double EARTH_RADIUS_METERS = 6_371_000.0;
    private static final double TURN_ANGLE_THRESHOLD_DEGREES = 35.0;

    private RouteGeometryUtils() {
    }

    static double calculateDistanceMeters(RoutePoint start, RoutePoint end) {
        double latitudeDifference = Math.toRadians(end.lat() - start.lat());
        double longitudeDifference = Math.toRadians(end.lng() - start.lng());
        double startLatitude = Math.toRadians(start.lat());
        double endLatitude = Math.toRadians(end.lat());

        double haversine = Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2)
                + Math.cos(startLatitude) * Math.cos(endLatitude)
                * Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2);
        double arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
        return EARTH_RADIUS_METERS * arc;
    }

    static int estimateTurnCount(List<RoutePoint> path) {
        if (path.size() < 3) {
            return 0;
        }

        int turnCount = 0;
        for (int index = 1; index < path.size() - 1; index++) {
            double angle = calculateTurnAngle(path.get(index - 1), path.get(index), path.get(index + 1));
            if (angle >= TURN_ANGLE_THRESHOLD_DEGREES) {
                turnCount++;
            }
        }
        return turnCount;
    }

    static List<RoutePoint> normalizePath(List<RoutePoint> path) {
        if (path.isEmpty()) {
            return List.of();
        }

        ArrayList<RoutePoint> normalized = new ArrayList<>();
        RoutePoint previous = null;
        for (RoutePoint point : path) {
            if (previous == null || !isSamePoint(previous, point)) {
                normalized.add(point);
                previous = point;
            }
        }
        return List.copyOf(normalized);
    }

    private static boolean isSamePoint(RoutePoint first, RoutePoint second) {
        return Double.compare(first.lat(), second.lat()) == 0
                && Double.compare(first.lng(), second.lng()) == 0;
    }

    private static double calculateTurnAngle(RoutePoint previous, RoutePoint current, RoutePoint next) {
        double vector1X = current.lng() - previous.lng();
        double vector1Y = current.lat() - previous.lat();
        double vector2X = next.lng() - current.lng();
        double vector2Y = next.lat() - current.lat();

        double magnitude1 = Math.hypot(vector1X, vector1Y);
        double magnitude2 = Math.hypot(vector2X, vector2Y);
        if (magnitude1 == 0.0 || magnitude2 == 0.0) {
            return 0.0;
        }

        double cosine = ((vector1X * vector2X) + (vector1Y * vector2Y)) / (magnitude1 * magnitude2);
        cosine = Math.max(-1.0, Math.min(1.0, cosine));
        return Math.toDegrees(Math.acos(cosine));
    }
}
