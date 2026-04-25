package com.rescuenav.backend.route.controller;

import com.rescuenav.backend.common.docs.RouteApiExamples;
import com.rescuenav.backend.common.response.CommonResponse;
import com.rescuenav.backend.route.dto.RouteCalculationRequest;
import com.rescuenav.backend.route.dto.RouteCalculationResponse;
import com.rescuenav.backend.route.service.RouteCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteCalculationController {

    private static final String ROUTE_CALCULATION_SUCCESS = "ROUTE_CALCULATION_SUCCESS";
    private static final String ROUTE_CALCULATION_SUCCESS_MESSAGE = "Route calculation completed.";

    private final RouteCalculationService routeCalculationService;

    @Operation(
            summary = "경로 계산 API",
            description = "현재 위치에서 목적지까지의 경로를 계산합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "경로 계산 성공",
                    content = @Content(examples = {
                            @ExampleObject(name = "Route Calculation Success", value = RouteApiExamples.CALCULATE_SUCCESS)
                    })
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 경로 계산 요청",
                    content = @Content(examples = {
                            @ExampleObject(name = "Invalid Request Body", value = RouteApiExamples.INVALID_REQUEST_BODY),
                            @ExampleObject(name = "Invalid Input", value = RouteApiExamples.INVALID_INPUT),
                            @ExampleObject(name = "Missing Destination Address", value = RouteApiExamples.MISSING_DESTINATION_ADDRESS)
                    })
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "주소 geocoding 결과 없음",
                    content = @Content(examples = {
                            @ExampleObject(name = "Geocoding Empty Result", value = RouteApiExamples.GEOCODING_EMPTY_RESULT)
                    })
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 설정 오류",
                    content = @Content(examples = {
                            @ExampleObject(name = "API Key Missing", value = RouteApiExamples.API_KEY_MISSING)
                    })
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "외부 API 오류 또는 잘못된 외부 응답",
                    content = @Content(examples = {
                            @ExampleObject(name = "Access Denied", value = RouteApiExamples.API_ACCESS_DENIED),
                            @ExampleObject(name = "Geocoding Failed", value = RouteApiExamples.GEOCODING_FAILED),
                            @ExampleObject(name = "Standard Route Failed", value = RouteApiExamples.STANDARD_ROUTE_FAILED),
                            @ExampleObject(name = "Geocoding Invalid Response", value = RouteApiExamples.GEOCODING_INVALID_RESPONSE),
                            @ExampleObject(name = "Standard Route Invalid Response", value = RouteApiExamples.STANDARD_ROUTE_INVALID_RESPONSE),
                            @ExampleObject(name = "Invalid Vertex Data", value = RouteApiExamples.STANDARD_ROUTE_INVALID_VERTEX_DATA),
                            @ExampleObject(name = "Emergency Route Failed", value = RouteApiExamples.EMERGENCY_ROUTE_FAILED),
                            @ExampleObject(name = "Emergency Route Empty", value = RouteApiExamples.EMERGENCY_ROUTE_EMPTY)
                    })
            ),
            @ApiResponse(
                    responseCode = "503",
                    description = "외부 API 응답 없음 또는 timeout",
                    content = @Content(examples = {
                            @ExampleObject(name = "Geocoding Response Unavailable", value = RouteApiExamples.GEOCODING_RESPONSE_UNAVAILABLE),
                            @ExampleObject(name = "Standard Route Response Unavailable", value = RouteApiExamples.STANDARD_ROUTE_RESPONSE_UNAVAILABLE)
                    })
            )
    })
    @PostMapping("/calculate")
    public CommonResponse<RouteCalculationResponse> calculate(
            @Valid @RequestBody RouteCalculationRequest request
    ) {
        return CommonResponse.success(
                ROUTE_CALCULATION_SUCCESS,
                ROUTE_CALCULATION_SUCCESS_MESSAGE,
                routeCalculationService.calculate(request)
        );
    }
}
