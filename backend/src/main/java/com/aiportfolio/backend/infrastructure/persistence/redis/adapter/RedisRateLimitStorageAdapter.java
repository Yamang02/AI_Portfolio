package com.aiportfolio.backend.infrastructure.persistence.redis.adapter;

import com.aiportfolio.backend.domain.chatbot.model.SpamSubmissionRecord;
import com.aiportfolio.backend.domain.chatbot.port.out.RateLimitStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

/**
 * 스팸 방지 제출 상태를 Redis에 저장합니다. 인스턴스 간 공유 및 재시작 후에도 유지됩니다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisRateLimitStorageAdapter implements RateLimitStoragePort {

    private static final String KEY_PREFIX = "chatbot:spam:submission:";
    /** 일일 윈도(24h)보다 약간 길게 두어 TTL 만료와 리셋 로직이 맞물리도록 함 */
    private static final Duration RECORD_TTL = Duration.ofHours(25);

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public Optional<SpamSubmissionRecord> getRecord(String clientId) {
        Object raw = redisTemplate.opsForValue().get(KEY_PREFIX + clientId);
        return Optional.ofNullable(fromRedisValue(raw));
    }

    @Override
    public void saveRecord(String clientId, SpamSubmissionRecord submissionState) {
        redisTemplate.opsForValue().set(KEY_PREFIX + clientId, submissionState, RECORD_TTL);
    }

    @Override
    public void deleteRecord(String clientId) {
        redisTemplate.delete(KEY_PREFIX + clientId);
    }

    private SpamSubmissionRecord fromRedisValue(Object raw) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof SpamSubmissionRecord r) {
            return r;
        }
        log.warn("Unexpected Redis value type for spam record: {}", raw.getClass().getName());
        return null;
    }
}
