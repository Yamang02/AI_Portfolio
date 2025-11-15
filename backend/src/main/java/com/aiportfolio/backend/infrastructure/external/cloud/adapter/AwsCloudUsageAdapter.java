package com.aiportfolio.backend.infrastructure.external.cloud.adapter;

import com.aiportfolio.backend.domain.admin.model.vo.CloudProvider;
import com.aiportfolio.backend.infrastructure.config.CloudUsageProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * AWS 사용량 조회 어댑터.
 */
@Component
public class AwsCloudUsageAdapter extends AbstractCloudUsageAdapter {

    public AwsCloudUsageAdapter(RestTemplate restTemplate, CloudUsageProperties properties) {
        super(restTemplate, properties);
    }

    @Override
    public CloudProvider getProvider() {
        return CloudProvider.AWS;
    }

    @Override
    protected CloudUsageProperties.ProviderProperties getProviderProperties() {
        return getProperties().getAws();
    }
}
