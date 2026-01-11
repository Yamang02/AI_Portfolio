package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.portfolio.model.ProfileIntroduction;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProfileIntroductionUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public 프로필 자기소개 컨트롤러
 */
@RestController
@RequestMapping("/api/profile-introduction")
@RequiredArgsConstructor
public class ProfileIntroductionController {

    private final GetProfileIntroductionUseCase getUseCase;

    /**
     * 현재 자기소개 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileIntroductionResponse>> getCurrent() {
        return getUseCase.getCurrent()
                .map(intro -> ResponseEntity.ok(ApiResponse.success(ProfileIntroductionResponse.from(intro))))
                .orElse(ResponseEntity.ok(ApiResponse.success(null, "자기소개가 없습니다.")));
    }

    /**
     * Response DTO (Public용 - 필요한 정보만 노출)
     */
    public record ProfileIntroductionResponse(
            String content,
            String updatedAt
    ) {
        public static ProfileIntroductionResponse from(ProfileIntroduction domain) {
            return new ProfileIntroductionResponse(
                    domain.getContent(),
                    domain.getUpdatedAt() != null ? domain.getUpdatedAt().toString() : null
            );
        }
    }
}
