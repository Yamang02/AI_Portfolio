package com.aiportfolio.backend.application.chatbot.validation;

import com.aiportfolio.backend.domain.chatbot.model.SpamSubmissionRecord;
import com.aiportfolio.backend.domain.chatbot.port.out.RateLimitStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpamProtectionService {

    private final RateLimitStoragePort rateLimitStoragePort;

    private static final int MAX_SUBMISSIONS_PER_DAY = 45;
    private static final int MAX_SUBMISSIONS_PER_HOUR = 15;
    private static final long BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24시간

    public SpamProtectionResult checkSpamProtection(String clientId) {
        try {
            SpamSubmissionRecord submissionState = rateLimitStoragePort.getRecord(clientId).orElse(null);
            long now = System.currentTimeMillis();

            if (submissionState == null) {
                return new SpamProtectionResult(true, null);
            }

            if (submissionState.getBlockedUntil() != null && now < submissionState.getBlockedUntil()) {
                long remainingTime = (submissionState.getBlockedUntil() - now) / (1000 * 60 * 60);
                return new SpamProtectionResult(false,
                    String.format("스팸 방지를 위해 24시간 동안 차단되었습니다. %d시간 후에 다시 시도해주세요.", remainingTime));
            }

            if (now - submissionState.getLastSubmission() > 24 * 60 * 60 * 1000) {
                rateLimitStoragePort.deleteRecord(clientId);
                return new SpamProtectionResult(true, null);
            }

            if (now - submissionState.getLastSubmission() < 60 * 60 * 1000
                && submissionState.getCount() >= MAX_SUBMISSIONS_PER_HOUR) {
                return new SpamProtectionResult(false,
                    "시간당 최대 15회까지만 문의할 수 있습니다. 1시간 후에 다시 시도해주세요.");
            }

            if (submissionState.getCount() >= MAX_SUBMISSIONS_PER_DAY) {
                submissionState.setBlockedUntil(now + BLOCK_DURATION);
                rateLimitStoragePort.saveRecord(clientId, submissionState);
                return new SpamProtectionResult(false,
                    "일일 최대 45회를 초과하여 24시간 동안 차단되었습니다.");
            }

            return new SpamProtectionResult(true, null);

        } catch (Exception e) {
            log.error("스팸 방지 검사 오류", e);
            return new SpamProtectionResult(true, null);
        }
    }

    public void recordSubmission(String clientId) {
        try {
            SpamSubmissionRecord submissionState = rateLimitStoragePort.getRecord(clientId).orElse(null);
            long now = System.currentTimeMillis();

            if (submissionState == null) {
                submissionState = new SpamSubmissionRecord(1, now, null);
            } else {
                if (now - submissionState.getLastSubmission() > 60 * 60 * 1000) {
                    submissionState.setCount(1);
                } else {
                    submissionState.setCount(submissionState.getCount() + 1);
                }
                submissionState.setLastSubmission(now);
            }

            rateLimitStoragePort.saveRecord(clientId, submissionState);

        } catch (Exception e) {
            log.error("제출 기록 오류", e);
        }
    }

    public SubmissionStatus getSubmissionStatus(String clientId) {
        try {
            SpamSubmissionRecord submissionState = rateLimitStoragePort.getRecord(clientId).orElse(null);
            long now = System.currentTimeMillis();

            if (submissionState == null) {
                return new SubmissionStatus(0, 0, 0, false);
            }

            if (submissionState.getBlockedUntil() != null && now < submissionState.getBlockedUntil()) {
                return new SubmissionStatus(
                    submissionState.getCount(),
                    submissionState.getCount(),
                    submissionState.getBlockedUntil() - now,
                    true
                );
            }

            int hourlyCount = (now - submissionState.getLastSubmission() < 60 * 60 * 1000) ? submissionState.getCount() : 0;
            long timeUntilReset = Math.max(0, (submissionState.getLastSubmission() + 60 * 60 * 1000) - now);

            return new SubmissionStatus(
                submissionState.getCount(),
                hourlyCount,
                timeUntilReset,
                false
            );

        } catch (Exception e) {
            log.error("제출 상태 확인 오류", e);
            return new SubmissionStatus(0, 0, 0, false);
        }
    }

    public static class SpamProtectionResult {
        private final boolean allowed;
        private final String message;

        public SpamProtectionResult(boolean allowed, String message) {
            this.allowed = allowed;
            this.message = message;
        }

        public boolean isAllowed() {
            return allowed;
        }

        public String getMessage() {
            return message;
        }
    }

    public static class SubmissionStatus {
        private final int dailyCount;
        private final int hourlyCount;
        private final long timeUntilReset;
        private final boolean isBlocked;

        public SubmissionStatus(int dailyCount, int hourlyCount, long timeUntilReset, boolean isBlocked) {
            this.dailyCount = dailyCount;
            this.hourlyCount = hourlyCount;
            this.timeUntilReset = timeUntilReset;
            this.isBlocked = isBlocked;
        }

        public int getDailyCount() {
            return dailyCount;
        }

        public int getHourlyCount() {
            return hourlyCount;
        }

        public long getTimeUntilReset() {
            return timeUntilReset;
        }

        public boolean isBlocked() {
            return isBlocked;
        }
    }
}
