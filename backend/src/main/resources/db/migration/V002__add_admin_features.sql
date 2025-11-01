-- Admin Dashboard 기능 추가 및 외래키 설계 개선
-- V002: Admin 사용자 테이블 확장, 외래키 설계 개선, 트리거, detailed_description 컬럼 제거를 통합

-- 1. Admin 사용자 테이블 생성 (확장된 버전)
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    auth_provider VARCHAR(50) DEFAULT 'LOCAL',  -- LOCAL, GOOGLE, GITHUB 등
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_ADMIN',
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin 사용자 테이블 인덱스 생성
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_auth_provider ON admin_users(auth_provider);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

-- 3. 외래키 설계 개선: name 기반에서 id 기반으로 변경
-- 기존 매핑 테이블들 백업
CREATE TABLE IF NOT EXISTS project_tech_stack_backup AS 
SELECT * FROM project_tech_stack;

CREATE TABLE IF NOT EXISTS experience_tech_stack_backup AS 
SELECT * FROM experience_tech_stack;

CREATE TABLE IF NOT EXISTS education_tech_stack_backup AS 
SELECT * FROM education_tech_stack;

-- 기존 매핑 테이블들 삭제
DROP TABLE IF EXISTS project_tech_stack CASCADE;
DROP TABLE IF EXISTS experience_tech_stack CASCADE;
DROP TABLE IF EXISTS education_tech_stack CASCADE;

-- 새로운 올바른 설계로 매핑 테이블들 재생성 (id 기반 외래키)
CREATE TABLE project_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tech_stack_id BIGINT NOT NULL REFERENCES tech_stack_metadata(id) ON DELETE CASCADE,  -- name 대신 id 사용
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, tech_stack_id)
);

CREATE TABLE experience_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    tech_stack_id BIGINT NOT NULL REFERENCES tech_stack_metadata(id) ON DELETE CASCADE,  -- name 대신 id 사용
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experience_id, tech_stack_id)
);

CREATE TABLE education_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    education_id BIGINT NOT NULL REFERENCES education(id) ON DELETE CASCADE,
    tech_stack_id BIGINT NOT NULL REFERENCES tech_stack_metadata(id) ON DELETE CASCADE,  -- name 대신 id 사용
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(education_id, tech_stack_id)
);

-- 새로운 매핑 테이블 인덱스 생성
CREATE INDEX idx_project_tech_stack_project_id ON project_tech_stack(project_id);
CREATE INDEX idx_project_tech_stack_tech_stack_id ON project_tech_stack(tech_stack_id);
CREATE INDEX idx_project_tech_stack_is_primary ON project_tech_stack(is_primary);

CREATE INDEX idx_experience_tech_stack_experience_id ON experience_tech_stack(experience_id);
CREATE INDEX idx_experience_tech_stack_tech_stack_id ON experience_tech_stack(tech_stack_id);
CREATE INDEX idx_experience_tech_stack_is_primary ON experience_tech_stack(is_primary);

CREATE INDEX idx_education_tech_stack_education_id ON education_tech_stack(education_id);
CREATE INDEX idx_education_tech_stack_tech_stack_id ON education_tech_stack(tech_stack_id);
CREATE INDEX idx_education_tech_stack_is_primary ON education_tech_stack(is_primary);

-- 기존 데이터 마이그레이션 (백업에서 새로운 구조로 복원)
INSERT INTO project_tech_stack (project_id, tech_stack_id, is_primary, usage_description, created_at, updated_at)
SELECT 
    pts.project_id,
    tsm.id as tech_stack_id,
    pts.is_primary,
    pts.usage_description,
    pts.created_at,
    CURRENT_TIMESTAMP
FROM project_tech_stack_backup pts
JOIN tech_stack_metadata tsm ON pts.tech_name = tsm.name;

INSERT INTO experience_tech_stack (experience_id, tech_stack_id, is_primary, usage_description, created_at, updated_at)
SELECT 
    ets.experience_id,
    tsm.id as tech_stack_id,
    ets.is_primary,
    ets.usage_description,
    ets.created_at,
    CURRENT_TIMESTAMP
