package com.aiportfolio.backend.infrastructure.persistence.postgres;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.port.out.TechStackMetadataRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.TechStackMetadataMapper;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.TechStackMetadataJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PostgreSQL 기술 스택 메타데이터 Repository 구현체
 * 기술 스택 메타데이터의 데이터베이스 접근을 구현
 */
@Repository
@RequiredArgsConstructor
public class PostgresTechStackMetadataRepository implements TechStackMetadataRepositoryPort {
    
    private final TechStackMetadataJpaRepository jpaRepository;
    private final TechStackMetadataMapper mapper;
    
    @Override
    public List<TechStackMetadata> findAllActive() {
        List<TechStackMetadataJpaEntity> entities = jpaRepository.findByIsActiveTrueOrderBySortOrderAsc();
        return mapper.toDomainList(entities);
    }
    
    @Override
    public List<TechStackMetadata> findCoreTechnologies() {
        List<TechStackMetadataJpaEntity> entities = jpaRepository.findByIsCoreTrueAndIsActiveTrueOrderBySortOrderAsc();
        return mapper.toDomainList(entities);
    }
    
    @Override
    public Optional<TechStackMetadata> findByName(String name) {
        Optional<TechStackMetadataJpaEntity> entity = jpaRepository.findByName(name);
        return entity.map(mapper::toDomain);
    }
    
    @Override
    public List<TechStackMetadata> findByCategory(String category) {
        List<TechStackMetadataJpaEntity> entities = jpaRepository.findByCategoryAndIsActiveTrueOrderBySortOrderAsc(category);
        return mapper.toDomainList(entities);
    }
    
    @Override
    public List<TechStackMetadata> findByLevel(String level) {
        List<TechStackMetadataJpaEntity> entities = jpaRepository.findByLevelAndIsActiveTrueOrderBySortOrderAsc(level);
        return mapper.toDomainList(entities);
    }
    
    @Override
    public List<TechStackMetadata> findByCategoryAndLevel(String category, String level) {
        List<TechStackMetadataJpaEntity> entities = jpaRepository.findByCategoryAndLevelAndIsActiveTrueOrderBySortOrderAsc(category, level);
        return mapper.toDomainList(entities);
    }
    
    @Override
    public List<TechStackMetadata> findByNames(List<String> names) {
        List<TechStackMetadataJpaEntity> entities = jpaRepository.findByNameInAndIsActiveTrueOrderBySortOrderAsc(names);
        return mapper.toDomainList(entities);
    }
    
    @Override
    public List<TechStackMetadata> findByNameContaining(String name) {
        List<TechStackMetadataJpaEntity> entities = jpaRepository.findByNameContainingIgnoreCaseAndIsActiveTrueOrderBySortOrderAsc(name);
        return mapper.toDomainList(entities);
    }
    
    @Override
    public List<TechStackMetadata> findTechnologiesUsedInProjects() {
        List<TechStackMetadataJpaEntity> entities = jpaRepository.findTechnologiesUsedInProjects();
        return mapper.toDomainList(entities);
    }
    
    @Override
    public TechStackMetadata save(TechStackMetadata techStackMetadata) {
        TechStackMetadataJpaEntity entity = mapper.toEntity(techStackMetadata);
        TechStackMetadataJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }
    
    @Override
    public List<TechStackMetadata> saveAll(List<TechStackMetadata> techStackMetadataList) {
        List<TechStackMetadataJpaEntity> entities = mapper.toEntityList(techStackMetadataList);
        List<TechStackMetadataJpaEntity> savedEntities = jpaRepository.saveAll(entities);
        return mapper.toDomainList(savedEntities);
    }
    
    @Override
    public void deleteByName(String name) {
        jpaRepository.findByName(name).ifPresent(jpaRepository::delete);
    }
    
    @Override
    public boolean existsByName(String name) {
        return jpaRepository.findByName(name).isPresent();
    }
}

