package com.rescuenav.backend.place.service;

import com.rescuenav.backend.common.exception.CustomException;
import com.rescuenav.backend.external.kakao.client.KakaoPlaceSearchClient;
import com.rescuenav.backend.external.kakao.dto.KakaoKeywordSearchResponse;
import com.rescuenav.backend.place.dto.PlaceSearchResult;
import com.rescuenav.backend.place.error.PlaceErrorCode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlaceSearchService {

    private final KakaoPlaceSearchClient kakaoPlaceSearchClient;

    public List<PlaceSearchResult> search(String query) {
        String normalizedQuery = normalizeQuery(query);
        KakaoKeywordSearchResponse response = kakaoPlaceSearchClient.searchByKeyword(normalizedQuery);
        if (response.documents().isEmpty()) {
            throw new CustomException(PlaceErrorCode.PLACE_SEARCH_EMPTY_RESULT);
        }

        return response.documents().stream()
                .map(this::toPlaceSearchResult)
                .toList();
    }

    private String normalizeQuery(String query) {
        if (query == null) {
            throw new CustomException(PlaceErrorCode.EMPTY_SEARCH_KEYWORD);
        }

        String normalizedQuery = query.trim();
        if (normalizedQuery.isEmpty()) {
            throw new CustomException(PlaceErrorCode.EMPTY_SEARCH_KEYWORD);
        }
        return normalizedQuery;
    }

    private PlaceSearchResult toPlaceSearchResult(KakaoKeywordSearchResponse.KakaoPlaceDocument document) {
        String address = document.roadAddressName().isBlank()
                ? document.addressName()
                : document.roadAddressName();

        try {
            return new PlaceSearchResult(
                    document.placeName(),
                    address,
                    Double.parseDouble(document.latitude()),
                    Double.parseDouble(document.longitude())
            );
        } catch (NumberFormatException exception) {
            throw new CustomException(PlaceErrorCode.PLACE_SEARCH_COORDINATE_PARSING_FAILED);
        }
    }
}
