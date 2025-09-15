package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

// JPA imports
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// Hibernate imports
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

// 외부 라이브러리 imports
import lombok.*;
import org.hibernate.validator.constraints.URL;

// Java 표준 라이브러리 imports
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Project JPA 엔티티
 * PostgreSQL projects 테이블과 매핑
 * 도메인 모델과 분리된 순수 JPA 엔티티
 */
@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // DB 내부 ID (자동 증가)
    
    @Column(name = "business_id", unique = true, nullable = false, length = 20)
    @NotBlank(message = "비즈니스 ID는 필수입니다")
    private String businessId; // 비즈니스 ID (PJT001, PJT002 등)
    
    @Column(name = "title", nullable = false)
    @NotBlank(message = "프로젝트 제목은 필수입니다")
    @Size(max = 255, message = "프로젝트 제목은 255자를 초과할 수 없습니다")
    private String title;
    
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "프로젝트 설명은 필수입니다")
    private String description;
    
    @Column(name = "detailed_description", columnDefinition = "TEXT")
    private String detailedDescription;
    
    @Column(name = "technologies", nullable = false, columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @NotNull(message = "기술 스택은 필수입니다")
    private List<String> technologies; // PostgreSQL TEXT[] 배열
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "github_url", length = 500)
    @URL(message = "올바른 GitHub URL 형식이어야 합니다")
    private String githubUrl;
    
    @Column(name = "live_url", length = 500)
    @URL(message = "올바른 라이브 URL 형식이어야 합니다")
    private String liveUrl;
    
    @Column(name = "image_url", length = 500)
    @URL(message = "올바른 이미지 URL 형식이어야 합니다")
    private String imageUrl;
    
    @Column(name = "readme", columnDefinition = "TEXT")
    private String readme;
    
    @Column(name = "type", length = 100)
    private String type; // ProjectType enum을 String으로 저장
    
    @Column(name = "source", length = 100)
    private String source;
    
    @Column(name = "is_team")
    @Builder.Default
    private Boolean isTeam = false;
    
    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "completed";
    
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
    
    @Column(name = "external_url", length = 500)
    @URL(message = "올바른 외부 URL 형식이어야 합니다")
    private String externalUrl;
    
    @Column(name = "my_contributions", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> myContributions; // PostgreSQL TEXT[] 배열
    
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