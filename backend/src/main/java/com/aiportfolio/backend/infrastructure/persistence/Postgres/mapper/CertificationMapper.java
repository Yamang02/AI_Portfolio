package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.model.Certification;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.CertificationJpaEntity;

// 외부 라이브러리 imports
import org.springframework.stereotype.Component;

// Java 표준 라이브러리 imports
import java.util.List;
import java.util.stream.Collectors;

/**
 * Certification 도메인 모델과 JPA 엔티티 간 변환 매퍼
 */
@Component
public class CertificationMapper {
    
    /**
     * JPA 엔티티를 도메인 모델로 변환
     */
    public Certification toDomain(CertificationJpaEntity jpaEntity) {
        if (jpaEntity == null) {
            return null;
        }
        
        return Certification.builder()
                .id(jpaEntity.getBusinessId()) // business_id → domain.id
                .name(jpaEntity.getName())
                .issuer(jpaEntity.getIssuer())
                .date(jpaEntity.getDate())
                .description(jpaEntity.getDescription())
                .credentialUrl(jpaEntity.getCredentialUrl())
                .build();
    }
    
    /**
     * 도메인 모델을 JPA 엔티티로 변환
     */
    public CertificationJpaEntity toJpaEntity(Certification domainModel) {
        if (domainModel == null) {
            return null;
        }
        
        return CertificationJpaEntity.builder()
                .businessId(domainModel.getId()) // domain.id → business_id
                .name(domainModel.getName())
                .issuer(domainModel.getIssuer())
                .date(domainModel.getDate())
                .description(domainModel.getDescription())
                .credentialUrl(domainModel.getCredentialUrl())
                .sortOrder(0) // 기본값
                .build();
    }
    
    /**
     * JPA 엔티티 리스트를 도메인 모델 리스트로 변환
     */
    public List<Certification> toDomainList(List<CertificationJpaEntity> jpaEntities) {
        if (jpaEntities == null) {
            return null;
        }
        
        return jpaEntities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
    
    /**
     * 도메인 모델 리스트를 JPA 엔티티 리스트로 변환
     */
    public List<CertificationJpaEntity> toJpaEntityList(List<Certification> domainModels) {
        if (domainModels == null) {
            return null;
        }
        
        return domainModels.stream()
                .map(this::toJpaEntity)
                .collect(Collectors.toList());
    }
}