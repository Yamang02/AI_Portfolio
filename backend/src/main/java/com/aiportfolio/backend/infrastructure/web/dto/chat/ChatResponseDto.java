package com.aiportfolio.backend.infrastructure.web.dto.chat;

import com.aiportfolio.backend.domain.chatbot.model.enums.ChatResponseType;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDto {
    private String response;
    private boolean success;
    private String error;
    private boolean showEmailButton;
    private ChatResponseType responseType;
    private String reason;
}
