package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.Project;

import java.util.List;

/**
 * 기술스택 기반 프로젝트 조회 Use Case
 * 특정 기술스택을 사용하는 프로젝트들을 조회하는 비즈니스 로직을 정의
 */
public interface GetProjectsByTechStackUseCase {
    
    /**
     * 특정 기술스택을 사용하는 프로젝트 목록 조회
     * @param techStackName 기술스택 이름
     * @return 해당 기술스택을 사용하는 프로젝트 목록
     */
    List<Project> getProjectsByTechStack(String techStackName);
    
    /**
     * 여러 기술스택을 사용하는 프로젝트 목록 조회
     * @param techStackNames 기술스택 이름 목록
     * @return 해당 기술스택들을 사용하는 프로젝트 목록
     */
    List<Project> getProjectsByTechStacks(List<String> techStackNames);
}
