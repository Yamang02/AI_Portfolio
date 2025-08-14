package com.aiportfolio.backend;

import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.infrastructure.persistence.postgres.PostgresPortfolioRepository;

import java.util.List;

/**
 * 포트폴리오 데이터 쿼리 테스트
 */
public class PortfolioQueryTest {
    
    public static void main(String[] args) {
        System.out.println("=== 포트폴리오 데이터 쿼리 테스트 시작 ===");
        
        try {
            // Repository 인스턴스 생성
            PortfolioRepositoryPort repository = new PostgresPortfolioRepository();
            
            // 프로젝트 데이터 조회
            System.out.println("\n--- 프로젝트 데이터 조회 ---");
            List<Project> projects = repository.findAllProjects();
            System.out.println("프로젝트 개수: " + projects.size());
            for (Project project : projects) {
                System.out.println("- " + project.getTitle() + " (" + project.getType() + ")");
            }
            
            // 경험 데이터 조회
            System.out.println("\n--- 경험 데이터 조회 ---");
            List<Experience> experiences = repository.findAllExperiences();
            System.out.println("경험 개수: " + experiences.size());
            for (Experience exp : experiences) {
                System.out.println("- " + exp.getRole() + " at " + exp.getOrganization());
            }
            
            // 교육 데이터 조회
            System.out.println("\n--- 교육 데이터 조회 ---");
            List<Education> educations = repository.findAllEducations();
            System.out.println("교육 개수: " + educations.size());
            for (Education edu : educations) {
                System.out.println("- " + edu.getTitle() + " at " + edu.getOrganization());
            }
            
            // 자격증 데이터 조회
            System.out.println("\n--- 자격증 데이터 조회 ---");
            List<Certification> certifications = repository.findAllCertifications();
            System.out.println("자격증 개수: " + certifications.size());
            for (Certification cert : certifications) {
                System.out.println("- " + cert.getName() + " from " + cert.getIssuer());
            }
            
            // 캐시 상태 확인
            System.out.println("\n--- 캐시 상태 ---");
            System.out.println("캐시 유효: " + repository.isCacheValid());
            
        } catch (Exception e) {
            System.err.println("테스트 실행 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("\n=== 테스트 완료 ===");
    }
}
