package com.aiportfolio.backend.domain.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certification {
    private String id;
    private String name;
    private String issuer;
    private String date;
    private String description;
    private String credentialUrl;
}

