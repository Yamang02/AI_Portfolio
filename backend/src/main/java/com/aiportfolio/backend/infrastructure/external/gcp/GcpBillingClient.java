package com.aiportfolio.backend.infrastructure.external.gcp;

import com.google.cloud.bigquery.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * GCP BigQuery Billing 클라이언트
 * Mock 모드일 때는 비활성화 (cloud.gcp.mock.enabled=false일 때만 활성화)
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "cloud.gcp.mock.enabled", havingValue = "false", matchIfMissing = true)
public class GcpBillingClient {

    private final GcpConfig config;
    private final BigQuery bigQuery;
    // DATE_FORMAT은 향후 날짜 필터링 시 사용 예정
    // private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * BigQuery 클라이언트 초기화
     * 프로젝트 ID를 명시적으로 설정하여 Mock 모드가 아닐 때만 생성됨
     */
    public GcpBillingClient(GcpConfig config) {
        this.config = config;
        // 프로젝트 ID를 명시적으로 설정
        this.bigQuery = BigQueryOptions.newBuilder()
            .setProjectId(config.getProjectId())
            .build()
            .getService();
    }

    /**
     * BigQuery에서 비용 데이터 조회
     * 
     * 참고: _PARTITIONDATE 필터는 파티션 날짜와 실제 사용 날짜가 다를 수 있어
     * usage_start_time 기준으로 필터링하거나 WHERE 조건 없이 전체 조회합니다.
     * MVP 단계에서는 WHERE 조건 없이 전체 데이터 조회 (트러블슈팅 문서 참고)
     */
    public TableResult queryBillingData(LocalDate startDate, LocalDate endDate) {
        try {
            // MVP 단계: WHERE 조건 없이 전체 데이터 조회 (cost > 0만 필터링)
            // 이유: _PARTITIONDATE와 실제 사용 날짜가 불일치할 수 있고,
            // Billing Export가 불규칙하게 업데이트될 수 있음
            String query = String.format("""
                SELECT
                  service.description as service_name,
                  SUM(cost) as total_cost,
                  currency
                FROM `%s.%s.%s`
                WHERE cost > 0
                GROUP BY service_name, currency
                ORDER BY total_cost DESC
                """,
                config.getProjectId(),
                config.getBillingDataset(),
                config.getBillingTable()
            );
            
            // 향후 프로덕션 최적화 시 아래 쿼리 사용 가능:
            // WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
            //   AND DATE(usage_start_time) BETWEEN '%s' AND '%s'
            //   AND cost > 0

            QueryJobConfiguration queryConfig = QueryJobConfiguration
                .newBuilder(query)
                .setUseLegacySql(false)
                .build();

            JobId jobId = JobId.of(config.getProjectId());
            Job queryJob = bigQuery.create(JobInfo.newBuilder(queryConfig).setJobId(jobId).build());

            // 쿼리 완료 대기
            queryJob = queryJob.waitFor();

            if (queryJob == null) {
                throw new RuntimeException("Job no longer exists");
            }

            if (queryJob.getStatus().getError() != null) {
                throw new RuntimeException("Query job failed: " + queryJob.getStatus().getError());
            }

            return queryJob.getQueryResults();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("BigQuery query interrupted", e);
        } catch (Exception e) {
            log.error("Failed to query BigQuery billing data", e);
            throw new RuntimeException("Failed to query BigQuery billing data: " + e.getMessage(), e);
        }
    }
}

