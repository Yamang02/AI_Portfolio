package com.aiportfolio.backend.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

/**
 * Redis 설정 클래스
 * 캐싱 및 세션 관리를 위한 Redis 템플릿을 구성합니다.
 */
@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800) // 30분 세션 타임아웃
public class RedisConfig {

    /**
     * Redis 템플릿 빈을 생성합니다.
     * 캐시 데이터를 위한 직렬화 설정을 포함합니다.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(
        RedisConnectionFactory connectionFactory,
        @Qualifier("redisObjectMapper") ObjectMapper redisObjectMapper
    ) {
        GenericJackson2JsonRedisSerializer serializer =
            new GenericJackson2JsonRedisSerializer(redisObjectMapper);

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 키 직렬화 설정
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // 값 직렬화 설정 (JSON 형태로 저장, JSR310 모듈 포함)
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        return template;
    }
}
