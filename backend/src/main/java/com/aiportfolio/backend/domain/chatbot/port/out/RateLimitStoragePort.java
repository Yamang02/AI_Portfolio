package com.aiportfolio.backend.domain.chatbot.port.out;

import com.aiportfolio.backend.domain.chatbot.model.SpamSubmissionRecord;

import java.util.Optional;

/**
 * 챗봇 스팸 방지용 클라이언트별 제출 상태 저장 (아웃바운드 포트).
 * Application 레이어는 Redis 등 구현 세부를 알지 않습니다.
 */
public interface RateLimitStoragePort {

    Optional<SpamSubmissionRecord> getRecord(String clientId);

    void saveRecord(String clientId, SpamSubmissionRecord record);

    void deleteRecord(String clientId);
}
