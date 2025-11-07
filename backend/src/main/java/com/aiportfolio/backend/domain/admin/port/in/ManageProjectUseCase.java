package com.aiportfolio.backend.domain.admin.port.in;

import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.admin.model.command.ProjectCreateCommand;
import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;

/**
 * 프로젝트 관리 Use Case 인터페이스
 * 프로젝트 CRUD 기능을 정의합니다.
 */
public interface ManageProjectUseCase {
    
    /**
     * 프로젝트를 생성합니다.
     * 
     * @param request 프로젝트 생성 요청
     * @return 생성된 프로젝트 응답
     */
    ProjectResponse createProject(ProjectCreateCommand command);
    
    /**
     * 프로젝트를 수정합니다.
     * 
     * @param id 프로젝트 ID
     * @param request 프로젝트 수정 요청
     * @return 수정된 프로젝트 응답
     */
    ProjectResponse updateProject(String id, ProjectUpdateCommand command);
    
    /**
     * 프로젝트를 삭제합니다.
     * 
     * @param id 삭제할 프로젝트 ID
     */
    void deleteProject(String id);
}
