package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

// JPA imports
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// 외부 라이브러리 imports
import lombok.*;
import org.hibernate.validator.constraints.URL;

// Java 표준 라이브러리 imports
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Certification JPA 엔티티
 * PostgreSQL certifications 테이블과 매핑
 * 도메인 모델과 분리된 순수 JPA 엔티티
 */
@Entity
@Table(name = "certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // DB 내부 ID (자동 증가)
    
    @Column(name = "business_id", unique = true, nullable = false, length = 20)
    @NotBlank(message = "비즈니스 ID는 필수입니다")
    private String businessId; // 비즈니스 ID (CRT001, CRT002 등)
    
    @Column(name = "name", nullable = false)
    @NotBlank(message = "자격증명은 필수입니다")
    private String name;
    
    @Column(name = "issuer", nullable = false)
    @NotBlank(message = "발급기관은 필수입니다")
    private String issuer;
    
    @Column(name = "date")
    private LocalDate date; // 취득일
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate; // 만료일 (NULL이면 만료 없음)
    
    @Column(name = "credential_id")
    private String credentialId; // 자격증 번호/ID
    
    @Column(name = "credential_url", length = 500)
    @URL(message = "올바른 자격증 URL 형식이어야 합니다")
    private String credentialUrl; // 자격증 확인 URL
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "category", length = 100)
    private String category; // IT, Language, Project Management 등
    
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}