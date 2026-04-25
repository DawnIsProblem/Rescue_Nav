package com.rescuenav.backend.place.controller;

import com.rescuenav.backend.common.docs.PlaceApiExamples;
import com.rescuenav.backend.common.response.CommonResponse;
import com.rescuenav.backend.place.dto.PlaceSearchResult;
import com.rescuenav.backend.place.service.PlaceSearchService;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceSearchController {

    private static final String PLACE_SEARCH_SUCCESS = "PLACE_SEARCH_SUCCESS";
    private static final String PLACE_SEARCH_SUCCESS_MESSAGE = "Destination search completed.";

    private final PlaceSearchService placeSearchService;

    @Operation(
            summary = "목적지 검색 API",
            description = "Kakao Postcode로 검색한 목적지를 Kakao Map API를 이용해서 디테일한 정보를 받아옵니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "목적지 검색 성공",
                    content = @Content(examples = {
                            @ExampleObject(name = "Search Success", value = PlaceApiExamples.SEARCH_SUCCESS)
                    })
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 검색 요청",
                    content = @Content(examples = {
                            @ExampleObject(name = "Query Parameter Missing", value = PlaceApiExamples.QUERY_REQUIRED),
                            @ExampleObject(name = "Query Blank", value = PlaceApiExamples.QUERY_BLANK)
                    })
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "검색 결과 없음",
                    content = @Content(examples = {
                            @ExampleObject(name = "Empty Result", value = PlaceApiExamples.EMPTY_RESULT)
                    })
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 설정 오류",
                    content = @Content(examples = {
                            @ExampleObject(name = "API Key Missing", value = PlaceApiExamples.API_KEY_MISSING)
                    })
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "외부 API 오류 또는 접근 거부",
                    content = @Content(examples = {
                            @ExampleObject(name = "Access Denied", value = PlaceApiExamples.API_ACCESS_DENIED),
                            @ExampleObject(name = "External Failure", value = PlaceApiExamples.EXTERNAL_FAILURE),
                            @ExampleObject(name = "Coordinate Parsing Failed", value = PlaceApiExamples.COORDINATE_PARSING_FAILED)
                    })
            ),
            @ApiResponse(
                    responseCode = "503",
                    description = "외부 API 응답 없음 또는 timeout",
                    content = @Content(examples = {
                            @ExampleObject(name = "Response Unavailable", value = PlaceApiExamples.RESPONSE_UNAVAILABLE)
                    })
            )
    })
    @GetMapping("/search")
    public CommonResponse<List<PlaceSearchResult>> search(
            @Parameter(description = "검색 키워드", example = "강남세브란스병원")
            @RequestParam String query
    ) {
        return CommonResponse.success(
                PLACE_SEARCH_SUCCESS,
                PLACE_SEARCH_SUCCESS_MESSAGE,
                placeSearchService.search(query)
        );
    }
}
