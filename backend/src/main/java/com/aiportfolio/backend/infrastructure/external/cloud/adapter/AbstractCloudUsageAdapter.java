package com.aiportfolio.backend.infrastructure.external.cloud.adapter;

import com.aiportfolio.backend.domain.admin.model.dto.CloudUsageSnapshot;
import com.aiportfolio.backend.domain.admin.model.vo.CloudProvider;
import com.aiportfolio.backend.domain.admin.model.vo.CloudUsageStatus;
import com.aiportfolio.backend.domain.admin.port.out.CloudUsageProviderPort;
import com.aiportfolio.backend.infrastructure.config.CloudUsageProperties;
import com.aiportfolio.backend.infrastructure.external.cloud.dto.CloudUsageApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

/**
 * 공통 HTTP 기반 클라우드 사용량 어댑터 구현입니다.
 */
@Slf4j
@RequiredArgsConstructor
public abstract class AbstractCloudUsageAdapter implements CloudUsageProviderPort {

    private final RestTemplate restTemplate;
    private final CloudUsageProperties properties;

    @Override
    public CloudUsageSnapshot fetchCurrentUsage() {
        CloudUsageProperties.ProviderProperties config = getProviderProperties();

        if (config == null || !config.isEnabled()) {
            return CloudUsageSnapshot.disabled(getProvider(), getProvider().name() + " usage integration disabled");
        }

        if (!StringUtils.hasText(config.getEndpoint())) {
            return CloudUsageSnapshot.unavailable(getProvider(), "Usage endpoint is not configured");
        }

        try {
            URI requestUri = buildUri(config);
            HttpEntity<Void> requestEntity = new HttpEntity<>(buildHeaders(config));
            ResponseEntity<CloudUsageApiResponse> response = restTemplate.exchange(
                requestUri,
                HttpMethod.GET,
                requestEntity,
                CloudUsageApiResponse.class
            );

            CloudUsageApiResponse body = response.getBody();
            if (body == null) {
                throw new IllegalStateException("Empty response from " + getProvider().name() + " usage API");
            }

            CloudUsageSnapshot snapshot = CloudUsageSnapshot.builder()
                .provider(getProvider())
                .status(Optional.ofNullable(body.getStatus()).map(CloudUsageStatus::from).orElse(CloudUsageStatus.UNAVAILABLE))
                .region(Optional.ofNullable(body.getRegion()).filter(StringUtils::hasText).orElse(config.getRegion()))
                .collectedAt(Optional.ofNullable(body.getCollectedAt()).orElse(Instant.now()))
                .message(body.getMessage())
                .metrics(body.toMetrics())
                .metadata(body.getMetadata())
                .build();

            return snapshot.withDefaults();
        } catch (Exception exception) {
            log.error("Failed to fetch usage metrics for provider {}", getProvider(), exception);
            return CloudUsageSnapshot.failure(getProvider(), exception.getMessage());
        }
    }

    @Override
    public abstract CloudProvider getProvider();

    protected abstract CloudUsageProperties.ProviderProperties getProviderProperties();

    protected CloudUsageProperties getProperties() {
        return properties;
    }

    private URI buildUri(CloudUsageProperties.ProviderProperties config) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(config.getEndpoint());
        Map<String, String> queryParams = config.getQuery();
        if (queryParams != null) {
            queryParams.forEach(builder::queryParam);
        }
        return builder.build().toUri();
    }

    private HttpHeaders buildHeaders(CloudUsageProperties.ProviderProperties config) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        if (StringUtils.hasText(config.getApiKey())) {
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + config.getApiKey());
        }

        Map<String, String> additionalHeaders = config.getHeaders();
        if (additionalHeaders != null) {
            additionalHeaders.forEach((key, value) -> {
                if (StringUtils.hasText(key) && StringUtils.hasText(value)) {
                    headers.set(key, value);
                }
            });
        }

        return headers;
    }
}
