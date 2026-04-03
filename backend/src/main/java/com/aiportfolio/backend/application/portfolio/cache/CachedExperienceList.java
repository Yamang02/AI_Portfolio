package com.aiportfolio.backend.application.portfolio.cache;

import com.aiportfolio.backend.domain.portfolio.model.Experience;

import java.util.ArrayList;
import java.util.List;

/**
 * @see CachedProjectList
 */
public record CachedExperienceList(List<Experience> items) {

    public CachedExperienceList {
        items = items == null ? new ArrayList<>() : new ArrayList<>(items);
    }
}
