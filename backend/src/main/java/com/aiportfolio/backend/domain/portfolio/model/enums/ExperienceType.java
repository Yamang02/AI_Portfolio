package com.aiportfolio.backend.domain.portfolio.model.enums;

/**
 * 경력 타입을 정의하는 enum
 */
public enum ExperienceType {
    FULL_TIME("정규직"),
    PART_TIME("파트타임"),
    CONTRACT("계약직"),
    FREELANCE("프리랜서"),
    INTERNSHIP("인턴십"),
    OTHER("기타");
    
    private final String displayName;
    
    ExperienceType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
