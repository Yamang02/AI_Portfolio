package com.aiportfolio.backend.domain.portfolio.port.out;

import com.aiportfolio.backend.domain.portfolio.model.ProfileIntroduction;

import java.util.Optional;

/**
 * 프로필 자기소개 저장소 포트
 */
public interface ProfileIntroductionRepositoryPort {

    /**
     * 자기소개 저장 (생성 또는 업데이트)
     */
    ProfileIntroduction save(ProfileIntroduction profileIntroduction);

    /**
     * 현재 자기소개 조회
     */
    Optional<ProfileIntroduction> findCurrent();

    /**
     * ID로 조회
     */
    Optional<ProfileIntroduction> findById(Long id);
}
