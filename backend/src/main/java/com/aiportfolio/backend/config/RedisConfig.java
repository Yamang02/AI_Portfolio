package com.aiportfolio.backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;

import java.time.Duration;

/**
 * Redis 설정 클래스
 * Spring Boot Redis 연동 및 캐시 관리자 설정
 */
@Slf4j
@Configuration
@EnableCaching
@ConditionalOnProperty(name = "spring.data.redis.host")
public class RedisConfig {

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${spring.data.redis.database:1}")
    private int redisDatabase;

    @Value("${spring.data.redis.timeout:2000ms}")
    private Duration redisTimeout;

    @Value("${spring.data.redis.ssl.enabled:false}")
    private boolean redisSslEnabled;

    @Value("${spring.data.redis.lettuce.pool.max-active:8}")
    private int maxActive;

    @Value("${spring.data.redis.lettuce.pool.max-idle:8}")
    private int maxIdle;

    @Value("${spring.data.redis.lettuce.pool.min-idle:0}")
    private int minIdle;

    /**
     * Redis 연결 팩토리 설정
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        try {
            // Redis 독립 실행형 설정
            RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
            redisConfig.setHostName(redisHost);
            redisConfig.setPort(redisPort);
            redisConfig.setDatabase(redisDatabase);
            
            // 비밀번호 설정 (있는 경우)
            if (redisPassword != null && !redisPassword.trim().isEmpty()) {
                redisConfig.setPassword(redisPassword);
            }

            // 연결 풀 설정
            GenericObjectPoolConfig<?> poolConfig = new GenericObjectPoolConfig<>();
            poolConfig.setMaxTotal(maxActive);
            poolConfig.setMaxIdle(maxIdle);
            poolConfig.setMinIdle(minIdle);
            poolConfig.setTestOnBorrow(true);
            poolConfig.setTestOnReturn(true);
            poolConfig.setTestWhileIdle(true);

            // Lettuce 클라이언트 설정
            var clientConfigBuilder = 
                LettucePoolingClientConfiguration.builder()
                    .poolConfig(poolConfig)
                    .commandTimeout(redisTimeout)
                    .shutdownTimeout(Duration.ofMillis(100));

            // SSL 설정
            if (redisSslEnabled) {
                clientConfigBuilder.useSsl();
            }

            LettuceConnectionFactory factory = new LettuceConnectionFactory(
                redisConfig, 
                clientConfigBuilder.build()
            );

            factory.setValidateConnection(true);
            factory.afterPropertiesSet();

            log.info("✅ Redis 연결 팩토리 초기화 완료 - {}:{} (DB: {}, SSL: {})", 
                redisHost, redisPort, redisDatabase, redisSslEnabled);
            
            return factory;

        } catch (Exception e) {
            log.error("❌ Redis 연결 팩토리 초기화 실패: {}", e.getMessage(), e);
            throw new RuntimeException("Redis 연결 설정 실패", e);
        }
    }

    /**
     * Redis Template 설정
     * JSON 직렬화 사용
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(LettuceConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Jackson2 JSON 직렬화 설정
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.activateDefaultTyping(
            BasicPolymorphicTypeValidator.builder()
                .allowIfSubType(Object.class)
                .build(),
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(objectMapper);

        // 키는 String, 값은 JSON으로 직렬화
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(jsonSerializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(jsonSerializer);

        template.setDefaultSerializer(jsonSerializer);
        template.afterPropertiesSet();

        log.info("✅ Redis Template 초기화 완료");
        return template;
    }

    /**
     * Redis 캐시 매니저 설정
     * Spring Cache 추상화 사용
     */
    @Bean
    public RedisCacheManager cacheManager(LettuceConnectionFactory connectionFactory) {
        
        // 기본 캐시 설정
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))  // 기본 TTL: 1시간
            .serializeKeysWith(org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()))
            .disableCachingNullValues()
            .prefixCacheNameWith("portfolio:");

        // 캐시별 개별 설정
        RedisCacheManager cacheManager = RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaultConfig)
            .withCacheConfiguration("projects", 
                defaultConfig.entryTtl(Duration.ofHours(2)))  // 프로젝트: 2시간
            .withCacheConfiguration("experiences", 
                defaultConfig.entryTtl(Duration.ofHours(2)))  // 경험: 2시간
            .withCacheConfiguration("educations", 
                defaultConfig.entryTtl(Duration.ofHours(2)))   // 교육: 2시간
            .withCacheConfiguration("certifications", 
                defaultConfig.entryTtl(Duration.ofHours(2)))  // 자격증: 2시간
            .withCacheConfiguration("ai-responses", 
                defaultConfig.entryTtl(Duration.ofMinutes(30))) // AI 응답: 30분
            .build();

        log.info("✅ Redis 캐시 매니저 초기화 완료");
        return cacheManager;
    }

    /**
     * 캐시 키 생성기
     */
    @Bean
    public org.springframework.cache.interceptor.KeyGenerator customKeyGenerator() {
        return (target, method, params) -> {
            StringBuilder sb = new StringBuilder();
            sb.append(target.getClass().getSimpleName()).append(".");
            sb.append(method.getName()).append("(");
            for (int i = 0; i < params.length; i++) {
                if (i > 0) sb.append(",");
                if (params[i] != null) {
                    sb.append(params[i].toString());
                } else {
                    sb.append("null");
                }
            }
            sb.append(")");
            return sb.toString();
        };
    }
}