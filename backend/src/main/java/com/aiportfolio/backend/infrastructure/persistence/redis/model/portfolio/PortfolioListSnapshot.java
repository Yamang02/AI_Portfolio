package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public abstract class PortfolioListSnapshot<T> {

    private int schemaVersion = 1;
    private List<T> items = new ArrayList<>();

    protected PortfolioListSnapshot(List<T> items) {
        this.items = items == null ? new ArrayList<>() : new ArrayList<>(items);
    }
}
