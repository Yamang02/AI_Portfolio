package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

// JPA imports
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// Hibernate imports
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

// 외부 라이브러리 imports
import lombok.*;

// Java 표준 라이브러리 imports
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Experience JPA 엔티티
 * PostgreSQL experiences 테이블과 매핑
 * 도메인 모델과 분리된 순수 JPA 엔티티
 */
@Entity
@Table(name = "experiences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // DB 내부 ID (자동 증가)
    
    @Column(name = "business_id", unique = true, nullable = false, length = 20)
    @NotBlank(message = "비즈니스 ID는 필수입니다")
    private String businessId; // 비즈니스 ID (EXP001, EXP002 등)
    
    @Column(name = "title", nullable = false)
    @NotBlank(message = "직책은 필수입니다")
    @Size(max = 255, message = "직책은 255자를 초과할 수 없습니다")
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "organization", nullable = false)
    @NotBlank(message = "조직명은 필수입니다")
    @Size(max = 255, message = "조직명은 255자를 초과할 수 없습니다")
    private String organization;
    
    @Column(name = "role", nullable = false)
    @NotBlank(message = "역할은 필수입니다")
    @Size(max = 255, message = "역할은 255자를 초과할 수 없습니다")
    private String role;
    
    @Column(name = "start_date", nullable = false)
    @NotNull(message = "시작일은 필수입니다")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate; // NULL이면 현재 재직중
    
    @Column(name = "job_field", length = 100)
    private String jobField; // 직무 분야 (개발, 교육, 디자인 등)
    
    @Column(name = "employment_type", length = 50)
    private String employmentType; // 계약 조건 (정규직, 계약직, 프리랜서 등)
    
    // 기존 technologies 배열 필드 제거됨 - techStackMetadata 관계 필드로 대체
    
    @Column(name = "main_responsibilities", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> mainResponsibilities; // PostgreSQL TEXT[] 배열
    
    @Column(name = "achievements", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> achievements; // PostgreSQL TEXT[] 배열
    
    // 기술 스택 메타데이터 관계 (완전 통합용 - One-to-Many)
    @OneToMany(mappedBy = "experience", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExperienceTechStackJpaEntity> experienceTechStacks;
    
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