FROM experience_tech_stack_backup ets
JOIN tech_stack_metadata tsm ON ets.tech_name = tsm.name;

INSERT INTO education_tech_stack (education_id, tech_stack_id, is_primary, usage_description, created_at, updated_at)
SELECT 
    eds.education_id,
    tsm.id as tech_stack_id,
    eds.is_primary,
    eds.usage_description,
    eds.created_at,
    CURRENT_TIMESTAMP
FROM education_tech_stack_backup eds
JOIN tech_stack_metadata tsm ON eds.tech_name = tsm.name;

-- 4. updated_at 자동 갱신 트리거 함수 (이미 존재할 수 있음)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 모든 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at
    BEFORE UPDATE ON education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at
    BEFORE UPDATE ON certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_stack_metadata_updated_at
    BEFORE UPDATE ON tech_stack_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 새로운 매핑 테이블들에도 트리거 적용
CREATE TRIGGER update_project_tech_stack_updated_at
    BEFORE UPDATE ON project_tech_stack
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_tech_stack_updated_at
    BEFORE UPDATE ON experience_tech_stack
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_tech_stack_updated_at
    BEFORE UPDATE ON education_tech_stack
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. detailed_description 컬럼 제거 (사용되지 않음)
ALTER TABLE projects DROP COLUMN IF EXISTS detailed_description;

-- 6-1. team_size 컬럼 추가 (V001에서 누락되었을 수 있음)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_size INTEGER;

-- 7. 프로젝트 스크린샷 테이블 생성
CREATE TABLE project_screenshots (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7-1. projects 테이블의 screenshots 컬럼 타입 변경 (TEXT[] → BIGINT[])
-- project_screenshots 테이블의 ID 값들을 배열로 저장하기 위한 변경
ALTER TABLE projects DROP COLUMN IF EXISTS screenshots;
ALTER TABLE projects ADD COLUMN screenshots BIGINT[];

-- 8. 프로젝트 스크린샷 테이블 인덱스 생성
CREATE INDEX idx_project_screenshots_project_id ON project_screenshots(project_id);
CREATE INDEX idx_project_screenshots_display_order ON project_screenshots(display_order);

-- 9. 프로젝트 스크린샷 테이블 트리거 적용
CREATE TRIGGER update_project_screenshots_updated_at
    BEFORE UPDATE ON project_screenshots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. 테이블 코멘트 추가
COMMENT ON TABLE admin_users IS 'Admin Dashboard 사용자 테이블 - 확장된 인증 정보 포함';
COMMENT ON TABLE projects IS 'Projects table - detailed_description column removed as it was unused';
COMMENT ON TABLE project_screenshots IS '프로젝트 스크린샷 이미지 관리 테이블';
COMMENT ON TABLE project_tech_stack IS '프로젝트-기술스택 매핑 테이블 (id 기반 외래키)';
COMMENT ON TABLE experience_tech_stack IS '경력-기술스택 매핑 테이블 (id 기반 외래키)';
COMMENT ON TABLE education_tech_stack IS '교육-기술스택 매핑 테이블 (id 기반 외래키)';

-- 11. 백업 테이블 정리 (선택사항 - 데이터 확인 후 수동으로 삭제)
-- DROP TABLE IF EXISTS project_tech_stack_backup;
-- DROP TABLE IF EXISTS experience_tech_stack_backup;
-- DROP TABLE IF EXISTS education_tech_stack_backup;

-- ============================================
-- 12. 경력 및 교육 스키마 변경 (프로젝트 참조 분리, 경력 타입 분리)
-- ============================================

-- 12-1. 경력-프로젝트 릴레이션 테이블 생성
CREATE TABLE experience_projects (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_in_project VARCHAR(255),
    contribution_description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experience_id, project_id)
);

