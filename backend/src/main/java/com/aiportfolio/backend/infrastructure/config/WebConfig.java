package com.aiportfolio.backend.infrastructure.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Slf4j
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS 설정은 application.yml의 spring.web.cors 설정을 사용합니다
        // Java 코드로 CORS를 설정하면 YAML 설정을 덮어쓰므로 여기서는 설정하지 않습니다
        // allowCredentials(true)와 함께 와일드카드(*) 사용은 브라우저에서 차단되므로 제거
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