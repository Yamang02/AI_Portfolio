package com.aiportfolio.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SpamProtectionService {
    
    private final Map<String, SubmissionRecord> submissionRecords = new ConcurrentHashMap<>();
    
    private static final int MAX_SUBMISSIONS_PER_DAY = 5;
    private static final int MAX_SUBMISSIONS_PER_HOUR = 3;
    private static final long MIN_TIME_BETWEEN_SUBMISSIONS = 60000; // 1분
    private static final long BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24시간
    
    public SpamProtectionResult checkSpamProtection(String clientId) {
        try {
            SubmissionRecord record = submissionRecords.get(clientId);
            long now = System.currentTimeMillis();
            
            if (record == null) {
                return new SpamProtectionResult(true, null);
            }
            
            // 차단 기간 확인
            if (record.getBlockedUntil() != null && now < record.getBlockedUntil()) {
                long remainingTime = (record.getBlockedUntil() - now) / (1000 * 60 * 60);
                return new SpamProtectionResult(false, 
                    String.format("스팸 방지를 위해 24시간 동안 차단되었습니다. %d시간 후에 다시 시도해주세요.", remainingTime));
            }
            
            // 24시간이 지나면 카운트 리셋
            if (now - record.getLastSubmission() > 24 * 60 * 60 * 1000) {
                submissionRecords.remove(clientId);
                return new SpamProtectionResult(true, null);
            }
            
            // 시간당 제한 확인
            if (now - record.getLastSubmission() < 60 * 60 * 1000) { // 1시간 내
                if (record.getCount() >= MAX_SUBMISSIONS_PER_HOUR) {
                    return new SpamProtectionResult(false, 
                        "시간당 최대 3회까지만 문의할 수 있습니다. 1시간 후에 다시 시도해주세요.");
                }
            }
            
            // 일일 제한 확인
            if (record.getCount() >= MAX_SUBMISSIONS_PER_DAY) {
                // 24시간 차단
                record.setBlockedUntil(now + BLOCK_DURATION);
                submissionRecords.put(clientId, record);
                return new SpamProtectionResult(false, 
                    "일일 최대 5회를 초과하여 24시간 동안 차단되었습니다.");
            }
            
            return new SpamProtectionResult(true, null);
            
        } catch (Exception e) {
            log.error("스팸 방지 검사 오류", e);
            return new SpamProtectionResult(true, null); // 오류 시 허용
        }
    }
    
    public void recordSubmission(String clientId) {
        try {
            SubmissionRecord record = submissionRecords.get(clientId);
            long now = System.currentTimeMillis();
            
            if (record == null) {
                record = new SubmissionRecord();
                record.setCount(1);
                record.setLastSubmission(now);
            } else {
                // 1시간이 지나면 시간당 카운트 리셋
                if (now - record.getLastSubmission() > 60 * 60 * 1000) {
                    record.setCount(1);
                } else {
                    record.setCount(record.getCount() + 1);
                }
                record.setLastSubmission(now);
            }
            
            submissionRecords.put(clientId, record);
            
        } catch (Exception e) {
            log.error("제출 기록 오류", e);
        }
    }
    
    public SubmissionStatus getSubmissionStatus(String clientId) {
        try {
            SubmissionRecord record = submissionRecords.get(clientId);
            long now = System.currentTimeMillis();
            
            if (record == null) {
                return new SubmissionStatus(0, 0, 0, false);
            }
            
            // 차단 상태 확인
            if (record.getBlockedUntil() != null && now < record.getBlockedUntil()) {
                return new SubmissionStatus(
                    record.getCount(),
                    record.getCount(),
                    record.getBlockedUntil() - now,
                    true
                );
            }
            
            // 1시간 내 카운트
            int hourlyCount = (now - record.getLastSubmission() < 60 * 60 * 1000) ? record.getCount() : 0;
            
            // 다음 리셋까지 시간
            long timeUntilReset = Math.max(0, (record.getLastSubmission() + 60 * 60 * 1000) - now);
            
            return new SubmissionStatus(
                record.getCount(),
                hourlyCount,
                timeUntilReset,
                false
            );
            
        } catch (Exception e) {
            log.error("제출 상태 확인 오류", e);
            return new SubmissionStatus(0, 0, 0, false);
        }
    }
    
    // 내부 클래스들
    public static class SpamProtectionResult {
        private final boolean allowed;
        private final String message;
        
        public SpamProtectionResult(boolean allowed, String message) {
            this.allowed = allowed;
            this.message = message;
        }
        
        public boolean isAllowed() { return allowed; }
        public String getMessage() { return message; }
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
        
        public int getDailyCount() { return dailyCount; }
        public int getHourlyCount() { return hourlyCount; }
        public long getTimeUntilReset() { return timeUntilReset; }
        public boolean isBlocked() { return isBlocked; }
    }
    
    private static class SubmissionRecord {
        private int count;
        private long lastSubmission;
        private Long blockedUntil;
        
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
        
        public long getLastSubmission() { return lastSubmission; }
        public void setLastSubmission(long lastSubmission) { this.lastSubmission = lastSubmission; }
        
        public Long getBlockedUntil() { return blockedUntil; }
        public void setBlockedUntil(Long blockedUntil) { this.blockedUntil = blockedUntil; }
    }
} 