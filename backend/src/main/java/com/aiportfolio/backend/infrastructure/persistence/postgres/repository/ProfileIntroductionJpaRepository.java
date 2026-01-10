package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProfileIntroductionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

/**
 * 프로필 자기소개 JPA 저장소
 */
public interface ProfileIntroductionJpaRepository extends JpaRepository<ProfileIntroductionJpaEntity, Long> {

    /**
     * 최신 자기소개 조회 (ID 기준 내림차순 첫 번째)
     */
    @Query(value = "SELECT * FROM profile_introduction ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<ProfileIntroductionJpaEntity> findLatest();
}
