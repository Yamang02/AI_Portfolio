package com.aiportfolio.backend.infrastructure.security;

import com.aiportfolio.backend.infrastructure.web.dto.chat.ChatResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
public class InputValidationService {
    
    public static class ValidationResult {
        private final boolean valid;
        private final String reason;
        private final ChatResponseDto.ResponseType responseType;
        
        public ValidationResult(boolean valid, String reason, ChatResponseDto.ResponseType responseType) {
            this.valid = valid;
            this.reason = reason;
            this.responseType = responseType;
        }
        
        public boolean isValid() { return valid; }
        public String getReason() { return reason; }
        public ChatResponseDto.ResponseType getResponseType() { return responseType; }
    }
    
    /**
     * 입력 검증
     */
    public ValidationResult validateInput(String input) {
        if (input == null || input.trim().isEmpty()) {
            return new ValidationResult(false, "질문을 입력해주세요.", ChatResponseDto.ResponseType.INVALID_INPUT);
        }
        
        String trimmedInput = input.trim();
        
        // 1. 길이 검증
        if (trimmedInput.length() < 2) {
            return new ValidationResult(false, "질문을 2자 이상 입력해주세요.", ChatResponseDto.ResponseType.INVALID_INPUT);
        }
        
        if (trimmedInput.length() > 500) {
            return new ValidationResult(false, "질문은 500자 이하로 입력해주세요.", ChatResponseDto.ResponseType.INVALID_INPUT);
        }
        
        // 2. 스팸 패턴 검증
        if (isSpamPattern(trimmedInput)) {
            return new ValidationResult(false, "적절한 질문을 입력해주세요. 포트폴리오나 프로젝트에 대한 질문을 해주시면 도움을 드릴 수 있습니다.", ChatResponseDto.ResponseType.SPAM_DETECTED);
        }
        
        // 3. 의미 없는 반복 문자 검증
        if (isMeaninglessRepetition(trimmedInput)) {
            return new ValidationResult(false, "의미 있는 질문을 입력해주세요.", ChatResponseDto.ResponseType.SPAM_DETECTED);
        }
        
        // 4. 한글/영문/숫자/특수문자 비율 검증
        if (!hasReasonableCharacterRatio(trimmedInput)) {
            return new ValidationResult(false, "적절한 질문을 입력해주세요.", ChatResponseDto.ResponseType.SPAM_DETECTED);
        }
        
        return new ValidationResult(true, null, ChatResponseDto.ResponseType.SUCCESS);
    }
    
    /**
     * 스팸 패턴 감지
     */
    private boolean isSpamPattern(String input) {
        String lowerInput = input.toLowerCase();
        
        // 스팸 패턴들
        List<String> spamPatterns = Arrays.asList(
            "ㅋㅋㅋㅋㅋ", "ㅎㅎㅎㅎㅎ", "!!!!!", "?????", "...",
            "ㅋㅋㅋㅋ", "ㅎㅎㅎㅎ", "!!!!", "????",
            "ㅋㅋㅋ", "ㅎㅎㅎ", "!!!", "???",
            "spam", "test", "hello world", "안녕하세요안녕하세요"
        );
        
        return spamPatterns.stream().anyMatch(pattern -> lowerInput.contains(pattern));
    }
    
    /**
     * 의미 없는 반복 문자 감지
     */
    private boolean isMeaninglessRepetition(String input) {
        // 같은 문자 5번 이상 반복
        Pattern repetitionPattern = Pattern.compile("(.)\\1{4,}");
        if (repetitionPattern.matcher(input).find()) {
            return true;
        }
        
        // "아아아아아", "하하하하하" 같은 패턴
        Pattern koreanRepetition = Pattern.compile("[가-힣]{2,}\\1{2,}");
        if (koreanRepetition.matcher(input).find()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 문자 비율 검증 (한글/영문/숫자/특수문자)
     */
    private boolean hasReasonableCharacterRatio(String input) {
        int totalLength = input.length();
        if (totalLength < 3) return true; // 짧은 입력은 허용
        
        // 한글, 영문, 숫자, 특수문자 개수 계산
        int koreanCount = (int) input.chars().filter(ch -> ch >= 0xAC00 && ch <= 0xD7AF).count();
        int englishCount = (int) input.chars().filter(ch -> (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')).count();
        int numberCount = (int) input.chars().filter(ch -> ch >= '0' && ch <= '9').count();
        int specialCount = totalLength - koreanCount - englishCount - numberCount;
        
        // 특수문자가 50% 이상이면 스팸으로 간주
        if (specialCount > totalLength * 0.5) {
            return false;
        }
        
        // 의미 있는 문자가 너무 적으면 스팸으로 간주
        int meaningfulChars = koreanCount + englishCount + numberCount;
        if (meaningfulChars < totalLength * 0.3) {
            return false;
        }
        
        return true;
    }
} 