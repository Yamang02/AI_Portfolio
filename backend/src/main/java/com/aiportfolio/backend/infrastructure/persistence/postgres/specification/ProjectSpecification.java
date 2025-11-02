package com.aiportfolio.backend.infrastructure.persistence.postgres.specification;

import com.aiportfolio.backend.domain.admin.model.vo.ProjectFilter;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * 프로젝트 필터링을 위한 JPA Specification
 * 동적 쿼리 생성에 사용됩니다.
 */
public class ProjectSpecification {

    /**
     * ProjectFilter에 따라 Specification을 생성합니다.
     * 
     * @param filter 필터 조건
     * @return Specification 객체
     */
    public static Specification<ProjectJpaEntity> withFilter(ProjectFilter filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 검색 쿼리 필터 (제목 또는 설명에 포함)
            if (filter.hasSearchQuery()) {
                String searchPattern = "%" + filter.getSearchQuery().toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), 
                    searchPattern
                );
                Predicate descriptionPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), 
                    searchPattern
                );
                predicates.add(criteriaBuilder.or(titlePredicate, descriptionPredicate));
            }

            // 팀 프로젝트 필터
            if (filter.isTeamFilter()) {
                predicates.add(criteriaBuilder.isTrue(root.get("isTeam")));
            } else if (filter.isIndividualFilter()) {
                predicates.add(criteriaBuilder.isFalse(root.get("isTeam")));
            }

            // 프로젝트 타입 필터
            if (!filter.isAllType()) {
                predicates.add(criteriaBuilder.equal(root.get("type"), filter.getProjectType()));
            }

            // 상태 필터
            if (!filter.isAllStatus()) {
                predicates.add(
                    criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("status")), 
                        filter.getStatus().toLowerCase()
                    )
                );
            }

            // 기술 스택 필터 (JOIN 필요)
            if (filter.hasTechFilter()) {
                Join<ProjectJpaEntity, ProjectTechStackJpaEntity> techStackJoin = 
                    root.join("projectTechStacks", JoinType.INNER);
                Join<ProjectTechStackJpaEntity, TechStackMetadataJpaEntity> techMetadataJoin = 
                    techStackJoin.join("techStack", JoinType.INNER);
                
                // 대소문자 구분 없이 비교 (selectedTechs의 각 항목을 소문자로 변환하여 비교)
                List<Predicate> techStackPredicates = new ArrayList<>();
                for (String techName : filter.getSelectedTechs()) {
                    techStackPredicates.add(
                        criteriaBuilder.equal(
                            criteriaBuilder.lower(techMetadataJoin.get("name")),
                            techName.toLowerCase()
                        )
                    );
                }
                // OR 조건: 선택된 기술 스택 중 하나라도 일치하면 됨
                predicates.add(criteriaBuilder.or(techStackPredicates.toArray(new Predicate[0])));
                
                // 중복 제거를 위한 distinct
                query.distinct(true);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

