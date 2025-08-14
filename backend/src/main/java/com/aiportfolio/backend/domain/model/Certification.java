package com.aiportfolio.backend.domain.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certification {
    private String id;
    private String name;
    private String issuer;
    private LocalDate date;
    private String description;
    private String credentialUrl;
}

