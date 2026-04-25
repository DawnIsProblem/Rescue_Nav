package com.rescuenav.backend.common.docs;

public final class RouteApiExamples {

    private RouteApiExamples() {
    }

    public static final String CALCULATE_SUCCESS = """
            {
              "success": true,
              "code": "ROUTE_CALCULATION_SUCCESS",
              "message": "Route calculation completed.",
              "data": {
                "origin": {
                  "lat": 37.498095,
                  "lng": 127.02761
                },
                "destination": {
                  "address": "서울 강남구 언주로 211",
                  "zonecode": "06273",
                  "lat": 37.4923615,
                  "lng": 127.0467282
                },
                "standardRoute": {
                  "distanceMeters": 2450,
                  "etaSeconds": 420,
                  "path": [
                    {
                      "lat": 37.498095,
                      "lng": 127.02761
                    },
                    {
                      "lat": 37.4923615,
                      "lng": 127.0467282
                    }
                  ]
                },
                "emergencyRoute": {
                  "distanceMeters": 2180,
                  "etaSeconds": 350,
                  "path": [
                    {
                      "lat": 37.498095,
                      "lng": 127.02761
                    },
                    {
                      "lat": 37.4923615,
                      "lng": 127.0467282
                    }
                  ],
                  "meta": {
                    "strategy": "GRAPH_EMERGENCY_SHORTCUT",
                    "candidateCount": 2,
                    "warning": "긴급 경로는 추정 기반 안내입니다. 실제 출동 전에는 현장 판단이 반드시 필요합니다.",
                    "legalWarning": "긴급 경로 안내는 긴급차량의 법규 특례를 전제로 합니다. 최종 판단과 실시간 안전 확인은 반드시 현장에서 수행해야 합니다.",
                    "reason": "일반 경로가 단거리 우회로 판단되었고, 하나 이상의 유효한 단축 후보가 발견되어 휴리스틱 기반 긴급 경로를 선택했습니다.",
                    "assumptions": [
                      "긴급 주행 상황을 가정하여 신호 대기 영향이 일반 주행보다 낮게 반영됩니다.",
                      "버스전용차로와 긴급 진입로는 일반 주행보다 완화된 조건으로 통행 가능하다고 가정합니다.",
                      "더 빠른 경로가 추정되는 경우 긴급 경로에서는 유턴 제한이 일부 완화될 수 있다고 가정합니다.",
                      "일방통행 도로의 역주행은 이 휴리스틱 모델에서 제외됩니다.",
                      "이 경로는 검증된 긴급 도로망 그래프가 아니라 일반 경로 geometry에서 추정한 단축 edge를 사용합니다."
                    ],
                    "confidence": 0.78,
                    "fallbackUsed": false,
                    "fallbackReason": "NONE",
                    "fallbackMessage": "",
                    "primaryStrategy": "GRAPH_EMERGENCY_SHORTCUT",
                    "fallbackStrategy": null,
                    "vehicleType": "FIRE_TRUCK",
                    "evaluatedCandidates": [
                      {
                        "targetPoint": {
                          "lat": 37.4941,
                          "lng": 127.0412
                        },
                        "distanceMeters": 880,
                        "etaSeconds": 95,
                        "finalApproachDistanceMeters": 53.2,
                        "turnCount": 1,
                        "score": -4.8
                      }
                    ]
                  }
                }
              }
            }
            """;

    public static final String INVALID_REQUEST_BODY = """
            {
              "success": false,
              "code": "COMMON_401",
              "message": "The request body is malformed or unreadable.",
              "data": null
            }
            """;

    public static final String INVALID_INPUT = """
            {
              "success": false,
              "code": "COMMON_400",
              "message": "The request contains invalid input values. Details: origin.lat: must be greater than or equal to -90.0",
              "data": null
            }
            """;

    public static final String MISSING_DESTINATION_ADDRESS = """
            {
              "success": false,
              "code": "ROUTE_400",
              "message": "The destination address must not be empty.",
              "data": null
            }
            """;

    public static final String API_KEY_MISSING = """
            {
              "success": false,
              "code": "ROUTE_500",
              "message": "The Kakao API key is not configured.",
              "data": null
            }
            """;

    public static final String API_ACCESS_DENIED = """
            {
              "success": false,
              "code": "ROUTE_501",
              "message": "Kakao API access was denied. Check the REST API key and registered server IPs.",
              "data": null
            }
            """;

    public static final String GEOCODING_FAILED = """
            {
              "success": false,
              "code": "ROUTE_502",
              "message": "Failed to geocode the destination address.",
              "data": null
            }
            """;

    public static final String GEOCODING_EMPTY_RESULT = """
            {
              "success": false,
              "code": "ROUTE_404",
              "message": "No coordinates were found for the destination address.",
              "data": null
            }
            """;

    public static final String STANDARD_ROUTE_FAILED = """
            {
              "success": false,
              "code": "ROUTE_503",
              "message": "Failed to calculate the standard route.",
              "data": null
            }
            """;

    public static final String STANDARD_ROUTE_EMPTY = """
            {
              "success": false,
              "code": "ROUTE_504",
              "message": "No standard route result was returned by Kakao Mobility.",
              "data": null
            }
            """;

    public static final String EMERGENCY_ROUTE_FAILED = """
            {
              "success": false,
              "code": "ROUTE_505",
              "message": "Failed to estimate the emergency access route.",
              "data": null
            }
            """;

    public static final String EMERGENCY_ROUTE_EMPTY = """
            {
              "success": false,
              "code": "ROUTE_506",
              "message": "No emergency access route candidate could be estimated.",
              "data": null
            }
            """;

    public static final String GEOCODING_RESPONSE_UNAVAILABLE = """
            {
              "success": false,
              "code": "ROUTE_507",
              "message": "Kakao geocoding did not return a response.",
              "data": null
            }
            """;

    public static final String GEOCODING_INVALID_RESPONSE = """
            {
              "success": false,
              "code": "ROUTE_508",
              "message": "The Kakao geocoding response contained invalid coordinates.",
              "data": null
            }
            """;

    public static final String STANDARD_ROUTE_RESPONSE_UNAVAILABLE = """
            {
              "success": false,
              "code": "ROUTE_509",
              "message": "Kakao Mobility did not return a route response.",
              "data": null
            }
            """;

    public static final String STANDARD_ROUTE_INVALID_RESPONSE = """
            {
              "success": false,
              "code": "ROUTE_510",
              "message": "The Kakao Mobility route response was missing required route data.",
              "data": null
            }
            """;

    public static final String STANDARD_ROUTE_INVALID_VERTEX_DATA = """
            {
              "success": false,
              "code": "ROUTE_511",
              "message": "The Kakao Mobility route response contained invalid path vertex data.",
              "data": null
            }
            """;
}
