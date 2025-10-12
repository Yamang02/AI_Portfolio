-- Flyway 베이스라인 마이그레이션
-- 운영 DB의 현재 스키마를 베이스라인으로 설정
-- 이 파일은 운영 DB에 이미 존재하는 스키마를 Flyway가 인식하도록 하는 베이스라인 마이그레이션입니다.

-- Projects 테이블 (완전 통합 버전)
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    start_date DATE,
    end_date DATE,
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    image_url VARCHAR(500),
    readme TEXT,
    type VARCHAR(100),
    source VARCHAR(100),
    is_team BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'completed',
    sort_order INTEGER DEFAULT 0,
    external_url VARCHAR(500),
    my_contributions TEXT[],
    role VARCHAR(255),
    screenshots TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Experiences 테이블 (완전 통합 버전)
CREATE TABLE IF NOT EXISTS experiences (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organization VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    type VARCHAR(50),
    main_responsibilities TEXT[],
    achievements TEXT[],
    projects TEXT[],
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Education 테이블 (완전 통합 버전)
CREATE TABLE IF NOT EXISTS education (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organization VARCHAR(255) NOT NULL,
    degree VARCHAR(255),
    major VARCHAR(255),
    start_date DATE,
    end_date DATE,
    gpa DECIMAL(3,2),
    type VARCHAR(50),
    projects TEXT[],
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certifications 테이블
CREATE TABLE IF NOT EXISTS certifications (
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    date DATE,
    expiry_date DATE,
    credential_id VARCHAR(255),
    credential_url VARCHAR(500),
    description TEXT,
    category VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기술 스택 메타데이터 테이블
CREATE TABLE IF NOT EXISTS tech_stack_metadata (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    is_core BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    icon_url VARCHAR(500),
    color_hex VARCHAR(7),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트-기술 스택 매핑 테이블
CREATE TABLE IF NOT EXISTS project_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, tech_name)
);

-- 경력-기술 스택 매핑 테이블
CREATE TABLE IF NOT EXISTS experience_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experience_id, tech_name)
);

-- 교육-기술 스택 매핑 테이블
CREATE TABLE IF NOT EXISTS education_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    education_id BIGINT NOT NULL REFERENCES education(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(education_id, tech_name)
);

-- Admin 사용자 테이블
CREATE TABLE IF NOT EXISTS admin_users (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_projects_business_id ON projects(business_id);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_experiences_business_id ON experiences(business_id);
CREATE INDEX IF NOT EXISTS idx_experiences_sort_order ON experiences(sort_order);
CREATE INDEX IF NOT EXISTS idx_experiences_start_date ON experiences(start_date);

CREATE INDEX IF NOT EXISTS idx_education_business_id ON education(business_id);
CREATE INDEX IF NOT EXISTS idx_education_sort_order ON education(sort_order);
CREATE INDEX IF NOT EXISTS idx_education_start_date ON education(start_date);

CREATE INDEX IF NOT EXISTS idx_certifications_business_id ON certifications(business_id);
CREATE INDEX IF NOT EXISTS idx_certifications_sort_order ON certifications(sort_order);
CREATE INDEX IF NOT EXISTS idx_certifications_date ON certifications(date);

CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_name ON tech_stack_metadata(name);
CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_category ON tech_stack_metadata(category);
CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_is_core ON tech_stack_metadata(is_core);
CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_is_active ON tech_stack_metadata(is_active);
CREATE INDEX IF NOT EXISTS idx_tech_stack_metadata_sort_order ON tech_stack_metadata(sort_order);

CREATE INDEX IF NOT EXISTS idx_project_tech_stack_project_id ON project_tech_stack(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tech_stack_tech_name ON project_tech_stack(tech_name);
CREATE INDEX IF NOT EXISTS idx_project_tech_stack_is_primary ON project_tech_stack(is_primary);

CREATE INDEX IF NOT EXISTS idx_experience_tech_stack_experience_id ON experience_tech_stack(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_tech_stack_tech_name ON experience_tech_stack(tech_name);
CREATE INDEX IF NOT EXISTS idx_experience_tech_stack_is_primary ON experience_tech_stack(is_primary);

CREATE INDEX IF NOT EXISTS idx_education_tech_stack_education_id ON education_tech_stack(education_id);
CREATE INDEX IF NOT EXISTS idx_education_tech_stack_tech_name ON education_tech_stack(tech_name);
CREATE INDEX IF NOT EXISTS idx_education_tech_stack_is_primary ON education_tech_stack(is_primary);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- 기본 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO admin_users (username, password, role) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqk6nQZ8gJ8qJ8qJ8qJ8qJ8qJ', 'ROLE_ADMIN')
ON CONFLICT (username) DO NOTHING;