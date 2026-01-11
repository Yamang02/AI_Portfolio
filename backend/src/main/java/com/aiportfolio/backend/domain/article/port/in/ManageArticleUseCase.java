package com.aiportfolio.backend.domain.article.port.in;

import com.aiportfolio.backend.domain.article.model.Article;

import java.util.List;

public interface ManageArticleUseCase {

    Article create(CreateArticleCommand command);
    Article update(UpdateArticleCommand command);
    void delete(Long id);

    // Command 정의
    record CreateArticleCommand(
            String title,
            String summary,
            String content,
            String projectBusinessId, // 비즈니스 ID (String)
            String category,
            List<String> tags,
            List<String> techStack,  // tech_name 목록
            String status,
            Boolean isFeatured,
            Integer featuredSortOrder,
            String seriesId,
            Integer seriesOrder
    ) {
        public CreateArticleCommand {
            if (title == null || title.isBlank()) {
                throw new IllegalArgumentException("제목은 필수입니다.");
            }
            if (content == null || content.isBlank()) {
                throw new IllegalArgumentException("본문은 필수입니다.");
            }
        }
    }

    record UpdateArticleCommand(
            Long id,
            String title,
            String summary,
            String content,
            String projectBusinessId, // 비즈니스 ID (String)
            String category,
            List<String> tags,
            List<String> techStack,
            String status,
            Boolean isFeatured,
            Integer featuredSortOrder,
            String seriesId,
            Integer seriesOrder
    ) {
        public UpdateArticleCommand {
            if (id == null) {
                throw new IllegalArgumentException("ID는 필수입니다.");
            }
        }
    }
}
