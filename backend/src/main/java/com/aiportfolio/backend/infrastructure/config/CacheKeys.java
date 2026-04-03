package com.aiportfolio.backend.infrastructure.config;

/**
 * Redis 캐시 네임스페이스/키 상수.
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
}
