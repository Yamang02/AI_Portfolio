package com.aiportfolio.backend.infrastructure.web.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 아티클 목록 조회 요청 DTO
 * 검색, 정렬, 페이지네이션 파라미터 포함
 */
@Getter
@Setter
public class ArticleListRequest {
    // 페이지네이션
    private Integer page = 0;
    private Integer size = 10;

    // 검색
    private String searchKeyword; // 제목/내용 검색

    // 정렬
    private String sortBy = "publishedAt"; // 기본값: 발행일
    private String sortOrder = "desc"; // asc | desc

    // 필터
    private String category;
    private Long projectId;
    private String seriesId;
    private Boolean isFeatured;
}
