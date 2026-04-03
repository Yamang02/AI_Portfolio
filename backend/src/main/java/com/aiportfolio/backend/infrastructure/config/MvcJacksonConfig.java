package com.aiportfolio.backend.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * HTTP 응답·요청 JSON은 {@code redisObjectMapper}와 무관하게 {@code @Qualifier("objectMapper")}만 사용한다.
 */
@Configuration
public class MvcJacksonConfig implements WebMvcConfigurer {

    private final ObjectMapper httpObjectMapper;

    public MvcJacksonConfig(@Qualifier("objectMapper") ObjectMapper objectMapper) {
        this.httpObjectMapper = objectMapper;
    }

    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        for (HttpMessageConverter<?> converter : converters) {
            if (converter instanceof MappingJackson2HttpMessageConverter jackson) {
                jackson.setObjectMapper(httpObjectMapper);
            }
        }
    }
}
