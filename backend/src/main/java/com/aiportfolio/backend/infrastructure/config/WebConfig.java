package com.aiportfolio.backend.infrastructure.config;

import com.aiportfolio.backend.infrastructure.web.admin.interceptor.AdminAuthInterceptor;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
        var registration = registry.addMapping("/**");

        if (CollectionUtils.isEmpty(corsProperties.getAllowedOrigins())) {
            log.warn("No CORS allowed origins configured. Falling back to pattern-based configuration with credentials disabled.");
            registration.allowedOriginPatterns("*")
                    .allowCredentials(false);
        } else {
            log.info("Configuring CORS with allowed origins: {}", corsProperties.getAllowedOrigins());
            registration.allowedOrigins(corsProperties.getAllowedOrigins().toArray(new String[0]))
                    .allowCredentials(corsProperties.isAllowCredentials());
        }

        if (CollectionUtils.isEmpty(corsProperties.getAllowedMethods())) {
            registration.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
        } else {
            registration.allowedMethods(corsProperties.getAllowedMethods().toArray(new String[0]));
        }

        String allowedHeaders = StringUtils.hasText(corsProperties.getAllowedHeaders())
                ? corsProperties.getAllowedHeaders()
                : "*";

        registration.allowedHeaders(allowedHeaders)
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

        String[] staticExtensions = {".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg",
                ".css", ".js", ".json", ".xml", ".woff", ".woff2",
                ".ttf", ".eot", ".webp", ".map"};

        registry.addResourceHandler("/**")
                .addResourceLocations("file:/app/static/", "classpath:/static/")
                .resourceChain(true)
                .addResolver(new SpaStaticResourceResolver(staticExtensions));

        log.info("Static resource handlers configured successfully");
    }

    /**
     * API/Actuator 제외, 정적 확장자·SPA index.html 처리
     */
    private static final class SpaStaticResourceResolver extends PathResourceResolver {

        private static final Logger log = LoggerFactory.getLogger(SpaStaticResourceResolver.class);

        private final String[] staticExtensions;

        SpaStaticResourceResolver(String[] staticExtensions) {
            this.staticExtensions = staticExtensions.clone();
        }

        @Override
        protected Resource getResource(String resourcePath, Resource location) throws IOException {
            if (isApiOrActuatorPath(resourcePath)) {
                log.debug("Skipping API/Actuator path: {}", resourcePath);
                return null;
            }
            String lowerPath = resourcePath.toLowerCase();
            boolean staticResourceExtension = hasStaticExtension(lowerPath, staticExtensions);
            Resource requestedResource = location.createRelative(resourcePath);
            if (requestedResource.exists() && requestedResource.isReadable()) {
                log.debug("Found static resource: {}", resourcePath);
                return requestedResource;
            }
            if (staticResourceExtension) {
                log.warn("Static resource not found: {} (location: {})", resourcePath, location);
                return null;
            }
            if (!resourcePath.contains(".")) {
                return resolveSpaIndex(resourcePath);
            }
            log.debug("Resource not found and not a SPA route: {}", resourcePath);
            return null;
        }

        private static boolean isApiOrActuatorPath(String resourcePath) {
            return resourcePath.startsWith("api/") || resourcePath.startsWith("actuator/");
        }

        private static boolean hasStaticExtension(String lowerPath, String[] extensions) {
            for (String ext : extensions) {
                if (lowerPath.endsWith(ext)) {
                    return true;
                }
            }
            return false;
        }

        private static Resource resolveSpaIndex(String resourcePath) {
            log.debug("SPA routing: serving index.html for path: {}", resourcePath);
            Resource indexHtml = new ClassPathResource("/static/index.html");
            if (indexHtml.exists()) {
                return indexHtml;
            }
            log.warn("index.html not found in classpath:/static/");
            return null;
        }
    }
}