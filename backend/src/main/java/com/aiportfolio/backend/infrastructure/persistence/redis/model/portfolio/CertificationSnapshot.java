package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Certification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificationSnapshot {
    private String id;
    private String name;
    private String issuer;
    private LocalDate date;
    private LocalDate expiryDate;
    private String credentialId;
    private String credentialUrl;
    private String description;
    private String category;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CertificationSnapshot fromDomain(Certification domain) {
        if (domain == null) {
            return null;
        }
        return CertificationSnapshot.builder()
            .id(domain.getId())
            .name(domain.getName())
            .issuer(domain.getIssuer())
            .date(domain.getDate())
            .expiryDate(domain.getExpiryDate())
            .credentialId(domain.getCredentialId())
            .credentialUrl(domain.getCredentialUrl())
            .description(domain.getDescription())
            .category(domain.getCategory())
            .sortOrder(domain.getSortOrder())
            .createdAt(domain.getCreatedAt())
            .updatedAt(domain.getUpdatedAt())
            .build();
    }

    public Certification toDomain() {
        return Certification.builder()
            .id(id)
            .name(name)
            .issuer(issuer)
            .date(date)
            .expiryDate(expiryDate)
            .credentialId(credentialId)
            .credentialUrl(credentialUrl)
            .description(description)
            .category(category)
            .sortOrder(sortOrder)
            .createdAt(createdAt)
            .updatedAt(updatedAt)
            .build();
    }
}
