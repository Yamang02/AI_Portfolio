package com.aiportfolio.backend.domain.portfolio.model.enums;

/**
 * 교육 타입을 정의하는 enum
 */
public enum EducationType {
    UNIVERSITY("대학교"),
    BOOTCAMP("부트캠프"),
    ONLINE_COURSE("온라인 강의"),
    CERTIFICATION("자격증"),
    OTHER("기타");
    
    private final String displayName;
    
    EducationType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
