package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.model.ArticleSeries;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleSeriesUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleSeriesRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ManageArticleSeriesService implements ManageArticleSeriesUseCase {

    private final ArticleSeriesRepositoryPort seriesRepository;

    @Override
    public ArticleSeries createSeries(String title) {
        // 시리즈 ID 자동 생성
        String seriesId = seriesRepository.generateNextSeriesId();
        
        // 시리즈 도메인 모델 생성
        ArticleSeries series = ArticleSeries.builder()
                .seriesId(seriesId)
                .title(title)
                .sortOrder(0)
                .build();
        
        // 유효성 검증
        series.validate();
        
        // 저장
        return seriesRepository.save(series);
    }

    @Override
    public ArticleSeries findBySeriesId(String seriesId) {
        return seriesRepository.findBySeriesId(seriesId)
                .orElse(null);
    }

    @Override
    public Map<String, ArticleSeries> findBySeriesIdIn(List<String> seriesIds) {
        if (seriesIds == null || seriesIds.isEmpty()) {
            return Map.of();
        }
        List<ArticleSeries> seriesList = seriesRepository.findBySeriesIdIn(seriesIds);
        return seriesList.stream()
                .collect(Collectors.toMap(
                        ArticleSeries::getSeriesId,
                        series -> series
                ));
    }

    @Override
    public boolean existsBySeriesId(String seriesId) {
        return seriesRepository.existsBySeriesId(seriesId);
    }
}
