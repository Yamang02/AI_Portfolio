package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.common.util.BusinessIdGenerator;
import com.aiportfolio.backend.application.common.util.MetadataHelper;
import com.aiportfolio.backend.application.common.util.TextFieldHelper;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.EducationJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.EducationProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.EducationTechStackJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.TechStackMetadataJpaRepository;
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
    private final EducationJpaRepository educationJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;
    private final ProjectJpaRepository projectJpaRepository;
    private final EducationTechStackJpaRepository educationTechStackJpaRepository;
    private final EducationProjectJpaRepository educationProjectJpaRepository;

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
        replaceTechStacks(educationBusinessId, techStacks);
        replaceProjects(educationBusinessId, projects);
    }

    private void replaceTechStacks(String educationBusinessId, List<TechStackRelation> relationships) {
        EducationJpaEntity education = educationJpaRepository.findByBusinessId(educationBusinessId)
            .orElseThrow(() -> new IllegalArgumentException("Education not found: " + educationBusinessId));

        educationTechStackJpaRepository.deleteByEducationId(education.getId());

        if (relationships == null || relationships.isEmpty()) {
            return;
        }

        for (TechStackRelation item : relationships) {
            if (item.techStackId() == null) {
                throw new IllegalArgumentException("Tech stack ID must not be null");
            }

            TechStackMetadataJpaEntity techStack = techStackMetadataJpaRepository.findById(item.techStackId())
                .orElseThrow(() -> new IllegalArgumentException("TechStack not found: " + item.techStackId()));

            EducationTechStackJpaEntity relation = EducationTechStackJpaEntity.builder()
                .education(education)
                .techStack(techStack)
                .isPrimary(item.isPrimary())
                .usageDescription(item.usageDescription())
                .build();

            educationTechStackJpaRepository.save(relation);
        }
    }

    private void replaceProjects(String educationBusinessId, List<ProjectRelation> relationships) {
        EducationJpaEntity education = educationJpaRepository.findByBusinessId(educationBusinessId)
            .orElseThrow(() -> new IllegalArgumentException("Education not found: " + educationBusinessId));

        educationProjectJpaRepository.deleteByEducationId(education.getId());

        if (relationships == null || relationships.isEmpty()) {
            return;
        }

        for (ProjectRelation item : relationships) {
            if (item.projectBusinessId() == null || item.projectBusinessId().isBlank()) {
                throw new IllegalArgumentException("Project business ID must not be blank");
            }

            ProjectJpaEntity project = projectJpaRepository.findByBusinessId(item.projectBusinessId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + item.projectBusinessId()));

            EducationProjectJpaEntity relation = EducationProjectJpaEntity.builder()
                .education(education)
                .project(project)
                .projectType(item.projectType())
                .grade(item.grade())
                .build();

            educationProjectJpaRepository.save(relation);
        }
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void updateEducationSortOrder(Map<String, Integer> sortOrderUpdates) {
        log.info("Updating education sort orders: {} items", sortOrderUpdates.size());

        // 모든 Education 조회 및 스냅샷 생성 (원본 보호)
        List<Education> allEducations = portfolioRepositoryPort.findAllEducationsWithoutCache();
        List<Education> originalSnapshot = new ArrayList<>();
        for (Education edu : allEducations) {
            Education snapshot = Education.builder()
                .id(edu.getId())
                .title(edu.getTitle())
                .description(edu.getDescription())
                .organization(edu.getOrganization())
                .degree(edu.getDegree())
                .major(edu.getMajor())
                .startDate(edu.getStartDate())
                .endDate(edu.getEndDate())
                .gpa(edu.getGpa())
                .type(edu.getType())
                .projects(edu.getProjects())
                .sortOrder(edu.getSortOrder())
                .createdAt(edu.getCreatedAt())
                .updatedAt(edu.getUpdatedAt())
                .build();
            originalSnapshot.add(snapshot);
        }

        // 각 업데이트에 대해 자동 재정렬 수행
        for (Map.Entry<String, Integer> entry : sortOrderUpdates.entrySet()) {
            String id = entry.getKey();
            Integer newSortOrder = entry.getValue();

            // 현재 Education 찾기
            Education targetEducation = allEducations.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + id));

            Integer oldSortOrder = targetEducation.getSortOrder();

            // 자동 재정렬 수행
            List<Education> reordered = reorderEducations(
                allEducations,
                targetEducation,
                oldSortOrder,
                newSortOrder
            );

            // 재정렬된 Education들 중 변경된 것만 저장
            Map<String, Education> originalMap = originalSnapshot.stream()
                .collect(java.util.stream.Collectors.toMap(Education::getId, e -> e));
            
            for (Education edu : reordered) {
                Education original = originalMap.get(edu.getId());
                
                // sortOrder가 변경된 것만 저장 (updatedAt 갱신)
                if (original != null && !original.getSortOrder().equals(edu.getSortOrder())) {
                    edu.setUpdatedAt(MetadataHelper.setupUpdatedAt());
                    portfolioRepositoryPort.saveEducation(edu);
                }
            }

            // 다음 업데이트를 위해 목록 갱신 및 스냅샷 업데이트
            allEducations = reordered;
            originalSnapshot = new ArrayList<>();
            for (Education edu : allEducations) {
                Education snapshot = Education.builder()
                    .id(edu.getId())
                    .title(edu.getTitle())
                    .description(edu.getDescription())
                    .organization(edu.getOrganization())
                    .degree(edu.getDegree())
                    .major(edu.getMajor())
                    .startDate(edu.getStartDate())
                    .endDate(edu.getEndDate())
                    .gpa(edu.getGpa())
                    .type(edu.getType())
                    .projects(edu.getProjects())
                    .sortOrder(edu.getSortOrder())
                    .createdAt(edu.getCreatedAt())
                    .updatedAt(edu.getUpdatedAt())
                    .build();
                originalSnapshot.add(snapshot);
            }
        }

        log.info("Education sort orders updated successfully");
    }

    public record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {
    }

    public record ProjectRelation(String projectBusinessId, String projectType, String grade) {
    }

    /**
     * Education 자동 재정렬
     */
    private List<Education> reorderEducations(
            List<Education> allEducations,
            Education targetEducation,
            Integer oldSortOrder,
            Integer newSortOrder) {
        
        List<Education> result = new ArrayList<>();
        String targetId = targetEducation.getId();

        if (oldSortOrder == newSortOrder) {
            return allEducations;
        }

        if (oldSortOrder < newSortOrder) {
            // 뒤로 이동
            for (Education edu : allEducations) {
                if (edu.getId().equals(targetId)) {
                    result.add(createUpdatedEducation(edu, newSortOrder));
                } else if (edu.getSortOrder() != null &&
                          edu.getSortOrder() > oldSortOrder &&
                          edu.getSortOrder() <= newSortOrder) {
                    result.add(createUpdatedEducation(edu, edu.getSortOrder() - 1));
                } else {
                    result.add(edu);
                }
            }
        } else {
            // 앞으로 이동
            for (Education edu : allEducations) {
                if (edu.getId().equals(targetId)) {
                    result.add(createUpdatedEducation(edu, newSortOrder));
                } else if (edu.getSortOrder() != null &&
                          edu.getSortOrder() >= newSortOrder &&
                          edu.getSortOrder() < oldSortOrder) {
                    result.add(createUpdatedEducation(edu, edu.getSortOrder() + 1));
                } else {
                    result.add(edu);
                }
            }
        }

        return result;
    }

    /**
     * sortOrder만 변경된 Education 생성 (원본을 보호하기 위해 복사본 생성)
     * 
     * Note: updatedAt은 호출하는 측에서 변경 여부를 확인하고 설정해야 함
     */
    private Education createUpdatedEducation(Education original, Integer newSortOrder) {
        return Education.builder()
            .id(original.getId())
            .title(original.getTitle())
            .description(original.getDescription())
            .organization(original.getOrganization())
            .degree(original.getDegree())
            .major(original.getMajor())
            .startDate(original.getStartDate())
            .endDate(original.getEndDate())
            .gpa(original.getGpa())
            .type(original.getType())
            .projects(original.getProjects())
            .sortOrder(newSortOrder)
            .createdAt(original.getCreatedAt())
            .updatedAt(original.getUpdatedAt())
            .build();
    }
}

