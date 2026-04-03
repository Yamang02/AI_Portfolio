package com.aiportfolio.backend.application.portfolio.cache;

import com.aiportfolio.backend.domain.portfolio.model.Education;

import java.util.ArrayList;
import java.util.List;

/**
 * @see CachedProjectList
 */
public record CachedEducationList(List<Education> items) {

    public CachedEducationList {
        items = items == null ? new ArrayList<>() : new ArrayList<>(items);
    }
}
