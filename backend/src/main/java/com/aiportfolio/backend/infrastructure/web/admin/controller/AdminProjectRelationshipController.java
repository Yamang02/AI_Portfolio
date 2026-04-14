package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.portfolio.port.out.ProjectRelationshipPort;
import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.admin.AdminApiErrorMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.relationship.BulkTechStackRelationshipRequest;
import com.aiportfolio.backend.infrastructure.web.dto.relationship.TechStackRelationshipDto;
import com.aiportfolio.backend.infrastructure.web.dto.relationship.TechStackRelationshipRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Project 관계 관리 REST API Controller
 *
 * 책임: Project-기술스택 관계 CRUD
 */
@RestController
@RequestMapping("/api/admin/projects/{id}")
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminProjectRelationshipController {

    private final ProjectRelationshipPort projectRelationshipPort;

    // ==================== 기술스택 관계 ====================

    @GetMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<List<TechStackRelationshipDto>>> getTechStackRelationships(
            @PathVariable String id) {
        try {
            List<ProjectRelationshipPort.ProjectTechStackRow> rows =
                    projectRelationshipPort.listTechStacksByProjectBusinessId(id);

            List<TechStackRelationshipDto> dtos = rows.stream()
                    .map(rel -> TechStackRelationshipDto.builder()
                            .id(rel.id())
                            .techStackId(rel.techStackId())
                            .techStackName(rel.techStackName())
                            .techStackDisplayName(rel.techStackDisplayName())
                            .category(rel.category())
                            .isPrimary(rel.isPrimary())
                            .usageDescription(rel.usageDescription())
                            .build())
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching tech stack relationships", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationQueryFailed(e)));
        }
    }

    @PostMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<Void>> addTechStackRelationship(
            @PathVariable String id,
            @RequestBody TechStackRelationshipRequest request) {
        try {
            projectRelationshipPort.addTechStackByProjectBusinessId(
                    id,
                    request.getTechStackId(),
                    request.getIsPrimary() != null ? request.getIsPrimary() : false,
                    request.getUsageDescription());

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.TECH_STACK_RELATION_ADD_SUCCESS));
        } catch (IllegalArgumentException e) {
            if (AdminApiErrorMessages.RELATION_ALREADY_EXISTS.equals(e.getMessage())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(AdminApiErrorMessages.RELATION_ALREADY_EXISTS));
            }
            log.error("Error adding tech stack relationship", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationAddFailed(e)));
        } catch (Exception e) {
            log.error("Error adding tech stack relationship", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationAddFailed(e)));
        }
    }

    @DeleteMapping("/tech-stacks/{techStackId}")
    public ResponseEntity<ApiResponse<Void>> deleteTechStackRelationship(
            @PathVariable String id,
            @PathVariable Long techStackId) {
        try {
            projectRelationshipPort.deleteTechStackByProjectBusinessId(id, techStackId);

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.TECH_STACK_RELATION_DELETE_SUCCESS));
        } catch (Exception e) {
            log.error("Error deleting tech stack relationship", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationDeleteFailed(e)));
        }
    }

    /**
     * 기술스택 관계 일괄 업데이트 (원자적 트랜잭션 보장)
     *
     * 기존 관계 전체 삭제 후 새 관계 생성
     * 하나라도 실패하면 전체 롤백
     */
    @PutMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<Void>> updateTechStackRelationships(
            @PathVariable String id,
            @RequestBody BulkTechStackRelationshipRequest request) {
        try {
            List<BulkTechStackRelationshipRequest.TechStackRelationshipItem> items =
                    request.getTechStackRelationships() != null
                            ? request.getTechStackRelationships()
                            : List.of();
            List<ProjectRelationshipPort.TechStackRelation> relationships = items.stream()
                    .map(item -> new ProjectRelationshipPort.TechStackRelation(
                            item.getTechStackId(),
                            Boolean.TRUE.equals(item.getIsPrimary()),
                            item.getUsageDescription()))
                    .toList();

            projectRelationshipPort.replaceTechStacksByProjectBusinessId(id, relationships);

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.TECH_STACK_RELATION_BULK_UPDATE_SUCCESS));
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating tech stack relationships", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationBulkUpdateFailed(e)));
        }
    }
}
