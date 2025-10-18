-- 기존 테이블들에 updated_at 자동 갱신 트리거 추가

-- projects 테이블에 트리거 적용
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- experiences 테이블에 트리거 적용
CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- education 테이블에 트리거 적용
CREATE TRIGGER update_education_updated_at
    BEFORE UPDATE ON education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- certifications 테이블에 트리거 적용
CREATE TRIGGER update_certifications_updated_at
    BEFORE UPDATE ON certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- tech_stack_metadata 테이블에 트리거 적용
CREATE TRIGGER update_tech_stack_metadata_updated_at
    BEFORE UPDATE ON tech_stack_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
