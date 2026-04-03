package com.aiportfolio.backend.domain.portfolio.port.out;

import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;

import java.util.List;
import java.util.Optional;

/**
 * 포트폴리오 읽기 모델 캐시 포트.
 * Application은 캐시 기술(Redis, serializer)을 모르고 이 포트만 사용한다.
 */
public interface PortfolioCachePort {

    Optional<List<Project>> getPortfolioProjects();

    void putPortfolioProjects(List<Project> projects);

    Optional<List<Experience>> getPortfolioExperiences();

    void putPortfolioExperiences(List<Experience> experiences);

    Optional<List<Education>> getPortfolioEducations();

    void putPortfolioEducations(List<Education> educations);

    Optional<List<Certification>> getPortfolioCertifications();

    void putPortfolioCertifications(List<Certification> certifications);

    Optional<List<Project>> getGithubProjects();

    void putGithubProjects(List<Project> projects);

    Optional<Project> getGithubProject(String repoName);

    void putGithubProject(String repoName, Project project);

    void evictPortfolioProjects();

    void evictPortfolioExperiences();

    void evictPortfolioEducations();

    void evictPortfolioCertifications();
}
