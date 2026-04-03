package com.aiportfolio.backend.application.portfolio.cache;

import com.aiportfolio.backend.domain.portfolio.model.Project;

import java.util.ArrayList;
import java.util.List;

/**
 * Redis 캐시 값의 JSON 루트를 배열이 아닌 단일 객체로 두기 위한 래퍼.
 * {@link org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer}는
 * 루트가 {@code [...]} 일 때 다형 역직렬화가 깨지기 쉽다.
 */
public record CachedProjectList(List<Project> items) {

    public CachedProjectList {
        items = items == null ? new ArrayList<>() : new ArrayList<>(items);
    }
}
