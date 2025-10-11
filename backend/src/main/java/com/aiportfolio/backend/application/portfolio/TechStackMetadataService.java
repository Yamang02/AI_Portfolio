package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.port.in.GetTechStackMetadataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.TechStackMetadataRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.TechStackMetadataJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 기술 스택 메타데이터 서비스
 * 기술 스택 메타데이터 관련 비즈니스 로직을 구현
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TechStackMetadataService implements GetTechStackMetadataUseCase {
    
    private final TechStackMetadataRepositoryPort repositoryPort;
    private final TechStackMetadataJpaRepository jpaRepository;
    
    @Override
    public List<TechStackMetadata> getAllActiveTechStackMetadata() {
        return repositoryPort.findAllActive();
    }
    
    @Override
    public List<TechStackMetadata> getCoreTechStackMetadata() {
        return repositoryPort.findCoreTechnologies();
    }
    
    @Override
    public Optional<TechStackMetadata> getTechStackMetadataByName(String name) {
        return repositoryPort.findByName(name);
    }
    
    @Override
    public List<TechStackMetadata> getTechStackMetadataByCategory(String category) {
        return repositoryPort.findByCategory(category);
    }
    
    @Override
    public List<TechStackMetadata> getTechStackMetadataByLevel(String level) {
        return repositoryPort.findByLevel(level);
    }
    
    @Override
    public List<TechStackMetadata> getTechStackMetadataByCategoryAndLevel(String category, String level) {
        return repositoryPort.findByCategoryAndLevel(category, level);
    }
    
    @Override
    public List<TechStackMetadata> getTechStackMetadataByNames(List<String> names) {
        return repositoryPort.findByNames(names);
    }
    
    @Override
    public List<TechStackMetadata> searchTechStackMetadataByName(String name) {
        return repositoryPort.findByNameContaining(name);
    }
    
    @Override
    public List<TechStackMetadata> getTechnologiesUsedInProjects() {
        return repositoryPort.findTechnologiesUsedInProjects();
    }
    
    @Override
    public TechStackStatistics getTechStackStatistics() {
        // 전체 활성화된 기술 스택 개수
        Long totalTechnologies = jpaRepository.countActiveTechnologies();
        
        // 핵심 기술 스택 개수
        Long coreTechnologies = jpaRepository.countCoreTechnologies();
        
        // 카테고리별 개수
        List<Object[]> categoryCounts = jpaRepository.countByCategory();
        List<CategoryCount> categoryCountList = categoryCounts.stream()
                .map(result -> new CategoryCount((String) result[0], (Long) result[1]))
                .collect(Collectors.toList());
        
        // 레벨별 개수
        List<Object[]> levelCounts = jpaRepository.countByLevel();
        List<LevelCount> levelCountList = levelCounts.stream()
                .map(result -> new LevelCount((String) result[0], (Long) result[1]))
                .collect(Collectors.toList());
        
        return new TechStackStatistics(
                totalTechnologies != null ? totalTechnologies : 0L,
                coreTechnologies != null ? coreTechnologies : 0L,
                totalTechnologies != null ? totalTechnologies : 0L,
                categoryCountList,
                levelCountList
        );
    }
}

