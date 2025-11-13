package com.aiportfolio.backend.domain.admin.port.out;

import java.util.Map;
import java.util.Set;

/**
 * 캐시 관리 포트 인터페이스
 * Redis 캐시 관리 기능을 정의합니다.
 */
public interface CacheManagementPort {

    /**
     * 모든 캐시를 초기화합니다.
     */
    void flushAll();

    /**
     * 특정 패턴의 캐시를 삭제합니다.
     *
     * @param pattern 삭제할 캐시 패턴
     */
    void evictByPattern(String pattern);

    /**
     * 특정 캐시를 삭제합니다.
     *
     * @param cacheName 캐시 이름
     * @param key 캐시 키
     */
    void evict(String cacheName, String key);

    /**
     * 캐시 통계를 조회합니다.
     *
     * @return 캐시 통계 정보
     */
    Map<String, Object> getStatistics();

    /**
     * 캐시 키 개수를 조회합니다.
     *
     * @param pattern 조회할 패턴
     * @return 키 개수
     */
    long getKeyCount(String pattern);

    /**
     * 캐시 상태를 확인합니다.
     *
     * @return 캐시 상태 정보
     */
    Map<String, Object> getCacheStatus();

    /**
     * 특정 패턴과 일치하는 캐시 키 목록을 조회합니다.
     *
     * @param pattern 조회할 캐시 키 패턴
     * @return 일치하는 캐시 키 목록
     */
    Set<String> getKeysByPattern(String pattern);

    /**
     * 특정 키의 값을 조회합니다.
     *
     * @param key 조회할 키
     * @return 키에 저장된 값
     */
    String getValue(String key);

    /**
     * 특정 키에 값을 저장합니다.
     *
     * @param key 저장할 키
     * @param value 저장할 값
     */
    void setValue(String key, String value);
}
