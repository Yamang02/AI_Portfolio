package com.aiportfolio.backend.infrastructure.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.text.SimpleDateFormat;

/**
 * REST API용 ObjectMapper와 Redis 캐시 전용 ObjectMapper를 분리한다.
 * <p>
 * {@code activateDefaultTyping}(WRAPPER_ARRAY)가 등록된 매퍼가 HTTP 메시지 컨버터의
 * 유일한 {@link ObjectMapper} 빈이 되면, 요청 본문 {@code {"field":...}} 형태가
 * 역직렬화되지 않는다. 따라서 {@code @Primary}는 타입 정보 없는 일반 JSON용에 둔다.
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

    @Bean("redisObjectMapper")
    public ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        applySharedSerializationSettings(mapper);
        mapper.activateDefaultTyping(
            mapper.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.WRAPPER_ARRAY
        );
        return mapper;
    }

    private static void applySharedSerializationSettings(ObjectMapper mapper) {
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.setDateFormat(new SimpleDateFormat("yyyy-MM"));
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
}
