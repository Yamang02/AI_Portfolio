package com.aiportfolio.backend.domain.admin.port.out;

import com.aiportfolio.backend.infrastructure.web.admin.dto.CloudUsageSnapshot;
import com.aiportfolio.backend.domain.admin.model.vo.CloudProvider;

/**
 * 외부 클라우드 사용량 데이터를 가져오는 포트입니다.
 */
public interface CloudUsageProviderPort {

    /**
     * 포트가 담당하는 클라우드 공급자를 반환합니다.
     *
     * @return {@link CloudProvider}
     */
    CloudProvider getProvider();

    /**
     * 현재 시점의 사용량 정보를 조회합니다.
     *
     * @return 사용량 스냅샷
     */
    CloudUsageSnapshot fetchCurrentUsage();
}
