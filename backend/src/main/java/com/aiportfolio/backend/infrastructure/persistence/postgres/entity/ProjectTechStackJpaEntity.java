package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

// JPA imports
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

// 외부 라이브러리 imports
import lombok.*;

// Java 표준 라이브러리 imports
import java.time.LocalDateTime;

/**
 * 프로젝트-기술 스택 매핑 JPA 엔티티
 * PostgreSQL project_tech_stack 테이블과 매핑
 * 프로젝트와 기술 스택 간의 Many-to-Many 관계를 관리
 */
@Entity
@Table(name = "project_tech_stack")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTechStackJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull(message = "프로젝트는 필수입니다")
    private ProjectJpaEntity project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tech_stack_id", nullable = false)
    @NotNull(message = "기술 스택은 필수입니다")
    private TechStackMetadataJpaEntity techStack;
    
    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;
    
    @Column(name = "usage_description", columnDefinition = "TEXT")
    private String usageDescription;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

