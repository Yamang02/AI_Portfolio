package com.aiportfolio.backend.domain.monitoring.model;

/**
 * 클라우드 제공자 열거형
 */
public enum CloudProvider {
    AWS("Amazon Web Services"),
    GCP("Google Cloud Platform");

    private final String displayName;

    CloudProvider(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

