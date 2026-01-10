package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.portfolio.model.ProfileIntroduction;
import com.aiportfolio.backend.domain.portfolio.port.out.ProfileIntroductionRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProfileIntroductionJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.ProfileIntroductionMapper;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProfileIntroductionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * PostgreSQL 기반 프로필 자기소개 저장소 어댑터
 */
@Repository
@RequiredArgsConstructor
public class PostgresProfileIntroductionRepository implements ProfileIntroductionRepositoryPort {

    private final ProfileIntroductionJpaRepository jpaRepository;
    private final ProfileIntroductionMapper mapper;

    @Override
    public ProfileIntroduction save(ProfileIntroduction profileIntroduction) {
        // ID가 있으면 업데이트, 없으면 생성
        if (profileIntroduction.getId() != null) {
            // 업데이트: 기존 엔티티를 조회하여 직접 수정
            ProfileIntroductionJpaEntity existing = jpaRepository.findById(profileIntroduction.getId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "ProfileIntroduction not found: " + profileIntroduction.getId()));
            
            // 필드 업데이트
            existing.setContent(profileIntroduction.getContent());
            existing.setVersion(profileIntroduction.getVersion());
            // updatedAt은 @UpdateTimestamp가 자동 처리
            
            ProfileIntroductionJpaEntity saved = jpaRepository.save(existing);
            return mapper.toDomain(saved);
        } else {
            // 생성: 새 엔티티
            ProfileIntroductionJpaEntity entity = mapper.toEntity(profileIntroduction);
            ProfileIntroductionJpaEntity saved = jpaRepository.save(entity);
            return mapper.toDomain(saved);
        }
    }

    @Override
    public Optional<ProfileIntroduction> findCurrent() {
        return jpaRepository.findLatest()
                .map(mapper::toDomain);
    }

    @Override
    public Optional<ProfileIntroduction> findById(Long id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }
}
