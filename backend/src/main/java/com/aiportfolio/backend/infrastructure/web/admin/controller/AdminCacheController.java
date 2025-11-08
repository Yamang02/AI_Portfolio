package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.admin.port.in.ManageCacheUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 관리자 캐시 관리 컨트롤러
 * 관리자 권한이 필요한 Redis 캐시 관리 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/admin/cache")
@RequiredArgsConstructor
@Slf4j
public class AdminCacheController {

    private final ManageCacheUseCase manageCacheUseCase;

    /**
     * Redis 캐시 전체 flush
     */
    @PostMapping("/flush")
    public ResponseEntity<Map<String, Object>> flushCache() {
        log.info("Admin cache flush requested");
        
        try {
            manageCacheUseCase.flushAllCache();
            log.info("Cache flush completed successfully");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "캐시가 성공적으로 초기화되었습니다.",
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            log.error("Cache flush failed", e);
            
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "캐시 초기화 중 오류가 발생했습니다: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * Redis 캐시 통계 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        log.info("Admin cache stats requested");

        try {
            Map<String, Object> stats = manageCacheUseCase.getCacheStats();
            log.info("Cache stats retrieved successfully");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            log.error("Cache stats retrieval failed", e);

            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "캐시 통계 조회 중 오류가 발생했습니다: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 캐시 키 목록 조회 (패턴 지원)
     * pattern 파라미터가 없으면 모든 키를 조회합니다.
     */
    @GetMapping("/keys")
    public ResponseEntity<Map<String, Object>> getCacheKeys(
            @RequestParam(required = false, defaultValue = "*") String pattern) {
        log.info("Admin cache keys by pattern requested: {}", pattern);

        try {
            List<String> keys = manageCacheUseCase.getCacheKeysByPattern(pattern);
            log.info("Cache keys retrieved successfully: {} keys for pattern {}", keys.size(), pattern);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", keys,
                "pattern", pattern,
                "count", keys.size(),
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            log.error("Cache keys by pattern retrieval failed: {}", pattern, e);

            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "패턴별 캐시 키 조회 중 오류가 발생했습니다: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 패턴별 캐시 삭제
     */
    @DeleteMapping("/pattern")
    public ResponseEntity<Map<String, Object>> clearCacheByPattern(
            @RequestParam String pattern) {
        log.info("Admin cache clear by pattern requested: {}", pattern);

        try {
            manageCacheUseCase.evictCacheByPattern(pattern);
            log.info("Cache cleared by pattern successfully: {}", pattern);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "패턴별 캐시가 성공적으로 삭제되었습니다.",
                "pattern", pattern,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            log.error("Cache clear by pattern failed: {}", pattern, e);

            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "패턴별 캐시 삭제 중 오류가 발생했습니다: " + e.getMessage(),
                "pattern", pattern,
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
}
