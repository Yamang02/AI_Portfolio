-- 기술 스택 메타데이터 테이블 생성
CREATE TABLE IF NOT EXISTS tech_stack_metadata (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,           -- 기술명 (JavaScript, React 등)
    display_name VARCHAR(100) NOT NULL,          -- 표시명 (JavaScript, React 등)
    category VARCHAR(50) NOT NULL,               -- 언어/프레임워크/도구/데이터베이스
    level VARCHAR(20) NOT NULL,                  -- core/general/learning
    is_core BOOLEAN DEFAULT FALSE,               -- 핵심 기술 여부
    is_active BOOLEAN DEFAULT TRUE,              -- 활성화 여부
    icon_url VARCHAR(500),                       -- 아이콘 URL
    color_hex VARCHAR(7),                        -- 배지 색상 (#FF5733)
    description TEXT,                            -- 기술 설명
    sort_order INTEGER DEFAULT 0,                -- 정렬 순서
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트-기술 스택 매핑 테이블
CREATE TABLE IF NOT EXISTS project_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,            -- 주요 기술 여부
    usage_description TEXT,                      -- 해당 프로젝트에서의 사용 설명
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, tech_name)
);

-- 경력-기술 스택 매핑 테이블
CREATE TABLE IF NOT EXISTS experience_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,            -- 주요 기술 여부
    usage_description TEXT,                      -- 해당 경력에서의 사용 설명
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experience_id, tech_name)
);

-- 교육-기술 스택 매핑 테이블
CREATE TABLE IF NOT EXISTS education_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    education_id BIGINT NOT NULL REFERENCES education(id) ON DELETE CASCADE,
    tech_name VARCHAR(100) NOT NULL REFERENCES tech_stack_metadata(name) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,            -- 주요 기술 여부
    usage_description TEXT,                      -- 해당 교육에서의 사용 설명
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(education_id, tech_name)
);

-- 인덱스 생성
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
