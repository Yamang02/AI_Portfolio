package com.aiportfolio.backend.domain.article.filter;

import com.aiportfolio.backend.domain.common.filter.BaseFilter;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 아티클 필터 클래스
 * genpresso-admin-backend의 Filter 패턴을 참고하여 구현
 */
@Getter
@Setter
public class ArticleFilter extends BaseFilter {
    private String category;
    private Long projectId;
    private String seriesId;
    private Boolean isFeatured;
    private String searchKeyword; // 제목/내용 검색

    public ArticleFilter() {
        super();
    }

    public ArticleFilter(
            String category,
            Long projectId,
            String seriesId,
            Boolean isFeatured,
            String searchKeyword,
            LocalDateTime dateFrom,
            LocalDateTime dateTo
    ) {
        super(dateFrom, dateTo);
        this.category = category;
        this.projectId = projectId;
        this.seriesId = seriesId;
        this.isFeatured = isFeatured;
        this.searchKeyword = searchKeyword;
    }

    /**
     * 필터가 활성화되어 있는지 확인
     */
    public boolean hasActiveFilters() {
        return category != null ||
                projectId != null ||
                seriesId != null ||
                isFeatured != null ||
                (searchKeyword != null && !searchKeyword.trim().isEmpty()) ||
                dateFrom != null ||
                dateTo != null;
    }
}
