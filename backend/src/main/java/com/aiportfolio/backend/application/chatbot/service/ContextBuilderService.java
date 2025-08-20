package com.aiportfolio.backend.application.chatbot.service;

import com.aiportfolio.backend.domain.chatbot.port.out.ContextBuilderPort;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Certification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Primary;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 포트폴리오 데이터를 채팅 컨텍스트로 변환하는 서비스
 * ContextBuilderPort 구현체
 * 
 * Portfolio 도메인의 데이터를 Chatbot 도메인에서 사용할 수 있는
 * 컨텍스트 문자열로 변환하는 역할
 */
@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class ContextBuilderService implements ContextBuilderPort {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    
    @Override
    public String buildFullPortfolioContext() {
        try {
            StringBuilder context = new StringBuilder();
            
            // 프로젝트 정보
            List<Project> projects = portfolioRepositoryPort.findAllProjects();
            if (!projects.isEmpty()) {
                context.append("=== 개발 프로젝트 ===\n");
                context.append(projects.stream()
                        .map(this::formatProjectForContext)
                        .collect(Collectors.joining("\n---\n")));
                context.append("\n\n");
            }
            
            // 경험 정보
            List<Experience> experiences = portfolioRepositoryPort.findAllExperiences();
            if (!experiences.isEmpty()) {
                context.append("=== 업무 경험 ===\n");
                context.append(experiences.stream()
                        .map(this::formatExperienceForContext)
                        .collect(Collectors.joining("\n---\n")));
                context.append("\n\n");
            }
            
            // 교육 정보
            List<Education> educations = portfolioRepositoryPort.findAllEducations();
            if (!educations.isEmpty()) {
                context.append("=== 교육 이력 ===\n");
                context.append(educations.stream()
                        .map(this::formatEducationForContext)
                        .collect(Collectors.joining("\n---\n")));
                context.append("\n\n");
            }
            
            // 자격증 정보
            List<Certification> certifications = portfolioRepositoryPort.findAllCertifications();
            if (!certifications.isEmpty()) {
                context.append("=== 자격증 ===\n");
                context.append(certifications.stream()
                        .map(this::formatCertificationForContext)
                        .collect(Collectors.joining("\n---\n")));
            }
            
            String result = context.toString().trim();
            return result.isEmpty() ? "포트폴리오 정보를 불러올 수 없습니다." : result;
            
        } catch (Exception e) {
            log.error("전체 포트폴리오 컨텍스트 생성 중 오류 발생", e);
            return "포트폴리오 정보를 불러올 수 없습니다.";
        }
    }
    
    @Override
    public String buildProjectContext(String projectTitle) {
        try {
            List<Project> projects = portfolioRepositoryPort.findAllProjects();
            
            if (projectTitle != null && !projectTitle.trim().isEmpty()) {
                // 특정 프로젝트 검색
                return projects.stream()
                        .filter(p -> p.getTitle().equals(projectTitle))
                        .findFirst()
                        .map(project -> {
                            StringBuilder context = new StringBuilder();
                            context.append("=== 선택된 프로젝트 ===\n");
                            context.append(formatProjectForContext(project));
                            context.append("\n\n=== 기타 프로젝트 ===\n");
                            context.append(projects.stream()
                                    .filter(p -> !p.getTitle().equals(projectTitle))
                                    .map(this::formatProjectForContext)
                                    .collect(Collectors.joining("\n---\n")));
                            return context.toString();
                        })
                        .orElse("해당 프로젝트를 찾을 수 없습니다.");
            }
            
            // 전체 프로젝트 목록
            StringBuilder context = new StringBuilder();
            context.append("=== 전체 프로젝트 목록 ===\n");
            context.append(projects.stream()
                    .map(this::formatProjectForContext)
                    .collect(Collectors.joining("\n---\n")));
            return context.toString();
            
        } catch (Exception e) {
            log.error("프로젝트 컨텍스트 생성 중 오류 발생", e);
            return "프로젝트 정보를 불러올 수 없습니다.";
        }
    }
    
    @Override
    public boolean isAvailable() {
        try {
            return portfolioRepositoryPort != null;
        } catch (Exception e) {
            log.error("컨텍스트 빌더 가용성 검사 중 오류", e);
            return false;
        }
    }
    
    // === Private Helper Methods ===
    
    private String formatProjectForContext(Project project) {
        StringBuilder sb = new StringBuilder();
        sb.append("프로젝트명: ").append(project.getTitle()).append("\n");
        
        if (project.getDescription() != null && !project.getDescription().trim().isEmpty()) {
            sb.append("설명: ").append(project.getDescription()).append("\n");
        }
        
        if (project.getTechnologies() != null && !project.getTechnologies().isEmpty()) {
            sb.append("기술스택: ").append(String.join(", ", project.getTechnologies())).append("\n");
        }
        
        if (project.getMyContributions() != null && !project.getMyContributions().isEmpty()) {
            sb.append("주요 기여: ").append(String.join(", ", project.getMyContributions())).append("\n");
        }
        
        if (project.getGithubUrl() != null && !project.getGithubUrl().trim().isEmpty()) {
            sb.append("GitHub: ").append(project.getGithubUrl()).append("\n");
        }
        
        sb.append("유형: ").append(project.isTeam() ? "팀 프로젝트" : "개인 프로젝트");
        
        return sb.toString();
    }
    
    private String formatProjectSummaryForContext(Project project) {
        return String.format("- %s (%s)", 
                project.getTitle(), 
                project.getTechnologies() != null ? String.join(", ", project.getTechnologies()) : "기술스택 정보 없음");
    }
    
    private String formatExperienceForContext(Experience experience) {
        StringBuilder sb = new StringBuilder();
        sb.append("회사/기관: ").append(experience.getOrganization()).append("\n");
        sb.append("직책: ").append(experience.getRole()).append("\n");
        sb.append("기간: ").append(experience.getStartDate()).append(" ~ ");
        sb.append(experience.getEndDate() != null ? experience.getEndDate() : "현재").append("\n");
        
        if (experience.getDescription() != null && !experience.getDescription().trim().isEmpty()) {
            sb.append("업무 내용: ").append(experience.getDescription());
        }
        
        return sb.toString();
    }
    
    private String formatEducationForContext(Education education) {
        StringBuilder sb = new StringBuilder();
        sb.append("학교/기관: ").append(education.getOrganization()).append("\n");
        sb.append("전공/과정: ").append(education.getTitle()).append("\n");
        sb.append("기간: ").append(education.getStartDate()).append(" ~ ");
        sb.append(education.getEndDate() != null ? education.getEndDate() : "현재");
        
        return sb.toString();
    }
    
    private String formatCertificationForContext(Certification certification) {
        StringBuilder sb = new StringBuilder();
        sb.append("자격증명: ").append(certification.getName()).append("\n");
        sb.append("발급기관: ").append(certification.getIssuer()).append("\n");
        sb.append("취득일: ").append(certification.getDate());
        
        return sb.toString();
    }
}