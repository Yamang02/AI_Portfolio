package com.aiportfolio.backend.infrastructure.config;

import com.aiportfolio.backend.infrastructure.web.admin.interceptor.AdminAuthInterceptor;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.util.List;

@Slf4j
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final CorsProperties corsProperties;
    private final AdminAuthInterceptor adminAuthInterceptor;

    public WebConfig(CorsProperties corsProperties, AdminAuthInterceptor adminAuthInterceptor) {
        this.corsProperties = corsProperties;
        this.adminAuthInterceptor = adminAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        log.info("Registering AdminAuthInterceptor for /api/admin/** endpoints");

        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/api/admin/**")
                .excludePathPatterns(
                    "/api/admin/auth/login",
                    "/api/admin/auth/session",
                    "/api/admin/auth/logout"
                );

        log.info("AdminAuthInterceptor registered successfully");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        log.info("Configuring CORS with allowed origins: {}", corsProperties.getAllowedOrigins());

        registry.addMapping("/**")
                .allowedOrigins(corsProperties.getAllowedOrigins().toArray(new String[0]))
                .allowedMethods(corsProperties.getAllowedMethods().toArray(new String[0]))
                .allowedHeaders(corsProperties.getAllowedHeaders())
                .allowCredentials(corsProperties.isAllowCredentials())
                .maxAge(3600); // 1시간 동안 preflight 결과 캐싱

        log.info("CORS configured successfully");
    }

    @Getter
    @Setter
    @Configuration
    @ConfigurationProperties(prefix = "spring.web.cors")
    public static class CorsProperties {
        private List<String> allowedOrigins;
        private List<String> allowedMethods;
        private String allowedHeaders;
        private boolean allowCredentials;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        log.info("Configuring static resource handlers for frontend");
        
        // 정적 리소스 파일 확장자 목록
        String[] staticExtensions = {".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg", 
                                     ".css", ".js", ".json", ".xml", ".woff", ".woff2", 
                                     ".ttf", ".eot", ".webp"};
        
        // 프론트엔드 정적 파일 서빙 설정
        registry.addResourceHandler("/**")
                .addResourceLocations("file:/app/static/", "classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        
                        // 파일이 존재하면 반환
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        
                        // 정적 리소스 파일 확장자를 가진 경우는 null 반환 (404)
                        String lowerPath = resourcePath.toLowerCase();
                        for (String ext : staticExtensions) {
                            if (lowerPath.endsWith(ext)) {
                                return null;
                            }
                        }
                        
                        // API나 Actuator 경로는 제외
                        if (resourcePath.startsWith("api/") || resourcePath.startsWith("actuator/")) {
                            return null;
                        }
                        
                        // SPA 라우팅: 확장자가 없는 경로는 index.html로 리다이렉트
                        if (!resourcePath.contains(".")) {
                            return new ClassPathResource("/static/index.html");
                        }
                        
                        return null;
                    }
                });
        
        log.info("Static resource handlers configured successfully");
    }
} 