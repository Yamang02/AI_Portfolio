package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.ProfileIntroduction;

import java.util.Optional;

/**
 * 프로필 자기소개 조회 유스케이스
 */
public interface GetProfileIntroductionUseCase {

    /**
     * 현재 자기소개 조회
     * (단일 레코드이므로 항상 최신 버전 반환)
     */
    Optional<ProfileIntroduction> getCurrent();
}
