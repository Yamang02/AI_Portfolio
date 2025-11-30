package com.aiportfolio.backend.infrastructure.cache;

import com.aiportfolio.backend.domain.monitoring.model.CloudProvider;
import com.aiportfolio.backend.domain.monitoring.model.CloudUsage;
import com.aiportfolio.backend.domain.monitoring.port.out.CloudUsageCachePort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Redis 기반 CloudUsage 캐시 어댑터
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisCloudUsageCacheAdapter implements CloudUsageCachePort {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void saveUsage(String key, CloudUsage usage, long ttlSeconds) {
        try {
            String json = objectMapper.writeValueAsString(usage);
            redisTemplate.opsForValue().set(key, json, ttlSeconds, TimeUnit.SECONDS);
            log.debug("Cached cloud usage: key={}, ttl={}s", key, ttlSeconds);
        } catch (Exception e) {
            // 캐시 실패는 조용히 처리 (fallback to API)
            log.warn("Failed to cache cloud usage: key={}", key, e);
        }
    }

    @Override
    public CloudUsage getUsage(String key) {
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json == null) {
                return null;
            }
            CloudUsage usage = objectMapper.readValue(json, CloudUsage.class);
            log.debug("Retrieved cloud usage from cache: key={}", key);
            return usage;
        } catch (Exception e) {
            log.warn("Failed to retrieve cloud usage from cache: key={}", key, e);
            return null;
        }
    }

    @Override
    public boolean exists(String key) {
        try {
            Boolean exists = redisTemplate.hasKey(key);
            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            log.warn("Failed to check cache existence: key={}", key, e);
            return false;
        }
    }

    @Override
    public void saveDailyUsage(CloudProvider provider, LocalDate date, CloudUsage usage) {
        try {
            String key = generateDailyKey(provider, date);
            String json = objectMapper.writeValueAsString(usage);
            // 90일 TTL로 저장 (히스토리 데이터)
            redisTemplate.opsForValue().set(key, json, 90, TimeUnit.DAYS);
            log.debug("Saved daily usage: key={}, date={}", key, date);
        } catch (Exception e) {
            log.warn("Failed to save daily usage: provider={}, date={}", provider, date, e);
        }
    }

    @Override
    public CloudUsage getDailyUsage(CloudProvider provider, LocalDate date) {
        try {
            String key = generateDailyKey(provider, date);
            String json = redisTemplate.opsForValue().get(key);
            if (json == null) {
                return null;
            }
            CloudUsage usage = objectMapper.readValue(json, CloudUsage.class);
            log.debug("Retrieved daily usage: key={}", key);
            return usage;
        } catch (Exception e) {
            log.warn("Failed to retrieve daily usage: provider={}, date={}", provider, date, e);
            return null;
        }
    }

    @Override
    public List<CloudUsage> getDailyUsageRange(CloudProvider provider, LocalDate startDate, LocalDate endDate) {
        List<CloudUsage> usages = new ArrayList<>();
        try {
            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                CloudUsage usage = getDailyUsage(provider, date);
                if (usage != null) {
                    usages.add(usage);
                }
            }
            log.debug("Retrieved daily usage range: provider={}, start={}, end={}, count={}", 
                provider, startDate, endDate, usages.size());
        } catch (Exception e) {
            log.warn("Failed to retrieve daily usage range: provider={}, start={}, end={}", 
                provider, startDate, endDate, e);
        }
        return usages;
    }

    /**
     * 날짜별 키 생성
     */
    private String generateDailyKey(CloudProvider provider, LocalDate date) {
        return String.format("cloud_usage:daily:%s:%s", provider.name(), date);
    }
}

