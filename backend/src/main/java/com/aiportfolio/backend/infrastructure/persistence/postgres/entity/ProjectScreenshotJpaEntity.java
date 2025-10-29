package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

// JPA imports
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

// 외부 라이브러리 imports
import lombok.*;

// Java 표준 라이브러리 imports
import java.time.LocalDateTime;

/**
 * 프로젝트 스크린샷 JPA 엔티티
 * PostgreSQL project_screenshots 테이블과 매핑
 * 프로젝트와 스크린샷 간의 One-to-Many 관계를 관리
 */
@Entity
@Table(name = "project_screenshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectScreenshotJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull(message = "프로젝트는 필수입니다")
    private ProjectJpaEntity project;
    
    @Column(name = "image_url", nullable = false, length = 500)
    @NotNull(message = "이미지 URL은 필수입니다")
    private String imageUrl;
    
    @Column(name = "cloudinary_public_id", length = 255)
    private String cloudinaryPublicId;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    @Column(name = "alt_text", length = 255)
    private String altText;
    
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

