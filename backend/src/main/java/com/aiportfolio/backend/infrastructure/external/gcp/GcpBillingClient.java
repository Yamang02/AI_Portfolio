package com.aiportfolio.backend.infrastructure.external.gcp;

import com.google.cloud.bigquery.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

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
     * BigQuery에서 원본 행 데이터 샘플 조회 (디버깅용)
     * 실제 테이블의 모든 컬럼을 확인하기 위한 메서드
     */
    public TableResult queryRawBillingDataSample(LocalDate startDate, LocalDate endDate, int limit) {
        try {
            log.info("Querying RAW GCP billing data sample (first {} rows) from {} to {}", limit, startDate, endDate);
            
            // 원본 데이터 샘플 조회 (집계 없이)
            String query = String.format("""
                SELECT *
                FROM `%s.%s.%s`
                WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
                  AND DATE(usage_start_time) BETWEEN @start_date AND @end_date
                  AND cost > 0
                ORDER BY usage_start_time DESC
                LIMIT %d
                """,
                config.getProjectId(),
                config.getBillingDataset(),
                config.getBillingTable(),
                limit
            );
            
            log.info("Raw data query: {}", query);
            
            QueryParameterValue startDateParam = QueryParameterValue.date(startDate.toString());
            QueryParameterValue endDateParam = QueryParameterValue.date(endDate.toString());
            
            QueryJobConfiguration queryConfig = QueryJobConfiguration
                .newBuilder(query)
                .setUseLegacySql(false)
                .addNamedParameter("start_date", startDateParam)
                .addNamedParameter("end_date", endDateParam)
                .build();
            
            JobId jobId = JobId.of(config.getProjectId());
            Job queryJob = bigQuery.create(JobInfo.newBuilder(queryConfig).setJobId(jobId).build());
            queryJob = queryJob.waitFor();
            
            if (queryJob == null || queryJob.getStatus().getError() != null) {
                throw new RuntimeException("Query job failed");
            }
            
            TableResult result = queryJob.getQueryResults();
            log.info("Raw data query returned {} rows", result.getTotalRows());
            
            return result;
        } catch (Exception e) {
            log.error("Failed to query raw billing data", e);
            throw new RuntimeException("Failed to query raw billing data: " + e.getMessage(), e);
        }
    }

    /**
     * BigQuery에서 비용 데이터 조회 (집계된 결과)
     *
     * 참고: 
     * - _PARTITIONDATE 필터는 파티션 날짜와 실제 사용 날짜가 다를 수 있어
     *   usage_start_time 기준으로 필터링합니다.
     * - 파라미터화된 쿼리를 사용하여 SQL injection 방지
     * - 파티션 필터로 스캔 비용 최적화
     * - 집계된 결과만 반환 (서비스별 총 비용)
     */
    public TableResult queryBillingData(LocalDate startDate, LocalDate endDate) {
        try {
            log.info("Querying GCP billing data from {} to {}", startDate, endDate);

            // 파라미터화된 쿼리 사용 (SQL injection 방지)
            // 참고: BigQuery billing export 테이블의 전체 스키마를 활용
            // 주요 필드: billing_account_id, service, sku, usage_start_time, usage_end_time,
            //           project, labels, location, price, cost, currency, usage, credits 등
            String query = String.format("""
                SELECT
                  service.description as service_name,
                  SUM(cost) as total_cost,
                  currency,
                  COUNT(*) as record_count,
                  MIN(usage_start_time) as first_usage_time,
                  MAX(usage_end_time) as last_usage_time
                FROM `%s.%s.%s`
                WHERE _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
                  AND DATE(usage_start_time) BETWEEN @start_date AND @end_date
                  AND cost > 0
                GROUP BY service_name, currency
                ORDER BY total_cost DESC
                """,
                config.getProjectId(),
                config.getBillingDataset(),
                config.getBillingTable()
            );

            log.info("Executing BigQuery query: project={}, dataset={}, table={}, startDate={}, endDate={}", 
                    config.getProjectId(), config.getBillingDataset(), config.getBillingTable(), startDate, endDate);
            log.debug("Query SQL: {}", query);

            // 파라미터 설정
            QueryParameterValue startDateParam = QueryParameterValue.date(startDate.toString());
            QueryParameterValue endDateParam = QueryParameterValue.date(endDate.toString());

            QueryJobConfiguration queryConfig = QueryJobConfiguration
                .newBuilder(query)
                .setUseLegacySql(false)
                .addNamedParameter("start_date", startDateParam)
                .addNamedParameter("end_date", endDateParam)
                .build();

            JobId jobId = JobId.of(config.getProjectId());
            Job queryJob = bigQuery.create(JobInfo.newBuilder(queryConfig).setJobId(jobId).build());

            // 쿼리 완료 대기
            queryJob = queryJob.waitFor();

            if (queryJob == null) {
                log.error("BigQuery job no longer exists");
                throw new RuntimeException("Job no longer exists");
            }

            if (queryJob.getStatus().getError() != null) {
                log.error("BigQuery job failed: {}", queryJob.getStatus().getError());
                throw new RuntimeException("Query job failed: " + queryJob.getStatus().getError());
            }

            TableResult result = queryJob.getQueryResults();
            long totalRows = result.getTotalRows();
            log.info("Successfully queried {} rows from GCP billing data (project={}, dataset={}, table={}, period={} to {})", 
                    totalRows, config.getProjectId(), config.getBillingDataset(), config.getBillingTable(), startDate, endDate);
            
            // 집계된 쿼리 결과 로깅 (현재 쿼리는 집계된 결과만 반환)
            logQueryResult(result, "Aggregated Query Result");
            
            // 원본 데이터 샘플도 조회하여 실제 테이블 구조 확인
            try {
                log.info("=== Fetching RAW data sample to see actual table structure ===");
                TableResult rawSample = queryRawBillingDataSample(startDate, endDate, 3);
                logQueryResult(rawSample, "RAW Table Data Sample (SELECT *)");
            } catch (Exception e) {
                log.warn("Failed to fetch raw data sample: {}", e.getMessage());
            }

            return result;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("BigQuery query interrupted", e);
            throw new RuntimeException("BigQuery query interrupted", e);
        } catch (Exception e) {
            log.error("Failed to query BigQuery billing data: project={}, dataset={}, table={}",
                     config.getProjectId(), config.getBillingDataset(), config.getBillingTable(), e);
            throw new RuntimeException("Failed to query BigQuery billing data: " + e.getMessage(), e);
        }
    }

    /**
     * BigQuery 쿼리 결과를 상세하게 로깅
     */
    private void logQueryResult(TableResult result, String title) {
        if (result.getTotalRows() == 0) {
            log.warn("{}: No rows returned", title);
            return;
        }
        
        Schema schema = result.getSchema();
        
        // 스키마 정보 로깅
        if (schema != null && schema.getFields() != null) {
            log.info("=== {} Schema ===", title);
            for (Field field : schema.getFields()) {
                String mode = field.getMode() != null ? field.getMode().name() : "NULLABLE";
                log.info("  Field: {} | Type: {} | Mode: {}", field.getName(), field.getType(), mode);
                
                // RECORD 타입인 경우 중첩 필드도 표시
                if (field.getType().getStandardType() == StandardSQLTypeName.STRUCT && field.getSubFields() != null) {
                    for (Field subField : field.getSubFields()) {
                        log.info("    -> {}: {} ({})", subField.getName(), subField.getType(), subField.getMode());
                    }
                }
            }
        }
        
        // 데이터 샘플 로깅 (최대 3개 행)
        int sampleCount = 0;
        log.info("=== {} Data Sample (first 3 rows) ===", title);
        for (FieldValueList row : result.iterateAll()) {
            if (sampleCount >= 3) break;
            try {
                logRowData(row, schema, sampleCount + 1);
                sampleCount++;
            } catch (Exception e) {
                log.warn("Failed to log row {}: {}", sampleCount + 1, e.getMessage());
            }
        }
        log.info("=== End of {} ===", title);
    }

    /**
     * 행 데이터를 상세하게 로깅 (RECORD 타입 필드 포함)
     */
    private void logRowData(FieldValueList row, Schema schema, int rowNum) {
        StringBuilder rowData = new StringBuilder(String.format("Row[%d]: {", rowNum));
        
        if (schema != null && schema.getFields() != null) {
            for (Field field : schema.getFields()) {
                String fieldName = field.getName();
                FieldValue fieldValue = row.get(fieldName);
                
                if (fieldValue == null || fieldValue.isNull()) {
                    rowData.append(String.format("\"%s\": null, ", fieldName));
                    continue;
                }
                
                try {
                    String valueStr = extractFieldValue(fieldValue, field);
                    rowData.append(String.format("\"%s\": %s, ", fieldName, valueStr));
                } catch (Exception e) {
                    rowData.append(String.format("\"%s\": <error: %s>, ", fieldName, e.getMessage()));
                }
            }
        }
        
        rowData.append("}");
        log.info(rowData.toString());
    }

    /**
     * FieldValue에서 값을 추출 (RECORD, REPEATED 타입 처리 포함)
     */
    private String extractFieldValue(FieldValue fieldValue, Field field) {
        if (fieldValue.isNull()) {
            return "null";
        }
        
        try {
            StandardSQLTypeName type = field.getType().getStandardType();
            
            // RECORD (STRUCT) 타입 처리
            if (type == StandardSQLTypeName.STRUCT) {
                StringBuilder structValue = new StringBuilder("{");
                List<Field> subFields = field.getSubFields();
                if (subFields != null) {
                    for (Field subField : subFields) {
                        FieldValue subValue = fieldValue.getRecordValue().get(subField.getName());
                        String subValueStr = subValue != null && !subValue.isNull() 
                            ? extractFieldValue(subValue, subField)
                            : "null";
                        structValue.append(String.format("\"%s\": %s, ", subField.getName(), subValueStr));
                    }
                }
                structValue.append("}");
                return structValue.toString();
            }
            
            // REPEATED (ARRAY) 타입 처리
            if (field.getMode() == Field.Mode.REPEATED) {
                StringBuilder arrayValue = new StringBuilder("[");
                int count = 0;
                for (FieldValue arrayItem : fieldValue.getRepeatedValue()) {
                    if (count >= 3) { // 최대 3개만 표시
                        arrayValue.append("...");
                        break;
                    }
                    String itemStr = arrayItem.isNull() ? "null" : extractFieldValue(arrayItem, field);
                    arrayValue.append(itemStr).append(", ");
                    count++;
                }
                arrayValue.append("]");
                return arrayValue.toString();
            }
            
            // 기본 타입 처리
            switch (type) {
                case STRING:
                    return "\"" + fieldValue.getStringValue() + "\"";
                case FLOAT64:
                case NUMERIC:
                    return String.valueOf(fieldValue.getDoubleValue());
                case INT64:
                    return Long.toString(fieldValue.getLongValue());
                case BOOL:
                    return String.valueOf(fieldValue.getBooleanValue());
                case TIMESTAMP:
                    return "\"" + String.valueOf(fieldValue.getTimestampValue()) + "\"";
                case DATE:
                    return "\"" + fieldValue.getStringValue() + "\"";
                default:
                    return fieldValue.getValue() != null ? fieldValue.getValue().toString() : "null";
            }
        } catch (Exception e) {
            return "<error: " + e.getMessage() + ">";
        }
    }
}

