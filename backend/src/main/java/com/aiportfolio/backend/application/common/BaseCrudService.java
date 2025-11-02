package com.aiportfolio.backend.application.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

/**
 * 기본 CRUD 서비스 추상 클래스
 *
 * 모든 도메인에 공통적인 CRUD 로직을 제공합니다.
 * 각 도메인 서비스는 이 클래스를 상속받아 필요한 부분만 구현/오버라이드합니다.
 *
 * @param <T> 도메인 엔티티 타입
 * @param <ID> ID 타입
 */
@Slf4j
@Transactional
public abstract class BaseCrudService<T, ID> {

    // ==================== 추상 메서드 (하위 클래스에서 구현 필수) ====================

    /**
     * Repository Port 반환
     */
    protected abstract BaseRepositoryPort<T, ID> getRepository();

    /**
     * 엔티티 이름 반환 (로깅용)
     */
    protected abstract String getEntityName();

    /**
     * 엔티티의 ID 추출
     */
    protected abstract ID getId(T entity);

    /**
     * 엔티티 ID 설정
     */
    protected abstract void setId(T entity, ID id);

    // ==================== 훅 메서드 (선택적 오버라이드) ====================

    /**
     * 생성 전 검증 (오버라이드 가능)
     */
    protected void validateForCreate(T entity) {
        // 기본 구현 없음 - 필요시 하위 클래스에서 구현
    }

    /**
     * 수정 전 검증 (오버라이드 가능)
     */
    protected void validateForUpdate(ID id, T entity) {
        // 기본 구현 없음 - 필요시 하위 클래스에서 구현
    }

    /**
     * 생성 전 처리 (오버라이드 가능)
     */
    protected void beforeCreate(T entity) {
        // 기본 구현 없음 - 필요시 하위 클래스에서 구현
    }

    /**
     * 수정 전 처리 (오버라이드 가능)
     */
    protected void beforeUpdate(ID id, T entity, T existing) {
        // 기본 구현 없음 - 필요시 하위 클래스에서 구현
    }

    /**
     * 생성 후 처리 (오버라이드 가능)
     */
    protected void afterCreate(T entity) {
        // 기본 구현 없음 - 필요시 하위 클래스에서 구현
    }

    /**
     * 수정 후 처리 (오버라이드 가능)
     */
    protected void afterUpdate(T entity) {
        // 기본 구현 없음 - 필요시 하위 클래스에서 구현
    }

    // ==================== 공통 CRUD 구현 ====================

    /**
     * 엔티티 생성 (템플릿 메서드)
     */
    public T create(T entity) {
        log.info("Creating new {}: {}", getEntityName(), describeEntity(entity));

        // 1. 생성 전 검증
        validateForCreate(entity);

        // 2. 생성 전 처리
        beforeCreate(entity);

        // 3. 저장
        T saved = getRepository().save(entity);

        // 4. 생성 후 처리
        afterCreate(saved);

        log.info("{} created successfully with ID: {}", getEntityName(), getId(saved));
        return saved;
    }

    /**
     * 엔티티 수정 (템플릿 메서드)
     */
    public T update(ID id, T entity) {
        log.info("Updating {}: {}", getEntityName(), id);

        // 1. 기존 엔티티 조회
        T existing = getRepository().findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                getEntityName() + " not found: " + id
            ));

        // 2. 수정 전 검증
        validateForUpdate(id, entity);

        // 3. ID 유지
        setId(entity, id);

        // 4. 수정 전 처리
        beforeUpdate(id, entity, existing);

        // 5. 저장
        T updated = getRepository().save(entity);

        // 6. 수정 후 처리
        afterUpdate(updated);

        log.info("{} updated successfully: {}", getEntityName(), id);
        return updated;
    }

    /**
     * 엔티티 삭제
     */
    public void delete(ID id) {
        log.info("Deleting {}: {}", getEntityName(), id);

        // 존재 여부 확인
        if (!getRepository().existsById(id)) {
            throw new IllegalArgumentException(
                getEntityName() + " not found: " + id
            );
        }

        // 삭제
        getRepository().deleteById(id);

        log.info("{} deleted successfully: {}", getEntityName(), id);
    }

    /**
     * 전체 조회
     */
    @Transactional(readOnly = true)
    public List<T> findAll() {
        log.debug("Fetching all {}", getEntityName() + "s");
        return getRepository().findAll();
    }

    /**
     * ID로 조회
     */
    @Transactional(readOnly = true)
    public Optional<T> findById(ID id) {
        log.debug("Fetching {} by id: {}", getEntityName(), id);
        return getRepository().findById(id);
    }

    /**
     * ID로 조회 (없으면 예외)
     */
    @Transactional(readOnly = true)
    public T getById(ID id) {
        return findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                getEntityName() + " not found: " + id
            ));
    }

    /**
     * 존재 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean exists(ID id) {
        return getRepository().existsById(id);
    }

    /**
     * 전체 개수
     */
    @Transactional(readOnly = true)
    public long count() {
        return getRepository().count();
    }

    // ==================== 유틸리티 메서드 ====================

    /**
     * 엔티티 설명 (로깅용, 오버라이드 가능)
     */
    protected String describeEntity(T entity) {
        return String.valueOf(entity);
    }

    /**
     * 조건부 업데이트 헬퍼
     */
    protected <V> void updateIfPresent(V value, Consumer<V> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }
}
