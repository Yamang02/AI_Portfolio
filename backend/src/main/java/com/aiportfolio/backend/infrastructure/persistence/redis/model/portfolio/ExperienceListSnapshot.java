package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Experience;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
public class ExperienceListSnapshot extends PortfolioListSnapshot<ExperienceSnapshot> {

    public ExperienceListSnapshot(List<ExperienceSnapshot> items) {
        super(items);
    }

    public static ExperienceListSnapshot fromDomain(List<Experience> experiences) {
        if (experiences == null) {
            return new ExperienceListSnapshot(new ArrayList<>());
        }
        return new ExperienceListSnapshot(experiences.stream().map(ExperienceSnapshot::fromDomain).toList());
    }

    public List<Experience> toDomain() {
        List<ExperienceSnapshot> items = getItems();
        if (items == null) {
            return new ArrayList<>();
        }
        return items.stream().map(ExperienceSnapshot::toDomain).toList();
    }
}
