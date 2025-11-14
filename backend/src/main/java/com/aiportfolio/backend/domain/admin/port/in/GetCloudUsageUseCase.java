package com.aiportfolio.backend.domain.admin.port.in;

import com.aiportfolio.backend.domain.admin.dto.response.CloudUsageDashboardResponse;

/**
 * 클라우드 사용량 정보를 조회하는 유스케이스입니다.
 */
public interface GetCloudUsageUseCase {

    /**
     * AWS, GCP 등 활성화된 모든 공급자의 실시간 사용량을 조회합니다.
     *
     * @return 대시보드 표시용 사용량 요약
     */
    CloudUsageDashboardResponse getRealTimeUsage();
}
