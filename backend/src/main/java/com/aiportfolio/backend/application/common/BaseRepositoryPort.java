package com.aiportfolio.backend.application.common;

import java.util.List;
import java.util.Optional;

/**
 * 기본 Repository Port 인터페이스
 *
 * 모든 도메인 Repository Port의 공통 메서드를 정의합니다.
 *
 * @param <T> 도메인 엔티티 타입
 * @param <ID> ID 타입
 */
public interface BaseRepositoryPort<T, ID> {

    /**
     * 전체 조회
     */
    List<T> findAll();

    /**
     * ID로 조회
     */
    Optional<T> findById(ID id);

    /**
     * 저장 (생성/수정)
     */
    T save(T entity);

    /**
     * ID로 삭제
     */
    void deleteById(ID id);

    /**
     * 존재 여부 확인
     */
    boolean existsById(ID id);

    /**
     * 전체 개수
     */
    long count();
}
