package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.portfolio.model.ProfileIntroduction;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProfileIntroductionUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageProfileIntroductionUseCase;
import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.admin.AdminApiErrorMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Admin 프로필 자기소개 컨트롤러
 */
@RestController
@RequestMapping("/api/admin/profile-introduction")
@RequiredArgsConstructor
public class AdminProfileIntroductionController {

    private final ManageProfileIntroductionUseCase manageUseCase;
    private final GetProfileIntroductionUseCase getUseCase;

    /**
     * 현재 자기소개 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileIntroductionResponse>> getCurrent() {
        return getUseCase.getCurrent()
                .map(intro -> ResponseEntity.ok(ApiResponse.success(ProfileIntroductionResponse.from(intro))))
                .orElse(ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.PROFILE_INTRO_EMPTY)));
    }

    /**
     * 자기소개 저장 (생성 또는 업데이트)
     */
    @PutMapping
    public ResponseEntity<ApiResponse<ProfileIntroductionResponse>> saveOrUpdate(
            @RequestBody SaveProfileIntroductionRequest request) {

        try {
            ManageProfileIntroductionUseCase.SaveProfileIntroductionCommand command =
                    new ManageProfileIntroductionUseCase.SaveProfileIntroductionCommand(request.content());

            ProfileIntroduction saved = manageUseCase.saveOrUpdate(command);
            return ResponseEntity.ok(ApiResponse.success(
                    ProfileIntroductionResponse.from(saved),
                    WebApiResponseMessages.PROFILE_INTRO_SAVE_SUCCESS
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(AdminApiErrorMessages.profileIntroductionSaveFailed(e)));
        }
    }

    /**
     * Request DTO
     */
    public record SaveProfileIntroductionRequest(String content) {}

    /**
     * Response DTO
     */
    public record ProfileIntroductionResponse(
            Long id,
            String content,
            Integer version,
            String createdAt,
            String updatedAt
    ) {
        public static ProfileIntroductionResponse from(ProfileIntroduction domain) {
            return new ProfileIntroductionResponse(
                    domain.getId(),
                    domain.getContent(),
                    domain.getVersion(),
                    domain.getCreatedAt() != null ? domain.getCreatedAt().toString() : null,
                    domain.getUpdatedAt() != null ? domain.getUpdatedAt().toString() : null
            );
        }
    }
}
