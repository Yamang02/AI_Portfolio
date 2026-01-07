-- 프로젝트 테이블에 is_featured 컬럼 추가
-- V003: projects 테이블에 is_featured BOOLEAN 컬럼 추가

-- 1. is_featured 컬럼 추가 (기본값 FALSE)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 2. 인덱스 생성 (featured 프로젝트 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);

-- 3. 테이블 코멘트 추가
COMMENT ON COLUMN projects.is_featured IS '프로젝트가 추천/특별 프로젝트인지 여부';
