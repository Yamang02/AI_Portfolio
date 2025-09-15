package com.aiportfolio.backend.infrastructure.web.dto.chat;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDto {
    private String question;
    private String selectedProject;
}