-- 12-2. 교육-프로젝트 릴레이션 테이블 생성
CREATE TABLE education_projects (
    id BIGSERIAL PRIMARY KEY,
    education_id BIGINT NOT NULL REFERENCES education(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_type VARCHAR(100),
    grade VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(education_id, project_id)
);

-- 12-3. 인덱스 생성
CREATE INDEX idx_experience_projects_experience_id ON experience_projects(experience_id);
CREATE INDEX idx_experience_projects_project_id ON experience_projects(project_id);
CREATE INDEX idx_education_projects_education_id ON education_projects(education_id);
CREATE INDEX idx_education_projects_project_id ON education_projects(project_id);

-- 12-4. 경력 테이블에 job_field, employment_type 컬럼 추가
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS job_field VARCHAR(100);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50);

-- 12-5. 기존 type 데이터를 employment_type으로 마이그레이션
UPDATE experiences SET employment_type = type WHERE type IS NOT NULL AND employment_type IS NULL;

-- 12-6. 기본 job_field 값 설정 (기존 데이터 보존을 위해)
UPDATE experiences SET job_field = '개발' WHERE job_field IS NULL AND type IS NOT NULL;

-- 12-7. 기존 projects TEXT[] 데이터를 릴레이션 테이블로 마이그레이션
-- Experience Projects 마이그레이션
INSERT INTO experience_projects (experience_id, project_id, display_order, created_at, updated_at)
SELECT 
    e.id as experience_id,
    p.id as project_id,
    ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY p.business_id) - 1 as display_order,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM experiences e
CROSS JOIN LATERAL unnest(e.projects) AS project_business_id
JOIN projects p ON p.business_id = project_business_id
WHERE e.projects IS NOT NULL AND array_length(e.projects, 1) > 0
ON CONFLICT (experience_id, project_id) DO NOTHING;

-- Education Projects 마이그레이션
INSERT INTO education_projects (education_id, project_id, display_order, created_at, updated_at)
SELECT 
    ed.id as education_id,
    p.id as project_id,
    ROW_NUMBER() OVER (PARTITION BY ed.id ORDER BY p.business_id) - 1 as display_order,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM education ed
CROSS JOIN LATERAL unnest(ed.projects) AS project_business_id
JOIN projects p ON p.business_id = project_business_id
WHERE ed.projects IS NOT NULL AND array_length(ed.projects, 1) > 0
ON CONFLICT (education_id, project_id) DO NOTHING;

-- 12-8. 기존 projects TEXT[] 컬럼 제거
ALTER TABLE experiences DROP COLUMN IF EXISTS projects;
ALTER TABLE education DROP COLUMN IF EXISTS projects;

-- 12-9. 기존 type 컬럼 제거 (employment_type으로 대체됨)
ALTER TABLE experiences DROP COLUMN IF EXISTS type;

-- 12-10. 새 테이블에 트리거 적용
CREATE TRIGGER update_experience_projects_updated_at
    BEFORE UPDATE ON experience_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_projects_updated_at
    BEFORE UPDATE ON education_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12-11. 테이블 코멘트 추가
COMMENT ON TABLE experience_projects IS '경력-프로젝트 매핑 테이블';
COMMENT ON TABLE education_projects IS '교육-프로젝트 매핑 테이블';
COMMENT ON COLUMN experiences.job_field IS '직무 분야 (개발, 교육, 디자인 등)';
COMMENT ON COLUMN experiences.employment_type IS '계약 조건 (정규직, 계약직, 프리랜서 등)';

-- ============================================
-- 13. 프로젝트 business_id 유니크 제약조건 추가 (ID 충돌 방지)
-- ============================================

-- 13-1. business_id에 unique constraint 추가
ALTER TABLE projects ADD CONSTRAINT uk_projects_business_id UNIQUE (business_id);

-- 13-2. 테이블 코멘트 추가
COMMENT ON CONSTRAINT uk_projects_business_id ON projects IS 'Business ID 유니크 제약조건 - ID 생성 충돌 방지';