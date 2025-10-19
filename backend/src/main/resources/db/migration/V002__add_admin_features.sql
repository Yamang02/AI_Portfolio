-- Admin Dashboard 기능 추가
-- V002: Admin 사용자 테이블, 트리거, detailed_description 컬럼 제거를 통합

-- 1. Admin 사용자 테이블 생성
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_ADMIN',
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin 사용자 테이블 인덱스 생성
CREATE INDEX idx_admin_users_username ON admin_users(username);

-- 3. updated_at 자동 갱신 트리거 함수 (이미 존재할 수 있음)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 모든 테이블에 updated_at 트리거 적용
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

-- 5. detailed_description 컬럼 제거 (사용되지 않음)
ALTER TABLE projects DROP COLUMN IF EXISTS detailed_description;

-- 6. 프로젝트 스크린샷 테이블 생성
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

-- 7. 프로젝트 스크린샷 테이블 인덱스 생성
CREATE INDEX idx_project_screenshots_project_id ON project_screenshots(project_id);
CREATE INDEX idx_project_screenshots_display_order ON project_screenshots(display_order);

-- 8. 프로젝트 스크린샷 테이블 트리거 적용
CREATE TRIGGER update_project_screenshots_updated_at
    BEFORE UPDATE ON project_screenshots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 테이블 코멘트 추가
COMMENT ON TABLE admin_users IS 'Admin Dashboard 사용자 테이블';
COMMENT ON TABLE projects IS 'Projects table - detailed_description column removed as it was unused';
COMMENT ON TABLE project_screenshots IS '프로젝트 스크린샷 이미지 관리 테이블';
