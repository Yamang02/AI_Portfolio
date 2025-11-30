package com.aiportfolio.backend.domain.admin.port.in;

import com.aiportfolio.backend.domain.admin.model.command.ProjectCreateCommand;
import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;
import com.aiportfolio.backend.domain.portfolio.model.Project;

/**
 * 프로젝트 관리 Use Case 인터페이스
 * 프로젝트 CRUD 기능을 정의합니다.
 */
public interface ManageProjectUseCase {
    
    /**
     * 프로젝트를 생성합니다.
     * 
     * @param command 프로젝트 생성 명령
     * @return 생성된 프로젝트 도메인 모델
     */
    Project createProject(ProjectCreateCommand command);
    
    /**
     * 프로젝트를 수정합니다.
     * 
     * @param id 프로젝트 ID
     * @param command 프로젝트 수정 명령
     * @return 수정된 프로젝트 도메인 모델
     */
    Project updateProject(String id, ProjectUpdateCommand command);
    
    /**
     * 프로젝트를 삭제합니다.
     * 
     * @param id 삭제할 프로젝트 ID
     */
    void deleteProject(String id);
}
