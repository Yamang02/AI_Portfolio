package com.aiportfolio.backend.infrastructure.persistence.Postgres.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

/**
 * PostgreSQL 테이블과 매핑되는 Certification 엔티티
 * 도메인 모델과는 별도로 데이터베이스 스키마에 맞춰 설계
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificationEntity {
    
    private Long dbId; // DB 내부 ID (SERIAL)
    private String businessId; // 비즈니스 ID (CRT001, CRT002 등)
    private String name;
    private String issuer;
    private LocalDate date;
    private String description;
    private String credentialUrl;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
