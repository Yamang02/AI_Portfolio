package com.aiportfolio.backend.domain.portfolio.model.enums;

/**
 * 프로젝트 타입을 정의하는 enum
 */
public enum ProjectType {
    PERSONAL("개인 프로젝트"),
    TEAM("팀 프로젝트");
    
    private final String displayName;
    
    ProjectType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
