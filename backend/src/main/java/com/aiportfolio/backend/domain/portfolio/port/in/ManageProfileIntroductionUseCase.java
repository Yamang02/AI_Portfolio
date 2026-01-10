package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.ProfileIntroduction;

/**
 * 프로필 자기소개 관리 유스케이스
 */
public interface ManageProfileIntroductionUseCase {

    /**
     * 자기소개 생성 또는 업데이트
     * (단일 레코드이므로 CREATE/UPDATE 통합)
     */
    ProfileIntroduction saveOrUpdate(SaveProfileIntroductionCommand command);

    /**
     * 자기소개 저장 커맨드
     */
    record SaveProfileIntroductionCommand(String content) {
        public SaveProfileIntroductionCommand {
            if (content == null || content.isBlank()) {
                throw new IllegalArgumentException("자기소개 내용은 필수입니다.");
            }
        }
    }
}
