-- V006: project_technical_cards 추가 + projects.readme -> articles(project-overview) 이관
-- 주의: 이 마이그레이션은 non-breaking이다. projects.readme DROP은 후속 수동 단계에서 수행한다.

-- 1) project_technical_cards 테이블 생성
CREATE TABLE IF NOT EXISTS project_technical_cards (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(50) UNIQUE NOT NULL,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    problem_statement TEXT NOT NULL,
    analysis TEXT,
    solution TEXT NOT NULL,
    article_id BIGINT REFERENCES articles(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_technical_cards_project ON project_technical_cards(project_id);
CREATE INDEX IF NOT EXISTS idx_technical_cards_pinned ON project_technical_cards(is_pinned);
CREATE INDEX IF NOT EXISTS idx_technical_cards_category ON project_technical_cards(category);

-- 2) readme -> project-overview article 이관
-- articles.business_id 길이(VARCHAR(20))를 고려해 business_id는 'ovw-' + project.business_id를 사용한다.
INSERT INTO articles (
    business_id,
    title,
    summary,
    content,
    project_id,
    category,
    status,
    published_at,
    sort_order,
    created_at,
    updated_at
)
SELECT
    CONCAT('ovw-', p.business_id) AS business_id,
    CONCAT(p.title, ' 소개') AS title,
    p.description AS summary,
    p.readme AS content,
    p.id AS project_id,
    'project-overview' AS category,
    'published' AS status,
    CURRENT_TIMESTAMP AS published_at,
    0 AS sort_order,
    CURRENT_TIMESTAMP AS created_at,
    CURRENT_TIMESTAMP AS updated_at
FROM projects p
WHERE p.readme IS NOT NULL
  AND btrim(p.readme) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM articles a
    WHERE a.project_id = p.id
      AND a.category = 'project-overview'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM articles a2
    WHERE a2.business_id = CONCAT('ovw-', p.business_id)
  );

-- 3) 검증 쿼리 가이드 (참고)
-- SELECT COUNT(*) FILTER (WHERE p.readme IS NOT NULL AND btrim(p.readme) <> '') AS source_readme_count,
--        COUNT(*) FILTER (WHERE a.id IS NOT NULL) AS migrated_article_count
-- FROM projects p
-- LEFT JOIN articles a ON a.project_id = p.id AND a.category = 'project-overview';
