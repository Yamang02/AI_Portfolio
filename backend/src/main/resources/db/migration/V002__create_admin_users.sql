-- Admin 사용자 테이블 생성
-- Admin Dashboard 인증을 위한 사용자 테이블

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

-- 인덱스 생성
CREATE INDEX idx_admin_users_username ON admin_users(username);

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- admin_users 테이블에 트리거 적용
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 기본 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO admin_users (username, password, role) VALUES
('admin', '$2a$10$p3IjolvysoWDmfuZ5B5PSO7T4wsNWMSyXJuInvYSbu4vJV3r1Wn1i', 'ROLE_ADMIN')
ON CONFLICT (username) DO NOTHING;
