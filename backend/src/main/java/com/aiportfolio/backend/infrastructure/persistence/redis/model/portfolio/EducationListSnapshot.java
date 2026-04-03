package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Education;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
public class EducationListSnapshot extends PortfolioListSnapshot<EducationSnapshot> {

    public EducationListSnapshot(List<EducationSnapshot> items) {
        super(items);
    }

    public static EducationListSnapshot fromDomain(List<Education> educations) {
        if (educations == null) {
            return new EducationListSnapshot(new ArrayList<>());
        }
        return new EducationListSnapshot(educations.stream().map(EducationSnapshot::fromDomain).toList());
    }

    public List<Education> toDomain() {
        List<EducationSnapshot> items = getItems();
        if (items == null) {
            return new ArrayList<>();
        }
        return items.stream().map(EducationSnapshot::toDomain).toList();
    }
}
