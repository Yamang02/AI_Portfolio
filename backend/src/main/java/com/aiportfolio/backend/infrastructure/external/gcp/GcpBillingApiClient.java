package com.aiportfolio.backend.infrastructure.external.gcp;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.billing.v1.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.time.LocalDate;
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
@ConditionalOnProperty(name = "cloud.gcp.mock.enabled", havingValue = "false", matchIfMissing = true)
@org.springframework.context.annotation.Lazy
public class GcpBillingApiClient {

    private final GcpConfig config;
    private CloudBillingClient billingClient;

    public GcpBillingApiClient(GcpConfig config) {
        this.config = config;
        // Lazy initialization: 클라이언트는 첫 사용 시점에 초기화
    }

    /**
     * Cloud Billing API 클라이언트 초기화 (Lazy)
     */
    private synchronized CloudBillingClient getBillingClient() {
        if (billingClient == null) {
            try {
                log.info("Initializing Google Cloud Billing API client for project: {}", config.getProjectId());
                
                // Cloud Billing API 스코프
                String billingScope = "https://www.googleapis.com/auth/cloud-billing";
                
                if (config.getCredentialsPath() != null && !config.getCredentialsPath().isEmpty()) {
                    // 서비스 계정 키 파일 사용
                    GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(config.getCredentialsPath()))
                            .createScoped(billingScope);
                    
                    billingClient = CloudBillingClient.create(
                        CloudBillingSettings.newBuilder()
                            .setCredentialsProvider(() -> credentials)
                            .build()
                    );
                } else {
                    // Application Default Credentials 사용 (자동으로 인증 처리)
                    billingClient = CloudBillingClient.create();
                }
            } catch (IOException e) {
                log.error("Failed to initialize Cloud Billing API client", e);
                throw new RuntimeException("Failed to initialize Cloud Billing API client: " + e.getMessage(), e);
            }
        }
        return billingClient;
    }

    /**
     * 프로젝트의 청구 정보 조회
     * GET /v1/{name=projects/*}/billingInfo
     */
    public ProjectBillingInfo getProjectBillingInfo() {
        try {
            String projectName = "projects/" + config.getProjectId();
            log.debug("Fetching billing info for project: {}", projectName);
            
            return getBillingClient().getProjectBillingInfo(projectName);
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
        log.debug("GcpBillingApiClient closed");
    }
}






