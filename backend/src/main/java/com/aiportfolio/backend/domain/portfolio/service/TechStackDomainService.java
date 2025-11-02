package com.aiportfolio.backend.domain.portfolio.service;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.port.out.TechStackMetadataRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 기술 스택 도메인 서비스
 * 기술 스택 관련 비즈니스 로직을 담당합니다.
 */
@Service
@RequiredArgsConstructor
public class TechStackDomainService {
    
    private final TechStackMetadataRepositoryPort techStackMetadataRepositoryPort;
    
    /**
     * 기술명의 고유성을 검증합니다.
     * 
     * @param name 검증할 기술명
     * @throws IllegalArgumentException 이미 존재하는 기술명인 경우
     */
    public void validateUniqueName(String name) {
        if (techStackMetadataRepositoryPort.existsByName(name)) {
            throw new IllegalArgumentException("이미 존재하는 기술명입니다: " + name);
        }
    }
    
    /**
     * 기술명 변경 시 고유성을 검증합니다.
     * 
     * @param oldName 기존 기술명
     * @param newName 새로운 기술명
     * @throws IllegalArgumentException 이미 존재하는 기술명인 경우
     */
    public void validateNameChange(String oldName, String newName) {
        if (!oldName.equals(newName)) {
            validateUniqueName(newName);
        }
    }
    
    /**
     * 기술 스택 메타데이터 생성 전 검증을 수행합니다.
     * 
     * @param techStackMetadata 생성할 기술 스택 메타데이터
     */
    public void validateForCreation(TechStackMetadata techStackMetadata) {
        // 필수값 검증을 먼저 수행
        if (techStackMetadata.getName() == null || techStackMetadata.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("기술명은 필수입니다");
        }
        
        if (techStackMetadata.getCategory() == null || techStackMetadata.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("카테고리는 필수입니다");
        }
        
        // 필수값이 유효한 경우에만 고유성 검증
        validateUniqueName(techStackMetadata.getName());
    }
    
    /**
     * 기술 스택 메타데이터 수정 전 검증 수행합니다.
     * 
     * @param oldName 기존 기술명
     * @param techStackMetadata 수정할 기술 스택 메타데이터
     */
    public void validateForUpdate(String oldName, TechStackMetadata techStackMetadata) {
        // 필수값 검증을 먼저 수행
        if (techStackMetadata.getName() == null || techStackMetadata.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("기술명은 필수입니다");
        }
        
        if (techStackMetadata.getCategory() == null || techStackMetadata.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("카테고리는 필수입니다");
        }
        
        // 필수값이 유효한 경우에만 이름 변경 검증
        validateNameChange(oldName, techStackMetadata.getName());
    }
}
