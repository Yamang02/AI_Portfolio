package com.aiportfolio.backend.infrastructure.persistence.redis.adapter;

import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioCachePort;
import com.aiportfolio.backend.infrastructure.config.CacheKeys;
import com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio.CertificationListSnapshot;
import com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio.EducationListSnapshot;
import com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio.ExperienceListSnapshot;
import com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio.ProjectListSnapshot;
import com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio.ProjectSnapshot;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisPortfolioCacheAdapter implements PortfolioCachePort {

    private static final Duration PORTFOLIO_TTL = Duration.ofDays(1);
    private static final Duration GITHUB_TTL = Duration.ofMinutes(30);

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public Optional<List<Project>> getPortfolioProjects() {
        return readSnapshot(portfolioKey(CacheKeys.PROJECTS_ALL), ProjectListSnapshot.class).map(ProjectListSnapshot::toDomain);
    }

    @Override
    public void putPortfolioProjects(List<Project> projects) {
        writeSnapshot(portfolioKey(CacheKeys.PROJECTS_ALL), ProjectListSnapshot.fromDomain(projects), PORTFOLIO_TTL);
    }

    @Override
    public Optional<List<Experience>> getPortfolioExperiences() {
        return readSnapshot(portfolioKey(CacheKeys.EXPERIENCES_ALL), ExperienceListSnapshot.class).map(ExperienceListSnapshot::toDomain);
    }

    @Override
    public void putPortfolioExperiences(List<Experience> experiences) {
        writeSnapshot(portfolioKey(CacheKeys.EXPERIENCES_ALL), ExperienceListSnapshot.fromDomain(experiences), PORTFOLIO_TTL);
    }

    @Override
    public Optional<List<Education>> getPortfolioEducations() {
        return readSnapshot(portfolioKey(CacheKeys.EDUCATIONS_ALL), EducationListSnapshot.class).map(EducationListSnapshot::toDomain);
    }

    @Override
    public void putPortfolioEducations(List<Education> educations) {
        writeSnapshot(portfolioKey(CacheKeys.EDUCATIONS_ALL), EducationListSnapshot.fromDomain(educations), PORTFOLIO_TTL);
    }

    @Override
    public Optional<List<Certification>> getPortfolioCertifications() {
        return readSnapshot(portfolioKey(CacheKeys.CERTIFICATIONS_ALL), CertificationListSnapshot.class).map(CertificationListSnapshot::toDomain);
    }

    @Override
    public void putPortfolioCertifications(List<Certification> certifications) {
        writeSnapshot(portfolioKey(CacheKeys.CERTIFICATIONS_ALL), CertificationListSnapshot.fromDomain(certifications), PORTFOLIO_TTL);
    }

    @Override
    public Optional<List<Project>> getGithubProjects() {
        return readSnapshot(githubKey(CacheKeys.GITHUB_PROJECTS), ProjectListSnapshot.class).map(ProjectListSnapshot::toDomain);
    }

    @Override
    public void putGithubProjects(List<Project> projects) {
        writeSnapshot(githubKey(CacheKeys.GITHUB_PROJECTS), ProjectListSnapshot.fromDomain(projects), GITHUB_TTL);
    }

    @Override
    public Optional<Project> getGithubProject(String repoName) {
        return readSnapshot(githubKey(CacheKeys.GITHUB_PROJECT_PREFIX + repoName), ProjectSnapshot.class).map(ProjectSnapshot::toDomain);
    }

    @Override
    public void putGithubProject(String repoName, Project project) {
        writeSnapshot(githubKey(CacheKeys.GITHUB_PROJECT_PREFIX + repoName), ProjectSnapshot.fromDomain(project), GITHUB_TTL);
    }

    @Override
    public void evictPortfolioProjects() {
        stringRedisTemplate.delete(portfolioKey(CacheKeys.PROJECTS_ALL));
    }

    @Override
    public void evictPortfolioExperiences() {
        stringRedisTemplate.delete(portfolioKey(CacheKeys.EXPERIENCES_ALL));
    }

    @Override
    public void evictPortfolioEducations() {
        stringRedisTemplate.delete(portfolioKey(CacheKeys.EDUCATIONS_ALL));
    }

    @Override
    public void evictPortfolioCertifications() {
        stringRedisTemplate.delete(portfolioKey(CacheKeys.CERTIFICATIONS_ALL));
    }

    private <T> Optional<T> readSnapshot(String key, Class<T> type) {
        String json = stringRedisTemplate.opsForValue().get(key);
        if (json == null || json.isBlank()) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(json, type));
        } catch (Exception e) {
            log.warn("Invalid cache payload. key={}, type={}", key, type.getSimpleName(), e);
            stringRedisTemplate.delete(key);
            return Optional.empty();
        }
    }

    private void writeSnapshot(String key, Object payload, Duration ttl) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            stringRedisTemplate.opsForValue().set(key, json, ttl);
        } catch (Exception e) {
            log.warn("Cache write skipped. key={}", key, e);
        }
    }

    private static String portfolioKey(String key) {
        return CacheKeys.PORTFOLIO + "::" + key;
    }

    private static String githubKey(String key) {
        return CacheKeys.GITHUB + "::" + key;
    }
}
