package com.aiportfolio.backend.infrastructure.web.admin.dto;

import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminProjectTechnicalCardsUpdateRequest {

    @NotNull(message = "technicalCards는 필수입니다")
    @Valid
    private List<TechnicalCardItem> technicalCards;

    public List<ProjectUpdateCommand.ProjectTechnicalCardCommand> toCommands() {
        return technicalCards.stream()
                .map(TechnicalCardItem::toCommand)
                .toList();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class TechnicalCardItem {
        private Long id;

        @Size(max = 50, message = "카드 비즈니스 ID는 50자를 초과할 수 없습니다")
        private String businessId;

        @NotBlank(message = "카드 제목은 필수입니다")
        @Size(max = 255, message = "카드 제목은 255자를 초과할 수 없습니다")
        private String title;

        @NotBlank(message = "카드 카테고리는 필수입니다")
        @Size(max = 50, message = "카드 카테고리는 50자를 초과할 수 없습니다")
        private String category;

        @NotBlank(message = "문제 정의는 필수입니다")
        private String problemStatement;

        private String analysis;

        @NotBlank(message = "해결 내용은 필수입니다")
        private String solution;

        private Long articleId;
        private Boolean isPinned = Boolean.FALSE;
        private Integer sortOrder = 0;

        private ProjectUpdateCommand.ProjectTechnicalCardCommand toCommand() {
            return ProjectUpdateCommand.ProjectTechnicalCardCommand.builder()
                    .id(id)
                    .businessId(businessId)
                    .title(title)
                    .category(category)
                    .problemStatement(problemStatement)
                    .analysis(analysis)
                    .solution(solution)
                    .articleId(articleId)
                    .isPinned(isPinned)
                    .sortOrder(sortOrder)
                    .build();
        }
    }
}

