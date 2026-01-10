package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ArticleJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", unique = true, nullable = false, length = 20)
    private String businessId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "project_id")
    private Long projectId;

    @Column(length = 50)
    private String category;

    @Column(columnDefinition = "TEXT[]")
    private String[] tags;

    @Column(length = 50)
    private String status;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "view_count")
    private Integer viewCount;

    @Column(name = "is_featured")
    private Boolean isFeatured;

    @Column(name = "featured_sort_order")
    private Integer featuredSortOrder;

    @Column(name = "series_id", length = 50)
    private String seriesId;

    @Column(name = "series_order")
    private Integer seriesOrder;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ArticleTechStack 조인
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ArticleTechStackJpaEntity> techStack = new ArrayList<>();
}
