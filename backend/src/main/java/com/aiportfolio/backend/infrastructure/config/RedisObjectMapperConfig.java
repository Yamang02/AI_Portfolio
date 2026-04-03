package com.aiportfolio.backend.infrastructure.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.text.SimpleDateFormat;

/**
 * REST API용 {@link ObjectMapper}({@code @Primary})와 Redis 값 직렬화를 분리한다.
 * <p>
 * HTTP는 타입 메타 없는 JSON만 다루고, Redis는 {@link GenericJackson2JsonRedisSerializer}의
 * 기본 생성자가 내부 {@link ObjectMapper}에 설정하는 PROPERTY 기반 default typing을 쓴다.
 * 커스텀 매퍼에 {@code activateDefaultTyping(WRAPPER_ARRAY)}를 넘기면 직렬 결과와
 * Spring Data Redis의 {@code TypeResolver}(루트 {@code @class} 기대)가 어긋나
 * 캐시 역직렬화가 실패한다(플러시와 무관하게 재현).
 */
@Configuration
public class RedisObjectMapperConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        applySharedSerializationSettings(mapper);
        return mapper;
    }

    /**
     * 캐시·RedisTemplate 값 직렬화에 공유한다. 기본 생성자만이 Spring Data Redis와 호환되는
     * typing + {@code NullValue} 처리를 넣는다.
     */
    @Bean
    public GenericJackson2JsonRedisSerializer genericJackson2JsonRedisSerializer() {
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer();
        serializer.configure(RedisObjectMapperConfig::applySharedSerializationSettings);
        return serializer;
    }

    static void applySharedSerializationSettings(ObjectMapper mapper) {
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.setDateFormat(new SimpleDateFormat("yyyy-MM"));
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
}
