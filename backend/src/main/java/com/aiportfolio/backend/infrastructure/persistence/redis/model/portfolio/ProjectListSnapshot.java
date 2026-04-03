package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Project;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
public class ProjectListSnapshot extends PortfolioListSnapshot<ProjectSnapshot> {

    public ProjectListSnapshot(List<ProjectSnapshot> items) {
        super(items);
    }

    public static ProjectListSnapshot fromDomain(List<Project> projects) {
        if (projects == null) {
            return new ProjectListSnapshot(new ArrayList<>());
        }
        return new ProjectListSnapshot(projects.stream().map(ProjectSnapshot::fromDomain).toList());
    }

    public List<Project> toDomain() {
        List<ProjectSnapshot> items = getItems();
        if (items == null) {
            return new ArrayList<>();
        }
        return items.stream().map(ProjectSnapshot::toDomain).toList();
    }
}
