-- V004: profile_introduction 테이블 생성
-- 자기소개 마크다운 콘텐츠를 관리하는 테이블

CREATE TABLE IF NOT EXISTS profile_introduction (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_profile_introduction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_introduction_updated_at
    BEFORE UPDATE ON profile_introduction
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_introduction_updated_at();

-- 초기 데이터 (선택적)
INSERT INTO profile_introduction (content, version)
VALUES ('# 안녕하세요

저는 AI와 함께 성장하는 개발자입니다.

## 주요 관심사
- Full Stack 개발
- 클린 아키텍처
- AI 활용 개발

더 자세한 내용은 프로젝트를 통해 확인해주세요!', 1)
ON CONFLICT DO NOTHING;
