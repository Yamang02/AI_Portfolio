package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

// JPA imports
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// 외부 라이브러리 imports
import lombok.*;

// Java 표준 라이브러리 imports
import java.time.LocalDateTime;

/**
 * 기술 스택 메타데이터 JPA 엔티티
 * PostgreSQL tech_stack_metadata 테이블과 매핑
 * 관리자 페이지에서 기술 스택 분류를 동적으로 관리하기 위한 엔티티
 */
@Entity
@Table(name = "tech_stack_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechStackMetadataJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", unique = true, nullable = false, length = 100)
    @NotBlank(message = "기술명은 필수입니다")
    @Size(max = 100, message = "기술명은 100자를 초과할 수 없습니다")
    private String name; // JavaScript, React 등
    
    @Column(name = "display_name", nullable = false, length = 100)
    @NotBlank(message = "표시명은 필수입니다")
    @Size(max = 100, message = "표시명은 100자를 초과할 수 없습니다")
    private String displayName; // JavaScript, React 등
    
    @Column(name = "category", nullable = false, length = 50)
    @NotBlank(message = "카테고리는 필수입니다")
    @Size(max = 50, message = "카테고리는 50자를 초과할 수 없습니다")
    private String category; // language, framework, database, tool, web, api, ai_ml 등
    
    @Column(name = "level", nullable = false, length = 20)
    @NotBlank(message = "레벨은 필수입니다")
    @Size(max = 20, message = "레벨은 20자를 초과할 수 없습니다")
    private String level; // expert, intermediate, beginner
    
    @Column(name = "is_core")
    @Builder.Default
    private Boolean isCore = false; // 핵심 기술 여부
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true; // 활성화 여부
    
    @Column(name = "icon_url", length = 500)
    @Size(max = 500, message = "아이콘 URL은 500자를 초과할 수 없습니다")
    private String iconUrl; // 아이콘 URL
    
    @Column(name = "color_hex", length = 7)
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "색상 코드는 #RRGGBB 형식이어야 합니다")
    private String colorHex; // 배지 색상 (#FF5733)
    
    @Column(name = "description", columnDefinition = "TEXT")
    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다")
    private String description; // 기술 설명
    
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0; // 정렬 순서
    
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

