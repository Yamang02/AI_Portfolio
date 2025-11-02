package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageTechStackMetadataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.TechStackMetadataRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.service.TechStackDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin 전용 기술 스택 메타데이터 관리 서비스
 *
 * 책임: 기술 스택 메타데이터 생성, 수정, 삭제 관련 비즈니스 로직을 구현
 * 특징: Cache Evict로 캐시 자동 무효화
 */
@Service("manageTechStackMetadataService")
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManageTechStackMetadataService implements ManageTechStackMetadataUseCase {
    
    private final TechStackMetadataRepositoryPort techStackMetadataRepositoryPort;
    private final TechStackDomainService techStackDomainService;
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public TechStackMetadata createTechStackMetadata(TechStackMetadata techStackMetadata) {
        // 도메인 서비스를 통한 비즈니스 로직 검증
        techStackDomainService.validateForCreation(techStackMetadata);
        
        // 새로 생성하는 기술스택은 항상 마지막 순서에 배치
        int maxSortOrder = techStackMetadataRepositoryPort.findMaxSortOrder();
        techStackMetadata.setSortOrder(maxSortOrder + 1);
        
        return techStackMetadataRepositoryPort.save(techStackMetadata);
    }
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public TechStackMetadata updateTechStackMetadata(String name, TechStackMetadata techStackMetadata) {
        // 도메인 서비스를 통한 비즈니스 로직 검증
        techStackDomainService.validateForUpdate(name, techStackMetadata);
        
        // Repository의 업데이트 메서드 사용
        return techStackMetadataRepositoryPort.updateByName(name, techStackMetadata);
    }
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void deleteTechStackMetadata(String name) {
        if (!techStackMetadataRepositoryPort.existsByName(name)) {
            throw new IllegalArgumentException("존재하지 않는 기술명입니다: " + name);
        }
        
        techStackMetadataRepositoryPort.deleteByName(name);
    }
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public TechStackMetadata toggleTechStackMetadataStatus(String name) {
        return techStackMetadataRepositoryPort.findByName(name)
            .map(techStack -> {
                TechStackMetadata updatedTechStack = TechStackMetadata.builder()
                    .name(techStack.getName())
                    .displayName(techStack.getDisplayName())
                    .category(techStack.getCategory())
                    .level(techStack.getLevel())
                    .isCore(techStack.getIsCore())
                    .isActive(!techStack.getIsActive()) // 상태 토글
                    .iconUrl(techStack.getIconUrl())
                    .colorHex(techStack.getColorHex())
                    .description(techStack.getDescription())
                    .sortOrder(techStack.getSortOrder())
                    .createdAt(techStack.getCreatedAt())
                    .updatedAt(techStack.getUpdatedAt())
                    .build();
                
                return techStackMetadataRepositoryPort.save(updatedTechStack);
            })
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기술명입니다: " + name));
    }
}

