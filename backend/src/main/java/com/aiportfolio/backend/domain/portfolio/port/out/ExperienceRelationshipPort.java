package com.aiportfolio.backend.domain.portfolio.port.out;

import java.util.List;

/**
 * Experience와 TechStack 간의 관계를 관리하는 인터페이스
 */
public interface ExperienceRelationshipPort {

    /**
     * Experience-TechStack 관계를 교체 (머지 전략)
     *
     * @param experienceBusinessId Experience Business ID
     * @param relationships TechStack 관계 리스트
     */
    void replaceTechStacks(String experienceBusinessId, List<TechStackRelation> relationships);

    record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {}
}
