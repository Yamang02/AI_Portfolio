package com.aiportfolio.backend.domain.chat;

import com.aiportfolio.backend.domain.port.in.ChatUseCase;
import com.aiportfolio.backend.model.ChatRequest;
import com.aiportfolio.backend.model.ChatResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 채팅 도메인의 레거시 서비스 (Facade)
 * 실제 로직은 ChatUseCase로 위임
 * 
 * @deprecated 새로운 코드에서는 ChatUseCase를 직접 사용하세요
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Deprecated
public class ChatService {
    
    private final ChatUseCase chatUseCase;
    
    /**
     * 사용자 질문에 대한 챗봇 응답을 생성합니다 (ChatUseCase로 위임)
     * 
     * @param question 사용자 질문
     * @param selectedProject 선택된 프로젝트 (옵션)
     * @return 챗봇 응답
     */
    public String getChatbotResponse(String question, String selectedProject) {
        log.debug("ChatService를 통한 챗봇 요청 (ChatUseCase로 위임)");
        
        ChatRequest request = new ChatRequest();
        request.setQuestion(question);
        request.setSelectedProject(selectedProject);
        
        ChatResponse response = chatUseCase.processQuestion(request);
        return response.getResponse();
    }
}