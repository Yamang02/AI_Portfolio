package com.aiportfolio.backend.domain.portfolio.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 프로필 자기소개 도메인 모델
 */
@Getter
@Builder
public class ProfileIntroduction {
    private Long id;
    private String content;  // Markdown 형식
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 콘텐츠 업데이트
     */
    public ProfileIntroduction updateContent(String newContent) {
        return ProfileIntroduction.builder()
                .id(this.id)
                .content(newContent)
                .version(this.version + 1)
                .createdAt(this.createdAt)
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * 유효성 검증
     */
    public void validate() {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("자기소개 내용은 필수입니다.");
        }
        if (content.length() > 50000) {
            throw new IllegalArgumentException("자기소개 내용은 50,000자를 초과할 수 없습니다.");
        }
    }
}
