-- V005: Articles 테이블 생성
-- 기술 아티클 게시판을 위한 테이블들

-- Articles 테이블 생성
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    category VARCHAR(50),
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'published',
    published_at TIMESTAMP,
    sort_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_sort_order INTEGER,
    series_id VARCHAR(50),
    series_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ArticleTechStack 테이블 생성
CREATE TABLE IF NOT EXISTS article_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, tech_name)
);

-- ArticleSeries 테이블 생성
CREATE TABLE IF NOT EXISTS article_series (
    id BIGSERIAL PRIMARY KEY,
    series_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_articles_business_id ON articles(business_id);
CREATE INDEX IF NOT EXISTS idx_articles_project_id ON articles(project_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_sort_order ON articles(sort_order);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_featured_sort_order ON articles(featured_sort_order) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_series_id ON articles(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count) WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_article_tech_stack_article_id ON article_tech_stack(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tech_stack_tech_name ON article_tech_stack(tech_name);

CREATE INDEX IF NOT EXISTS idx_article_series_series_id ON article_series(series_id);
CREATE INDEX IF NOT EXISTS idx_article_series_sort_order ON article_series(sort_order);

-- 트리거: updated_at 자동 업데이트 (Articles)
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_articles_updated_at();

-- 트리거: updated_at 자동 업데이트 (ArticleSeries)
CREATE OR REPLACE FUNCTION update_article_series_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_series_updated_at
    BEFORE UPDATE ON article_series
    FOR EACH ROW
    EXECUTE FUNCTION update_article_series_updated_at();

-- 트리거: published_at 자동 설정 (status가 'published'로 변경 시 NULL이면 현재 시각으로 설정)
CREATE OR REPLACE FUNCTION set_article_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_set_published_at
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION set_article_published_at();

-- 테스트 데이터 삽입 (종류별 샘플)
-- 주의: tech_stack_metadata 테이블에 해당 기술 스택이 존재해야 합니다.

-- 1. 튜토리얼 카테고리
INSERT INTO articles (business_id, title, summary, content, category, tags, status, is_featured, published_at, view_count, sort_order)
VALUES 
('article-001', 'React Hooks 완전 정리', 'React Hooks의 기본 개념부터 고급 패턴까지 실전 예제와 함께 설명합니다.', 
'# React Hooks 완전 정리

## 소개

React Hooks는 함수형 컴포넌트에서 상태 관리와 생명주기 기능을 사용할 수 있게 해주는 기능입니다.

## 주요 Hooks

### useState
상태를 관리하는 가장 기본적인 Hook입니다.

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

### useEffect
컴포넌트의 생명주기를 관리하는 Hook입니다.

\`\`\`javascript
useEffect(() => {
  // 컴포넌트 마운트 시 실행
  return () => {
    // 컴포넌트 언마운트 시 실행
  };
}, [dependencies]);
\`\`\`

## 결론

Hooks를 활용하면 더 깔끔하고 재사용 가능한 코드를 작성할 수 있습니다.', 
'tutorial', ARRAY['React', 'Hooks', 'Frontend'], 'published', true, CURRENT_TIMESTAMP, 150, 1)
ON CONFLICT (business_id) DO NOTHING;

-- 2. 트러블슈팅 카테고리
INSERT INTO articles (business_id, title, summary, content, category, tags, status, is_featured, published_at, view_count, sort_order)
VALUES 
('article-002', 'Spring Boot CORS 설정 이슈 해결', 'Spring Boot에서 CORS 설정 시 자주 발생하는 문제와 해결 방법을 정리했습니다.', 
'# Spring Boot CORS 설정 이슈 해결

## 문제 상황

Spring Boot 애플리케이션에서 프론트엔드와 통신할 때 CORS 에러가 발생했습니다.

## 원인 분석

1. CORS 설정이 누락됨
2. Preflight 요청 처리 실패
3. Credentials 설정 문제

## 해결 방법

### 1. WebMvcConfigurer 구현

\`\`\`java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
\`\`\`

## 결론

적절한 CORS 설정으로 크로스 오리진 요청 문제를 해결할 수 있습니다.', 
'troubleshooting', ARRAY['Spring Boot', 'CORS', 'Backend'], 'published', false, CURRENT_TIMESTAMP, 89, 2)
ON CONFLICT (business_id) DO NOTHING;

-- 3. 아키텍처 카테고리
INSERT INTO articles (business_id, title, summary, content, category, tags, status, is_featured, published_at, view_count, sort_order)
VALUES 
('article-003', 'Hexagonal Architecture 실전 적용', '헥사고날 아키텍처를 실제 프로젝트에 적용한 경험과 설계 원칙을 공유합니다.', 
'# Hexagonal Architecture 실전 적용

## 개요

Hexagonal Architecture(포트 앤 어댑터 패턴)는 비즈니스 로직과 인프라를 분리하는 아키텍처 패턴입니다.

## 핵심 개념

### 포트 (Port)
- **인바운드 포트**: UseCase 인터페이스
- **아웃바운드 포트**: Repository 인터페이스

### 어댑터 (Adapter)
- **인바운드 어댑터**: Controller, CLI 등
- **아웃바운드 어댑터**: Database, 외부 API 등

## 레이어 구조

```
domain/
  ├── model/          # 도메인 모델
  ├── port/in/        # UseCase 인터페이스
  └── port/out/       # Repository 인터페이스

application/
  └── service/        # UseCase 구현

infrastructure/
  ├── persistence/    # Repository 구현
  └── web/            # Controller
```

## 장점

1. 비즈니스 로직의 독립성
2. 테스트 용이성
3. 기술 스택 변경의 유연성

## 결론

헥사고날 아키텍처는 복잡한 도메인을 가진 프로젝트에서 유지보수성을 크게 향상시킵니다.', 
'architecture', ARRAY['Architecture', 'Clean Code', 'Design Pattern'], 'published', true, CURRENT_TIMESTAMP, 234, 3)
ON CONFLICT (business_id) DO NOTHING;

-- 4. 인사이트 카테고리
INSERT INTO articles (business_id, title, summary, content, category, tags, status, is_featured, published_at, view_count, sort_order)
VALUES 
('article-004', 'AI 시대의 개발자 역량', 'AI 도구를 활용한 개발 방식의 변화와 개발자가 갖춰야 할 새로운 역량에 대한 생각을 정리했습니다.', 
'# AI 시대의 개발자 역량

## 변화하는 개발 환경

AI 도구(ChatGPT, GitHub Copilot 등)의 등장으로 개발 방식이 빠르게 변화하고 있습니다.

## 새로운 역량

### 1. 프롬프트 엔지니어링
- 명확한 요구사항 정의
- 컨텍스트 제공 능력
- 결과 검증 능력

### 2. 아키텍처 설계 능력
- AI가 생성한 코드의 구조 이해
- 전체 시스템 설계 능력
- 기술 선택의 판단력

### 3. 코드 리뷰 능력
- AI 생성 코드의 품질 평가
- 보안 취약점 식별
- 성능 최적화

## 결론

AI는 도구일 뿐이며, 개발자의 핵심 역량은 여전히 중요합니다. 문제 해결 능력과 설계 사고가 더욱 중요해지고 있습니다.', 
'insight', ARRAY['AI', 'Career', 'Development'], 'published', false, CURRENT_TIMESTAMP, 167, 4)
ON CONFLICT (business_id) DO NOTHING;

-- 5. 개발 과정 카테고리
INSERT INTO articles (business_id, title, summary, content, category, tags, status, is_featured, published_at, view_count, sort_order)
VALUES 
('article-005', '포트폴리오 사이트 개발 여정', '포트폴리오 사이트를 처음부터 배포까지 개발한 전체 과정을 기록했습니다.', 
'# 포트폴리오 사이트 개발 여정

## 프로젝트 개요

개인 포트폴리오 사이트를 개발하면서 겪은 시행착오와 배운 점을 정리했습니다.

## 개발 단계

### 1단계: 기획 및 설계
- 요구사항 정의
- 기술 스택 선택
- 아키텍처 설계

### 2단계: 백엔드 개발
- Spring Boot로 REST API 구축
- PostgreSQL 데이터베이스 설계
- Hexagonal Architecture 적용

### 3단계: 프론트엔드 개발
- React + TypeScript
- Feature-Sliced Design 적용
- 반응형 디자인 구현

### 4단계: 배포
- Docker 컨테이너화
- CI/CD 파이프라인 구축
- 모니터링 설정

## 주요 도전 과제

1. **성능 최적화**: 초기 로딩 시간 단축
2. **SEO**: 검색 엔진 최적화
3. **접근성**: 웹 접근성 준수

## 결론

전체 프로세스를 경험하면서 많은 것을 배울 수 있었습니다.', 
'development-timeline', ARRAY['Portfolio', 'Full Stack', 'Project'], 'published', true, CURRENT_TIMESTAMP, 98, 5)
ON CONFLICT (business_id) DO NOTHING;

-- 초안 상태 아티클 (테스트용)
INSERT INTO articles (business_id, title, summary, content, category, tags, status, is_featured, view_count, sort_order)
VALUES 
('article-006', '작성 중인 아티클', '아직 작성 중인 아티클입니다.', 
'# 작성 중인 아티클

이 아티클은 아직 작성 중입니다.

## 진행 상황

- [ ] 목차 작성
- [ ] 본문 작성
- [ ] 예제 코드 추가
- [ ] 검토 및 수정', 
'tutorial', ARRAY['Draft'], 'draft', false, 0, 6)
ON CONFLICT (business_id) DO NOTHING;

-- 기술 스택 매핑 (tech_stack_metadata에 존재하는 기술만 사용)
-- 실제 tech_stack_metadata 테이블의 name 컬럼 값 사용

-- article-001의 기술 스택 (React 관련)
INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'React', true
FROM articles a
WHERE a.business_id = 'article-001'
ON CONFLICT (article_id, tech_name) DO NOTHING;

INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'JavaScript', false
FROM articles a
WHERE a.business_id = 'article-001'
ON CONFLICT (article_id, tech_name) DO NOTHING;

-- article-002의 기술 스택 (Spring Boot 관련)
INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'Spring Boot', true
FROM articles a
WHERE a.business_id = 'article-002'
ON CONFLICT (article_id, tech_name) DO NOTHING;

INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'Java', false
FROM articles a
WHERE a.business_id = 'article-002'
ON CONFLICT (article_id, tech_name) DO NOTHING;

-- article-003의 기술 스택 (아키텍처)
INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'Java', true
FROM articles a
WHERE a.business_id = 'article-003'
ON CONFLICT (article_id, tech_name) DO NOTHING;

INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'Spring Boot', false
FROM articles a
WHERE a.business_id = 'article-003'
ON CONFLICT (article_id, tech_name) DO NOTHING;

-- article-004의 기술 스택 (인사이트)
INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'Python', false
FROM articles a
WHERE a.business_id = 'article-004'
ON CONFLICT (article_id, tech_name) DO NOTHING;

-- article-005의 기술 스택 (개발 과정 - Full Stack)
INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'React', true
FROM articles a
WHERE a.business_id = 'article-005'
ON CONFLICT (article_id, tech_name) DO NOTHING;

INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'Spring Boot', true
FROM articles a
WHERE a.business_id = 'article-005'
ON CONFLICT (article_id, tech_name) DO NOTHING;

INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'Java', false
FROM articles a
WHERE a.business_id = 'article-005'
ON CONFLICT (article_id, tech_name) DO NOTHING;

INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'JavaScript', false
FROM articles a
WHERE a.business_id = 'article-005'
ON CONFLICT (article_id, tech_name) DO NOTHING;

INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'MySQL', false
FROM articles a
WHERE a.business_id = 'article-005'
ON CONFLICT (article_id, tech_name) DO NOTHING;

INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'Docker', false
FROM articles a
WHERE a.business_id = 'article-005'
ON CONFLICT (article_id, tech_name) DO NOTHING;

INSERT INTO article_tech_stack (article_id, tech_name, is_primary)
SELECT a.id, 'Git', false
FROM articles a
WHERE a.business_id = 'article-005'
ON CONFLICT (article_id, tech_name) DO NOTHING;
