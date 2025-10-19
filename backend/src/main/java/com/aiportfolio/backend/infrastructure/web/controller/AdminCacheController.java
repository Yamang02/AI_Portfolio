package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.application.admin.AdminCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin Cache Management Controller
 * Redis 캐시 관리 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/admin/cache")
@RequiredArgsConstructor
@Slf4j
public class AdminCacheController {

    private final AdminCacheService adminCacheService;

    /**
     * Redis 캐시 전체 flush
     */
    @PostMapping("/flush")
    public ResponseEntity<Map<String, Object>> flushCache() {
        log.info("Admin cache flush requested");
        
        try {
            adminCacheService.flushAllCache();
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
            Map<String, Object> stats = adminCacheService.getCacheStats();
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
}
