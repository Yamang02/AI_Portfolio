package com.aiportfolio.backend.domain.portfolio.model.enums;

/**
 * 교육 타입을 정의하는 enum
 */
public enum EducationType {
    ACADEMY("학원");
    
    private final String displayName;
    
    EducationType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
