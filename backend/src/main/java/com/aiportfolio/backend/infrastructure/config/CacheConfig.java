package com.aiportfolio.backend.infrastructure.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.time.Duration;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    @Primary
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        /*
         * 수동 ObjectMapper.activateDefaultTyping(...) 과 GenericJackson2JsonRedisSerializer 조합은
         * Jackson이 루트 컬렉션에 WRAPPER_ARRAY 역직렬화를 기대하는 경우가 있어
         * PROPERTY 형태로 저장된 캐시([{"@class":...},...])와 충돌할 수 있다.
         * Spring Data Redis가 내부 ObjectMapper에 적용하는 TypeResolverBuilder(PROPERTY)와
         * configure()로만 JSR-310 등을 맞춘다.
         */
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer();
        serializer.configure(om -> {
            om.registerModule(new JavaTimeModule());
            om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            om.setDateFormat(new java.text.SimpleDateFormat("yyyy-MM"));
            om.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        });
        
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1)) // 기본 1시간
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(serializer))
            .disableCachingNullValues();

        // 캐시별 TTL 설정
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // 포트폴리오 데이터: 1일 캐시
        cacheConfigurations.put("portfolio", defaultConfig
            .entryTtl(Duration.ofDays(1)));
        
        // GitHub API: 30분 캐시
        cacheConfigurations.put("github", defaultConfig
            .entryTtl(Duration.ofMinutes(30)));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }

    @Bean
    @ConditionalOnMissingBean(CacheManager.class)
    public CacheManager memoryCacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        cacheManager.setCacheNames(Arrays.asList("portfolio", "github"));
        return cacheManager;
    }
}
