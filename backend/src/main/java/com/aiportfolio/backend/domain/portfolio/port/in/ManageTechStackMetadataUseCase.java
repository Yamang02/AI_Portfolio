package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;

/**
 * 기술 스택 메타데이터 관리 Use Case
 * 기술 스택 메타데이터 생성, 수정, 삭제 관련 비즈니스 로직을 정의
 */
public interface ManageTechStackMetadataUseCase {
    
    /**
     * 기술 스택 메타데이터 생성
     */
    TechStackMetadata createTechStackMetadata(TechStackMetadata techStackMetadata);
    
    /**
     * 기술 스택 메타데이터 수정
     */
    TechStackMetadata updateTechStackMetadata(String name, TechStackMetadata techStackMetadata);
    
    /**
     * 기술 스택 메타데이터 삭제
     */
    void deleteTechStackMetadata(String name);
    
    /**
     * 기술 스택 메타데이터 활성화/비활성화 토글
     */
    TechStackMetadata toggleTechStackMetadataStatus(String name);
}
