package com.aiportfolio.backend.application.portfolio.cache;

import com.aiportfolio.backend.domain.portfolio.model.Certification;

import java.util.ArrayList;
import java.util.List;

/**
 * @see CachedProjectList
 */
public record CachedCertificationList(List<Certification> items) {

    public CachedCertificationList {
        items = items == null ? new ArrayList<>() : new ArrayList<>(items);
    }
}
