package com.rescuenav.backend.common.docs;

public final class PlaceApiExamples {

    private PlaceApiExamples() {
    }

    public static final String SEARCH_SUCCESS = """
            {
              "success": true,
              "code": "PLACE_SEARCH_SUCCESS",
              "message": "Destination search completed.",
              "data": [
                {
                  "name": "강남세브란스병원",
                  "address": "서울 강남구 언주로 211",
                  "lat": 37.4923615,
                  "lng": 127.0467282
                }
              ]
            }
            """;

    public static final String QUERY_REQUIRED = """
            {
              "success": false,
              "code": "COMMON_400",
              "message": "query parameter is required.",
              "data": null
            }
            """;

    public static final String QUERY_BLANK = """
            {
              "success": false,
              "code": "PLACE_400",
              "message": "The search keyword must not be empty.",
              "data": null
            }
            """;

    public static final String API_KEY_MISSING = """
            {
              "success": false,
              "code": "PLACE_500",
              "message": "The Kakao API key is not configured.",
              "data": null
            }
            """;

    public static final String API_ACCESS_DENIED = """
            {
              "success": false,
              "code": "PLACE_501",
              "message": "Kakao API access was denied. Check the REST API key and registered server IPs.",
              "data": null
            }
            """;

    public static final String EXTERNAL_FAILURE = """
            {
              "success": false,
              "code": "PLACE_502",
              "message": "Failed to retrieve destination search results.",
              "data": null
            }
            """;

    public static final String RESPONSE_UNAVAILABLE = """
            {
              "success": false,
              "code": "PLACE_503",
              "message": "Kakao place search did not return a response.",
              "data": null
            }
            """;

    public static final String EMPTY_RESULT = """
            {
              "success": false,
              "code": "PLACE_404",
              "message": "No destination search results were found.",
              "data": null
            }
            """;

    public static final String COORDINATE_PARSING_FAILED = """
            {
              "success": false,
              "code": "PLACE_504",
              "message": "Failed to parse coordinates from the Kakao place search response.",
              "data": null
            }
            """;
}
