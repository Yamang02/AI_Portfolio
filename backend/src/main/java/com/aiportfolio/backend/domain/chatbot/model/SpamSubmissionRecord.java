package com.aiportfolio.backend.domain.chatbot.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 챗봇 스팸 방지(요청 빈도) 상태. Redis 등 외부 저장소에 직렬화됩니다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpamSubmissionRecord {

    private int count;
    private long lastSubmission;
    private Long blockedUntil;
}
