package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsByTechStackUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 기술스택 기반 프로젝트 조회 서비스
 * 특정 기술스택을 사용하는 프로젝트들을 조회하는 비즈니스 로직을 구현
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GetProjectsByTechStackService implements GetProjectsByTechStackUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    
    @Override
    public List<Project> getProjectsByTechStack(String techStackName) {
        log.debug("기술스택 '{}'을 사용하는 프로젝트 조회 요청", techStackName);
        
        if (techStackName == null || techStackName.trim().isEmpty()) {
            log.warn("기술스택 이름이 비어있습니다");
            return List.of();
        }
        
        List<Project> projects = portfolioRepositoryPort.findProjectsByTechStack(techStackName.trim());
        log.info("기술스택 '{}'을 사용하는 프로젝트 {} 개 조회 완료", techStackName, projects.size());
        
        return projects;
    }
    
    @Override
    public List<Project> getProjectsByTechStacks(List<String> techStackNames) {
        log.debug("기술스택 목록 {} 을 사용하는 프로젝트 조회 요청", techStackNames);
        
        if (techStackNames == null || techStackNames.isEmpty()) {
            log.warn("기술스택 이름 목록이 비어있습니다");
            return List.of();
        }
        
        // 빈 문자열이나 null 제거
        List<String> validTechStackNames = techStackNames.stream()
            .filter(name -> name != null && !name.trim().isEmpty())
            .map(String::trim)
            .toList();
        
        if (validTechStackNames.isEmpty()) {
            log.warn("유효한 기술스택 이름이 없습니다");
            return List.of();
        }
        
        List<Project> projects = portfolioRepositoryPort.findProjectsByTechStacks(validTechStackNames);
        log.info("기술스택 목록 {} 을 사용하는 프로젝트 {} 개 조회 완료", validTechStackNames, projects.size());
        
        return projects;
    }
}
