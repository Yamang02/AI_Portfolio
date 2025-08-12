package com.aiportfolio.backend.service;

import com.aiportfolio.backend.domain.portfolio.ProjectRepository;
import com.aiportfolio.backend.model.Project;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 프로젝트 관련 비즈니스 로직을 처리하는 서비스
 * Repository 패턴을 통해 데이터 접근 계층과 분리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    
    /**
     * 모든 프로젝트를 조회합니다
     */
    public List<Project> getAllProjects() {
        return projectRepository.findAllProjects();
    }
    
    /**
     * ID로 프로젝트를 조회합니다
     */
    public Project getProjectById(String id) {
        return projectRepository.findProjectById(id)
                .orElse(null);
    }
    
    /**
     * 제목으로 프로젝트를 조회합니다
     */
    public Project getProjectByTitle(String title) {
        return projectRepository.findProjectByTitle(title)
                .orElse(null);
    }
    
    /**
     * 캐시를 무효화합니다 (관리자 기능)
     */
    public void refreshCache() {
        projectRepository.invalidateCache();
        log.info("프로젝트 캐시가 무효화되었습니다");
    }
} 