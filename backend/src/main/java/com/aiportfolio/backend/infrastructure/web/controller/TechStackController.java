package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.port.in.GetTechStackMetadataUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.techstack.TechStackMetadataDto;
import com.aiportfolio.backend.infrastructure.web.dto.techstack.TechStackStatisticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 기술 스택 메타데이터 API Controller
 * 기술 스택 메타데이터 관련 REST API 엔드포인트를 제공
 */
@RestController
@RequestMapping("/api/tech-stack")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class TechStackController {
    
    private final GetTechStackMetadataUseCase getTechStackMetadataUseCase;
    
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
}

