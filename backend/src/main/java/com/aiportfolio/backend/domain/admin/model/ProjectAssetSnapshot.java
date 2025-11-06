package com.aiportfolio.backend.domain.admin.model;

import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

/**
 * 프로젝트에 연결된 썸네일과 스크린샷 자산 정보를 담는 스냅샷.
 */
@Getter
@Builder
public class ProjectAssetSnapshot {

    private final String thumbnailUrl;
    @Builder.Default
    private final List<ProjectScreenshotAsset> screenshots = Collections.emptyList();

    @Getter
    @Builder
    public static class ProjectScreenshotAsset {
        private final String imageUrl;
        private final String cloudinaryPublicId;
    }
}

