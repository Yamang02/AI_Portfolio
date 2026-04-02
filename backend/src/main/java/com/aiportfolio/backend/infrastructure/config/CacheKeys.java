package com.aiportfolio.backend.infrastructure.config;

/**
 * Spring Cache 이름 및 Redis 캐시 엔트리 키(SpEL과 동일한 문자열 값) 상수.
 */
public final class CacheKeys {

    private CacheKeys() {
    }

    public static final String PORTFOLIO = "portfolio";
    public static final String GITHUB = "github";

    public static final String EXPERIENCES_ALL = "experiences:all";
    public static final String EDUCATIONS_ALL = "educations:all";
    public static final String CERTIFICATIONS_ALL = "certifications:all";
    public static final String PROJECTS_ALL = "projects:all";

    public static final String GITHUB_PROJECTS = "projects";
    public static final String GITHUB_PROJECT_PREFIX = "project:";

    public static final String FRONTEND_CACHE_VERSION = "frontend:cache:version";
}
