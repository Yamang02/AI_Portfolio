package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.model.ArticleStatistics;
import com.aiportfolio.backend.domain.article.port.in.GetArticleStatisticsUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetArticleStatisticsService implements GetArticleStatisticsUseCase {

    private final ArticleRepositoryPort articleRepository;

    @Override
    public ArticleStatistics getStatistics() {
        return articleRepository.getStatistics();
    }
}
