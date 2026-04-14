package com.aiportfolio.backend.domain.portfolio.model;

/**
 * 프로젝트 DB PK 기준으로 아티클 목록·관리 화면 등에 붙이는 최소 참조 정보.
 */
public record ProjectReferenceByDatabaseId(long databaseId, String businessId, String title) {}
