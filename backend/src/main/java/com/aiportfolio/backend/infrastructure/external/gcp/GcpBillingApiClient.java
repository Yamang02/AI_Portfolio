package com.aiportfolio.backend.infrastructure.external.gcp;

import com.google.api.services.cloudbilling.v1.CloudBilling;
import com.google.api.services.cloudbilling.v1.CloudBillingScopes;
import com.google.api.services.cloudbilling.v1.model.ProjectBillingInfo;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.billing.v1.*;
import com.google.protobuf.Timestamp;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

/**
 * Google Cloud Billing API 클라이언트
 * Cloud Billing API v1을 사용하여 비용 데이터를 조회합니다.
 * 
 * 참고: https://docs.cloud.google.com/billing/docs/reference/rest
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "cloud.gcp.use-billing-api", havingValue = "true", matchIfMissing = true)
public class GcpBillingApiClient {

    private final GcpConfig config;
    private final CloudBillingServiceClient billingClient;

    public GcpBillingApiClient(GcpConfig config) throws IOException {
        this.config = config;
        this.billingClient = initializeBillingClient();
    }

    /**
     * Cloud Billing API 클라이언트 초기화
     */
    private CloudBillingServiceClient initializeBillingClient() throws IOException {
        log.info("Initializing Google Cloud Billing API client for project: {}", config.getProjectId());
        
        GoogleCredentials credentials;
        if (config.getCredentialsPath() != null && !config.getCredentialsPath().isEmpty()) {
            credentials = GoogleCredentials.fromStream(new FileInputStream(config.getCredentialsPath()))
                    .createScoped(CloudBillingServiceClient.getServiceScopes());
        } else {
            // Application Default Credentials 사용
            credentials = GoogleCredentials.getApplicationDefault()
                    .createScoped(CloudBillingServiceClient.getServiceScopes());
        }

        return CloudBillingServiceClient.create(
            CloudBillingServiceSettings.newBuilder()
                .setCredentialsProvider(() -> credentials)
                .build()
        );
    }

    /**
     * 프로젝트의 청구 정보 조회
     * GET /v1/{name=projects/*}/billingInfo
     */
    public ProjectBillingInfo getProjectBillingInfo() {
        try {
            String projectName = "projects/" + config.getProjectId();
            log.debug("Fetching billing info for project: {}", projectName);
            
            // REST API를 사용하기 위해 CloudBilling 클라이언트 사용
            // (gRPC 클라이언트는 프로젝트 청구 정보 조회에 제한적)
            return null; // TODO: REST API 클라이언트 구현 필요
        } catch (Exception e) {
            log.error("Failed to get project billing info", e);
            throw new RuntimeException("Failed to get project billing info: " + e.getMessage(), e);
        }
    }

    /**
     * 청구 계정 목록 조회
     * GET /v1/billingAccounts
     */
    public List<String> listBillingAccounts() {
        try {
            log.debug("Listing billing accounts");
            // TODO: REST API를 통한 구현 필요
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Failed to list billing accounts", e);
            throw new RuntimeException("Failed to list billing accounts: " + e.getMessage(), e);
        }
    }

    /**
     * 비용 데이터 조회 (BigQuery Export를 통한 방식)
     * 
     * 참고: Cloud Billing API는 직접적인 비용 조회 기능이 제한적이므로,
     * Cloud Billing Budget API나 BigQuery Export를 사용하는 것이 일반적입니다.
     * 
     * 이 메서드는 향후 Cloud Cost Management API나 다른 방법으로 확장 가능합니다.
     */
    public void queryBillingData(LocalDate startDate, LocalDate endDate) {
        log.warn("Direct cost query via Billing API is limited. Consider using BigQuery Export or Cloud Cost Management API.");
        // Cloud Billing API는 주로 청구 계정 관리에 사용되며,
        // 실제 비용 데이터는 BigQuery Export를 통해 조회하는 것이 일반적입니다.
    }

    /**
     * 리소스 정리
     */
    public void close() {
        if (billingClient != null) {
            billingClient.close();
        }
    }
}






