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
VALUES ('

Want to be 프로덕트 엔지니어로

## 주요 관심사
- Full Stack 웹서비스 개발
- DevOps 및 인프라 관리
- 기술스택에 얽매이지 않는 에이전틱 코딩
- 기존 소프트웨어 디자인의 철학을 에이전틱 코딩에 접목
- 에이전틱 코딩 활용자들의 협업, 코드 품질관리
- 마케팅, 기획, CRM까지 이해하기

더 자세한 내용은 프로젝트를 통해 확인해주세요!', 1)
ON CONFLICT DO NOTHING;
