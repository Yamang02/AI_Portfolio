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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Education JPA 엔티티
 * PostgreSQL education 테이블과 매핑
 * 도메인 모델과 분리된 순수 JPA 엔티티
 */
@Entity
@Table(name = "education")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // DB 내부 ID (자동 증가)
    
    @Column(name = "business_id", unique = true, nullable = false, length = 20)
    @NotBlank(message = "비즈니스 ID는 필수입니다")
    private String businessId; // 비즈니스 ID (EDU001, EDU002 등)
    
    @Column(name = "title", nullable = false)
    @NotBlank(message = "교육 제목은 필수입니다")
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "organization", nullable = false)
    @NotBlank(message = "교육기관명은 필수입니다")
    private String organization;
    
    @Column(name = "degree")
    private String degree; // 학위 정보
    
    @Column(name = "major")
    private String major; // 전공
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "gpa", precision = 3, scale = 2)
    private BigDecimal gpa; // 학점 (4.0 만점)
    
    @Column(name = "type", length = 50)
    private String type; // EducationType enum을 String으로 저장
    
    // 기존 technologies 배열 필드 제거됨 - techStackMetadata 관계 필드로 대체
    
    @Column(name = "projects", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> projects; // PostgreSQL TEXT[] 배열
    
    // 기술 스택 메타데이터 관계 (완전 통합용 - One-to-Many)
    @OneToMany(mappedBy = "education", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EducationTechStackJpaEntity> educationTechStacks;
    
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