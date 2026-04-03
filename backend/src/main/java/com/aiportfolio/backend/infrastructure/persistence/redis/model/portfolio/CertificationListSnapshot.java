package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Certification;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
public class CertificationListSnapshot extends PortfolioListSnapshot<CertificationSnapshot> {

    public CertificationListSnapshot(List<CertificationSnapshot> items) {
        super(items);
    }

    public static CertificationListSnapshot fromDomain(List<Certification> certifications) {
        if (certifications == null) {
            return new CertificationListSnapshot(new ArrayList<>());
        }
        return new CertificationListSnapshot(certifications.stream().map(CertificationSnapshot::fromDomain).toList());
    }

    public List<Certification> toDomain() {
        List<CertificationSnapshot> items = getItems();
        if (items == null) {
            return new ArrayList<>();
        }
        return items.stream().map(CertificationSnapshot::toDomain).toList();
    }
}
