package com.aiportfolio.backend.domain.portfolio.port.out;

import java.util.List;

/**
 * Project 관계 관리 Port
 * Hexagonal Architecture의 Secondary Port (Outbound Port)
 * 
 * Project와 TechStack 간의 관계를 관리하는 인터페이스
 */
public interface ProjectRelationshipPort {
    
    /**
     * 프로젝트의 기술 스택 관계를 교체합니다.
     * 기존 관계를 모두 삭제하고 새로운 관계를 생성합니다.
     * 
     * @param projectBusinessId 프로젝트 비즈니스 ID
     * @param relationships 기술 스택 관계 리스트
     */
    void replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships);
    
    /**
     * 기술 스택 관계를 표현하는 record
     */
    record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {}
}

