package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

// JPA imports
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

// 외부 라이브러리 imports
import lombok.*;

// Java 표준 라이브러리 imports
import java.time.LocalDateTime;

/**
 * 경력-프로젝트 매핑 JPA 엔티티
 * PostgreSQL experience_projects 테이블과 매핑
 * 경력과 프로젝트 간의 Many-to-Many 관계를 관리
 */
@Entity
@Table(name = "experience_projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceProjectJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id", nullable = false)
    @NotNull(message = "경력은 필수입니다")
    private ExperienceJpaEntity experience;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull(message = "프로젝트는 필수입니다")
    private ProjectJpaEntity project;
    
    @Column(name = "role_in_project", length = 255)
    private String roleInProject;
    
    @Column(name = "contribution_description", columnDefinition = "TEXT")
    private String contributionDescription;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
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

