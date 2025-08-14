package com.aiportfolio.backend.domain.model.enums;

/**
 * 경력 타입을 정의하는 enum
 */
public enum ExperienceType {
    FULL_TIME("정규직"),
    CONTRACT("계약직");
    
    private final String displayName;
    
    ExperienceType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
