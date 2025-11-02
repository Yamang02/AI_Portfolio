package com.aiportfolio.backend.infrastructure.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * Cloudinary 설정 클래스
 * 이미지 업로드 및 관리를 위한 Cloudinary 클라이언트를 구성합니다.
 */
@Configuration
public class CloudinaryConfig {
    
    @Value("${cloudinary.cloud-name}")
    private String cloudName;
    
    @Value("${cloudinary.api-key}")
    private String apiKey;
    
    @Value("${cloudinary.api-secret}")
    private String apiSecret;
    
    /**
     * Cloudinary 클라이언트 빈을 생성합니다.
     * 환경 변수에서 설정된 인증 정보를 사용합니다.
     */
    @Bean
    public Cloudinary cloudinary() {
        @SuppressWarnings("unchecked")
        Map<String, Object> config = ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true  // HTTPS 사용
        );
        
        return new Cloudinary(config);
    }
}
