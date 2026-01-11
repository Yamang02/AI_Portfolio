package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.common.util.BusinessIdGenerator;
import com.aiportfolio.backend.application.common.util.MetadataHelper;
import com.aiportfolio.backend.application.common.util.SortOrderService;
import com.aiportfolio.backend.application.common.util.TextFieldHelper;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.port.out.EducationRelationshipPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.EducationJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Admin 전용 Education 관리 서비스
 *
 * 책임: Education 생성/수정/삭제 UseCase 구현
 * 특징: Cache Evict로 캐시 자동 무효화
 */
@Service("manageEducationService")
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManageEducationService implements ManageEducationUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final EducationRelationshipPort educationRelationshipPort;
    private final SortOrderService sortOrderService;
    private final EducationJpaRepository educationJpaRepository;
    private final ProjectJpaRepository projectJpaRepository;

    public Education createEducationWithRelations(Education education,
                                                  List<TechStackRelation> techStacks,
                                                  List<ProjectRelation> projects) {
        Education created = createEducation(education);
        replaceAllRelationships(created.getId(), techStacks, projects);
        return created;
    }

    public Education updateEducationWithRelations(String id,
                                                  Education education,
                                                  List<TechStackRelation> techStacks,
                                                  List<ProjectRelation> projects) {
        Education updated = updateEducation(id, education);
        replaceAllRelationships(updated.getId(), techStacks, projects);
        return updated;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Education createEducation(Education education) {
        log.info("Creating new education: {}", education.getTitle());

        // ID 자동 생성 (생성 시에만)
        if (education.getId() == null || education.getId().isEmpty()) {
            Optional<String> lastBusinessId = portfolioRepositoryPort.findLastBusinessIdByPrefix(BusinessIdGenerator.Prefix.EDUCATION);
            String generatedId = BusinessIdGenerator.generate(BusinessIdGenerator.Prefix.EDUCATION, lastBusinessId);
            education.setId(generatedId);
        }

        // 정렬 순서 자동 할당 (DB 쿼리 방식 - 더 효율적)
        if (education.getSortOrder() == null) {
            int maxSortOrder = portfolioRepositoryPort.findMaxEducationSortOrder();
            education.setSortOrder(maxSortOrder + 1);
        }

        // 필수 필드: 정규화 없음 (유효성 검증에서 처리)
        // title, organization은 필수 필드이므로 정규화하지 않음

        // 선택 필드: 정규화 적용
        education.setDescription(TextFieldHelper.normalizeText(education.getDescription()));
        education.setDegree(TextFieldHelper.normalizeText(education.getDegree()));
        education.setMajor(TextFieldHelper.normalizeText(education.getMajor()));

        // 메타데이터 설정
        education.setCreatedAt(MetadataHelper.setupCreatedAt(education.getCreatedAt()));
        education.setUpdatedAt(MetadataHelper.setupUpdatedAt());

        Education saved = portfolioRepositoryPort.saveEducation(education);

        log.info("Education created successfully: {}", saved.getId());
        return saved;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Education updateEducation(String id, Education education) {
        log.info("Updating education: {}", id);

        // 존재 여부 확인
        Education existing = portfolioRepositoryPort.findEducationById(id)
            .orElseThrow(() -> new IllegalArgumentException("Education not found: " + id));

        // ID 유지 (변경 불가)
        education.setId(existing.getId());

        // 생성 시간 유지
        education.setCreatedAt(existing.getCreatedAt());

        // 필수 필드: 정규화 없음 (유효성 검증에서 처리)
        // title, organization은 필수 필드이므로 정규화하지 않음

        // 선택 필드: 정규화 적용
        education.setDescription(TextFieldHelper.normalizeText(education.getDescription()));
        education.setDegree(TextFieldHelper.normalizeText(education.getDegree()));
        education.setMajor(TextFieldHelper.normalizeText(education.getMajor()));

        // 수정 시간 갱신
        education.setUpdatedAt(MetadataHelper.setupUpdatedAt());

        Education updated = portfolioRepositoryPort.saveEducation(education);

        log.info("Education updated successfully: {}", updated.getId());
        return updated;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void deleteEducation(String id) {
        log.info("Deleting education: {}", id);

        if (!portfolioRepositoryPort.findEducationById(id).isPresent()) {
            throw new IllegalArgumentException("Education not found: " + id);
        }

        portfolioRepositoryPort.deleteEducation(id);

        log.info("Education deleted successfully: {}", id);
    }

    private void replaceAllRelationships(String educationBusinessId,
                                         List<TechStackRelation> techStacks,
                                         List<ProjectRelation> projects) {
        // Education businessId를 DB ID로 변환
        EducationJpaEntity educationEntity = educationJpaRepository.findByBusinessId(educationBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + educationBusinessId));
        Long educationId = educationEntity.getId();
        
        if (techStacks != null) {
            List<EducationRelationshipPort.TechStackRelation> portTechStackRelations = techStacks.stream()
                    .map(rel -> new EducationRelationshipPort.TechStackRelation(
                            rel.techStackId(), rel.isPrimary(), rel.usageDescription()))
                    .collect(java.util.stream.Collectors.toList());
            educationRelationshipPort.replaceTechStacks(educationId, portTechStackRelations);
        }
        
        if (projects != null) {
            List<EducationRelationshipPort.ProjectRelation> portProjectRelations = projects.stream()
                    .map(rel -> {
                        // Project businessId를 DB ID로 변환
                        ProjectJpaEntity projectEntity = projectJpaRepository.findByBusinessId(rel.projectBusinessId())
                                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + rel.projectBusinessId()));
                        return new EducationRelationshipPort.ProjectRelation(
                                projectEntity.getId(), rel.projectType(), rel.grade()); // projectEntity.getId()는 DB ID (Long)
                    })
                    .collect(java.util.stream.Collectors.toList());
            educationRelationshipPort.replaceProjects(educationId, portProjectRelations);
        }
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void updateEducationSortOrder(Map<String, Integer> sortOrderUpdates) {
        log.info("Updating education sort orders: {} items", sortOrderUpdates.size());

        // 모든 Education 조회
        List<Education> allEducations = portfolioRepositoryPort.findAllEducationsWithoutCache();

        // 원본 정렬 순서 저장 (변경 추적용)
        Map<String, Integer> originalSortOrders = allEducations.stream()
                .collect(java.util.stream.Collectors.toMap(Education::getId, Education::getSortOrder));

        // 각 업데이트에 대해 자동 재정렬 수행
        for (Map.Entry<String, Integer> entry : sortOrderUpdates.entrySet()) {
            allEducations = sortOrderService.reorder(allEducations, entry.getKey(), entry.getValue());
        }

        // 변경된 항목만 저장
        List<Education> toUpdate = allEducations.stream()
                .filter(edu -> !Objects.equals(edu.getSortOrder(), originalSortOrders.get(edu.getId())))
                .peek(edu -> edu.setUpdatedAt(MetadataHelper.setupUpdatedAt()))
                .collect(java.util.stream.Collectors.toList());

        if (!toUpdate.isEmpty()) {
            portfolioRepositoryPort.batchUpdateEducations(toUpdate);
        }

        log.info("Education sort orders updated successfully");
    }

    public record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {
    }

    public record ProjectRelation(String projectBusinessId, String projectType, String grade) {
    }
}

