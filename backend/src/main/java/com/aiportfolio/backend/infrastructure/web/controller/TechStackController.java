package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.port.in.GetTechStackMetadataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageTechStackMetadataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsByTechStackUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.UpdateTechStackSortOrderUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.techstack.TechStackMetadataDto;
import com.aiportfolio.backend.infrastructure.web.dto.techstack.TechStackStatisticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 기술 스택 메타데이터 API Controller
 * 기술 스택 메타데이터 관련 REST API 엔드포인트를 제공
 */
@RestController
@RequestMapping("/api/tech-stack")
@RequiredArgsConstructor
public class TechStackController {
    
    private final GetTechStackMetadataUseCase getTechStackMetadataUseCase;
    private final ManageTechStackMetadataUseCase manageTechStackMetadataUseCase;
    private final GetProjectsByTechStackUseCase getProjectsByTechStackUseCase;
    private final UpdateTechStackSortOrderUseCase updateTechStackSortOrderUseCase;
    
    /**
     * 모든 활성화된 기술 스택 메타데이터 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TechStackMetadataDto>>> getAllTechStackMetadata() {
        try {
            List<TechStackMetadata> techStackMetadataList = getTechStackMetadataUseCase.getAllActiveTechStackMetadata();
            List<TechStackMetadataDto> dtoList = techStackMetadataList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(dtoList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("기술 스택 메타데이터 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 핵심 기술 스택 메타데이터만 조회
     */
    @GetMapping("/core")
    public ResponseEntity<ApiResponse<List<TechStackMetadataDto>>> getCoreTechStackMetadata() {
        try {
            List<TechStackMetadata> techStackMetadataList = getTechStackMetadataUseCase.getCoreTechStackMetadata();
            List<TechStackMetadataDto> dtoList = techStackMetadataList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(dtoList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("핵심 기술 스택 메타데이터 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 기술명으로 기술 스택 메타데이터 조회
     */
    @GetMapping("/{name}")
    public ResponseEntity<ApiResponse<TechStackMetadataDto>> getTechStackMetadataByName(@PathVariable String name) {
        try {
            Optional<TechStackMetadata> techStackMetadata = getTechStackMetadataUseCase.getTechStackMetadataByName(name);
            
            if (techStackMetadata.isPresent()) {
                TechStackMetadataDto dto = convertToDto(techStackMetadata.get());
                return ResponseEntity.ok(ApiResponse.success(dto));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("기술 스택 메타데이터 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 카테고리별 기술 스택 메타데이터 조회
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<TechStackMetadataDto>>> getTechStackMetadataByCategory(@PathVariable String category) {
        try {
            List<TechStackMetadata> techStackMetadataList = getTechStackMetadataUseCase.getTechStackMetadataByCategory(category);
            List<TechStackMetadataDto> dtoList = techStackMetadataList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(dtoList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("카테고리별 기술 스택 메타데이터 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 레벨별 기술 스택 메타데이터 조회
     */
    @GetMapping("/level/{level}")
    public ResponseEntity<ApiResponse<List<TechStackMetadataDto>>> getTechStackMetadataByLevel(@PathVariable String level) {
        try {
            List<TechStackMetadata> techStackMetadataList = getTechStackMetadataUseCase.getTechStackMetadataByLevel(level);
            List<TechStackMetadataDto> dtoList = techStackMetadataList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(dtoList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("레벨별 기술 스택 메타데이터 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 카테고리와 레벨로 기술 스택 메타데이터 조회
     */
    @GetMapping("/category/{category}/level/{level}")
    public ResponseEntity<ApiResponse<List<TechStackMetadataDto>>> getTechStackMetadataByCategoryAndLevel(
            @PathVariable String category, 
            @PathVariable String level) {
        try {
            List<TechStackMetadata> techStackMetadataList = getTechStackMetadataUseCase.getTechStackMetadataByCategoryAndLevel(category, level);
            List<TechStackMetadataDto> dtoList = techStackMetadataList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(dtoList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("카테고리와 레벨별 기술 스택 메타데이터 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 기술명 검색
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TechStackMetadataDto>>> searchTechStackMetadata(@RequestParam String name) {
        try {
            List<TechStackMetadata> techStackMetadataList = getTechStackMetadataUseCase.searchTechStackMetadataByName(name);
            List<TechStackMetadataDto> dtoList = techStackMetadataList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(dtoList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("기술 스택 메타데이터 검색 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 프로젝트에서 사용된 기술 스택들의 메타데이터 조회
     */
    @GetMapping("/used-in-projects")
    public ResponseEntity<ApiResponse<List<TechStackMetadataDto>>> getTechnologiesUsedInProjects() {
        try {
            List<TechStackMetadata> techStackMetadataList = getTechStackMetadataUseCase.getTechnologiesUsedInProjects();
            List<TechStackMetadataDto> dtoList = techStackMetadataList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(dtoList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("프로젝트에서 사용된 기술 스택 메타데이터 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 기술 스택 통계 정보 조회
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<TechStackStatisticsDto>> getTechStackStatistics() {
        try {
            GetTechStackMetadataUseCase.TechStackStatistics statistics = getTechStackMetadataUseCase.getTechStackStatistics();
            TechStackStatisticsDto dto = convertToDto(statistics);
            
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("기술 스택 통계 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 도메인 모델을 DTO로 변환
     */
    private TechStackMetadataDto convertToDto(TechStackMetadata techStackMetadata) {
        return TechStackMetadataDto.builder()
                .name(techStackMetadata.getName())
                .displayName(techStackMetadata.getDisplayName())
                .category(techStackMetadata.getCategory())
                .level(techStackMetadata.getLevel())
                .isCore(techStackMetadata.getIsCore())
                .isActive(techStackMetadata.getIsActive())
                .iconUrl(techStackMetadata.getIconUrl())
                .colorHex(techStackMetadata.getColorHex())
                .description(techStackMetadata.getDescription())
                .sortOrder(techStackMetadata.getSortOrder())
                .createdAt(techStackMetadata.getCreatedAt())
                .updatedAt(techStackMetadata.getUpdatedAt())
                .build();
    }
    
    /**
     * 통계 도메인 모델을 DTO로 변환
     */
    private TechStackStatisticsDto convertToDto(GetTechStackMetadataUseCase.TechStackStatistics statistics) {
        List<TechStackStatisticsDto.CategoryCountDto> categoryCounts = statistics.categoryCounts().stream()
                .map(categoryCount -> TechStackStatisticsDto.CategoryCountDto.builder()
                        .category(categoryCount.category())
                        .count(categoryCount.count())
                        .build())
                .collect(Collectors.toList());
        
        List<TechStackStatisticsDto.LevelCountDto> levelCounts = statistics.levelCounts().stream()
                .map(levelCount -> TechStackStatisticsDto.LevelCountDto.builder()
                        .level(levelCount.level())
                        .count(levelCount.count())
                        .build())
                .collect(Collectors.toList());
        
        return TechStackStatisticsDto.builder()
                .totalTechnologies(statistics.totalTechnologies())
                .coreTechnologies(statistics.coreTechnologies())
                .activeTechnologies(statistics.activeTechnologies())
                .categoryCounts(categoryCounts)
                .levelCounts(levelCounts)
                .build();
    }
    
    // ==================== 관리 기능 ====================
    
    /**
     * 기술 스택 메타데이터 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TechStackMetadataDto>> createTechStackMetadata(@RequestBody TechStackMetadataDto dto) {
        try {
            TechStackMetadata techStackMetadata = convertToDomain(dto);
            TechStackMetadata created = manageTechStackMetadataUseCase.createTechStackMetadata(techStackMetadata);
            TechStackMetadataDto responseDto = convertToDto(created);
            
            return ResponseEntity.ok(ApiResponse.success(responseDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("기술 스택 메타데이터 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 기술 스택 메타데이터 수정
     */
    @PutMapping("/{name}")
    public ResponseEntity<ApiResponse<TechStackMetadataDto>> updateTechStackMetadata(
            @PathVariable String name, 
            @RequestBody TechStackMetadataDto dto) {
        try {
            System.out.println("=== 기술스택 수정 요청 수신 ===");
            System.out.println("Name: " + name);
            System.out.println("DTO: " + dto);
            
            TechStackMetadata techStackMetadata = convertToDomain(dto);
            TechStackMetadata updated = manageTechStackMetadataUseCase.updateTechStackMetadata(name, techStackMetadata);
            TechStackMetadataDto responseDto = convertToDto(updated);
            
            System.out.println("수정 완료: " + responseDto);
            return ResponseEntity.ok(ApiResponse.success(responseDto));
        } catch (IllegalArgumentException e) {
            System.out.println("수정 실패 (IllegalArgumentException): " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.out.println("수정 실패 (Exception): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("기술 스택 메타데이터 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 기술 스택 메타데이터 삭제
     */
    @DeleteMapping("/{name}")
    public ResponseEntity<ApiResponse<Void>> deleteTechStackMetadata(@PathVariable String name) {
        try {
            manageTechStackMetadataUseCase.deleteTechStackMetadata(name);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("기술 스택 메타데이터 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 기술 스택 메타데이터 활성화/비활성화 토글
     */
    @PatchMapping("/{name}/toggle-status")
    public ResponseEntity<ApiResponse<TechStackMetadataDto>> toggleTechStackMetadataStatus(@PathVariable String name) {
        try {
            TechStackMetadata updated = manageTechStackMetadataUseCase.toggleTechStackMetadataStatus(name);
            TechStackMetadataDto responseDto = convertToDto(updated);
            
            return ResponseEntity.ok(ApiResponse.success(responseDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("기술 스택 메타데이터 상태 변경 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // ==================== 프로젝트 조회 기능 ====================
    
    /**
     * 특정 기술스택을 사용하는 프로젝트 목록 조회
     */
    @GetMapping("/{name}/projects")
    public ResponseEntity<ApiResponse<List<TechStackProjectDto>>> getProjectsByTechStack(@PathVariable String name) {
        try {
            // UseCase를 통해 비즈니스 로직 실행
            List<com.aiportfolio.backend.domain.portfolio.model.Project> projects = 
                getProjectsByTechStackUseCase.getProjectsByTechStack(name);
            
            // 도메인 모델을 DTO로 변환
            List<TechStackProjectDto> projectDtos = projects.stream()
                .map(this::convertProjectToDto)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(projectDtos));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("프로젝트 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // ==================== 정렬 순서 관리 기능 ====================
    
    /**
     * 기술스택의 정렬 순서 변경
     */
    @PatchMapping("/{name}/sort-order")
    public ResponseEntity<ApiResponse<List<TechStackMetadataDto>>> updateSortOrder(
            @PathVariable String name,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer newSortOrder = request.get("sortOrder");
            if (newSortOrder == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("정렬 순서가 필요합니다."));
            }
            
            // UseCase를 통해 정렬 순서 업데이트
            List<TechStackMetadata> updatedTechStacks = 
                updateTechStackSortOrderUseCase.updateSortOrder(name, newSortOrder);
            
            // 도메인 모델을 DTO로 변환
            List<TechStackMetadataDto> techStackDtos = updatedTechStacks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(techStackDtos));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("정렬 순서 업데이트 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 프로젝트 도메인 모델을 DTO로 변환
     */
    private TechStackProjectDto convertProjectToDto(com.aiportfolio.backend.domain.portfolio.model.Project project) {
        TechStackProjectDto dto = new TechStackProjectDto();
        // Project ID는 String이므로 Long으로 변환 시도, 실패하면 null
        try {
            dto.setId(Long.valueOf(project.getId()));
        } catch (NumberFormatException e) {
            dto.setId(null);
        }
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setThumbnailUrl(project.getImageUrl()); // Project 도메인에서는 imageUrl 사용
        dto.setGithubUrl(project.getGithubUrl());
        dto.setDemoUrl(project.getLiveUrl()); // Project 도메인에서는 liveUrl 사용
        dto.setStartDate(project.getStartDate() != null ? project.getStartDate().toString() : null);
        dto.setEndDate(project.getEndDate() != null ? project.getEndDate().toString() : null);
        return dto;
    }
    
    /**
     * DTO를 도메인 모델로 변환
     */
    private TechStackMetadata convertToDomain(TechStackMetadataDto dto) {
        return TechStackMetadata.builder()
                .name(dto.getName())
                .displayName(dto.getDisplayName())
                .category(dto.getCategory())
                .level(dto.getLevel())
                .isCore(dto.getIsCore())
                .isActive(dto.getIsActive())
                .iconUrl(dto.getIconUrl())
                .colorHex(dto.getColorHex())
                .description(dto.getDescription())
                .sortOrder(dto.getSortOrder())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
    
    /**
     * 기술스택별 프로젝트 정보 DTO
     */
    public static class TechStackProjectDto {
        private Long id;
        private String title;
        private String description;
        private String status;
        private String thumbnailUrl;
        private String githubUrl;
        private String demoUrl;
        private String startDate;
        private String endDate;
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
        
        public String getGithubUrl() { return githubUrl; }
        public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
        
        public String getDemoUrl() { return demoUrl; }
        public void setDemoUrl(String demoUrl) { this.demoUrl = demoUrl; }
        
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
    }
}

