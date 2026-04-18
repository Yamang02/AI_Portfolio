package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.port.in.GetTechStackMetadataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.TechStackMetadataRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 기술 스택 메타데이터 서비스
 * 기술 스택 메타데이터 관련 비즈니스 로직을 구현
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TechStackMetadataService implements GetTechStackMetadataUseCase {
    
    private final TechStackMetadataRepositoryPort repositoryPort;
    
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
        long totalTechnologies = repositoryPort.countActiveTechnologies();
        long coreTechnologies = repositoryPort.countCoreTechnologies();

        List<CategoryCount> categoryCountList = repositoryPort.countByCategory().stream()
                .map(result -> new CategoryCount(result.key(), result.count()))
                .toList();

        List<LevelCount> levelCountList = repositoryPort.countByLevel().stream()
                .map(result -> new LevelCount(result.key(), result.count()))
                .toList();

        return new TechStackStatistics(
                totalTechnologies,
                coreTechnologies,
                totalTechnologies,
                categoryCountList,
                levelCountList
        );
    }
}
