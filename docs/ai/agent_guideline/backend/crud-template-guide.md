# 백엔드 CRUD 템플릿 가이드

**작성일**: 2025-10-25  
**목적**: Hexagonal Architecture 기반 CRUD 템플릿 제공  
**대상**: 백엔드 개발자

---

## 📋 목차

1. [개요](#개요)
2. [템플릿 패턴](#템플릿-패턴)
3. [디렉토리 구조](#디렉토리-구조)
4. [적용 가이드라인](#적용-가이드라인)
5. [마이그레이션 체크리스트](#마이그레이션-체크리스트)

---

## 개요

### Hexagonal Architecture 계층 구조

**백엔드 (Hexagonal Architecture)**:
- ✅ **Domain Layer**: 순수 도메인 모델, UseCase 인터페이스, Repository Port
- ✅ **Application Layer**: UseCase 구현체, 트랜잭션 관리
- ✅ **Infrastructure Layer**: JPA Entity, Mapper, Adapter, Controller

### 템플릿화 가능한 요소

| 계층 | 템플릿화 가능 | 템플릿화 불가능 (도메인별 커스텀) |
|------|-------------|------------------------------|
| **Backend** | - UseCase 인터페이스 구조<br>- Service 기본 구조<br>- Repository Port 패턴<br>- Adapter 구조<br>- Controller 기본 구조<br>- Mapper 패턴 | - 도메인 모델 필드<br>- 비즈니스 규칙<br>- 검증 로직<br>- 도메인별 쿼리 메서드 |

---

## 템플릿 패턴

### 1. Domain Layer 템플릿

#### 1.1 도메인 모델 (`{Entity}.java`)

```java
// Template: domain/{도메인}/model/{Entity}.java
package com.aiportfolio.backend.domain.{도메인}.model;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * {Entity} 도메인 모델
 *
 * 역할: {Entity}의 핵심 비즈니스 개념과 규칙을 표현
 * 의존성: 순수 Java + Validation API만 허용
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class {Entity} {

    // === 식별자 ===
    private {IdType} id;  // String, Long, UUID 등

    // === 필수 필드 ===
    @NotBlank(message = "{필드명}은 필수입니다")
    private String {필수필드};

    // === 선택 필드 ===
    private String {선택필드};

    // === 상태 필드 ===
    @NotNull
    private Boolean isActive;

    // === 메타데이터 ===
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // === 비즈니스 메서드 (도메인 로직) ===

    /**
     * {설명}
     */
    public boolean is{상태체크}() {
        return this.{필드} == {조건};
    }

    /**
     * {Entity} 생성 팩토리 메서드
     */
    public static {Entity} create({파라미터들}) {
        return {Entity}.builder()
            .{필드}({값})
            .build();
    }

    /**
     * 업데이트 메서드
     */
    public void update({UpdateRequest} request) {
        if (request.get{필드}() != null) {
            this.{필드} = request.get{필드}();
        }
        // 검증 로직 포함 가능
    }
}
```

#### 1.2 UseCase 인터페이스 (Port In)

**패턴 1: 관리 UseCase (CUD 작업)**
```java
// Template: domain/{도메인}/port/in/Manage{Entity}UseCase.java
package com.aiportfolio.backend.domain.{도메인}.port.in;

import com.aiportfolio.backend.domain.{도메인}.model.{Entity};

/**
 * {Entity} 관리 UseCase
 *
 * 책임: {Entity}의 생성, 수정, 삭제 작업 정의
 */
public interface Manage{Entity}UseCase {

    /**
     * {Entity} 생성
     */
    {Entity} create{Entity}({Entity} {entity});

    /**
     * {Entity} 수정
     */
    {Entity} update{Entity}({IdType} id, {Entity} {entity});

    /**
     * {Entity} 삭제
     */
    void delete{Entity}({IdType} id);

    /**
     * {Entity} 상태 토글 (선택적)
     */
    {Entity} toggle{Entity}Status({IdType} id);
}
```

**패턴 2: 조회 UseCase (R 작업)**
```java
// Template: domain/{도메인}/port/in/Get{Entity}UseCase.java
package com.aiportfolio.backend.domain.{도메인}.port.in;

import com.aiportfolio.backend.domain.{도메인}.model.{Entity};
import java.util.List;
import java.util.Optional;

/**
 * {Entity} 조회 UseCase (CQRS Query)
 *
 * 책임: {Entity}의 조회 작업 정의
 */
public interface Get{Entity}UseCase {

    /**
     * 전체 {Entity} 조회
     */
    List<{Entity}> getAll{Entities}();

    /**
     * 활성화된 {Entity}만 조회
     */
    List<{Entity}> getAllActive{Entities}();

    /**
     * ID로 {Entity} 조회
     */
    Optional<{Entity}> get{Entity}ById({IdType} id);

    /**
     * 조건별 조회 (도메인별 커스텀)
     */
    List<{Entity}> get{Entities}By{조건}({조건타입} {조건});

    /**
     * 검색
     */
    List<{Entity}> search{Entities}(String keyword);
}
```

#### 1.3 Repository Port (Port Out)

```java
// Template: domain/{도메인}/port/out/{Entity}RepositoryPort.java
package com.aiportfolio.backend.domain.{도메인}.port.out;

import com.aiportfolio.backend.domain.{도메인}.model.{Entity};
import java.util.List;
import java.util.Optional;

/**
 * {Entity} Repository Port
 *
 * 책임: {Entity} 영속성 작업 인터페이스 정의
 */
public interface {Entity}RepositoryPort {

    // === 조회 메서드 ===
    List<{Entity}> findAll();
    List<{Entity}> findAllActive();
    Optional<{Entity}> findById({IdType} id);
    List<{Entity}> findBy{조건}({조건타입} {조건});
    List<{Entity}> findByKeyword(String keyword);

    // === 저장 메서드 ===
    {Entity} save({Entity} {entity});
    List<{Entity}> saveAll(List<{Entity}> {entities});
    {Entity} updateById({IdType} id, {Entity} {entity});

    // === 삭제 메서드 ===
    void deleteById({IdType} id);

    // === 유틸리티 메서드 ===
    boolean existsById({IdType} id);
    long count();
}
```

#### 1.4 Domain Service (복잡한 비즈니스 로직)

```java
// Template: domain/{도메인}/service/{Entity}DomainService.java
package com.aiportfolio.backend.domain.{도메인}.service;

import com.aiportfolio.backend.domain.{도메인}.model.{Entity};
import com.aiportfolio.backend.domain.{도메인}.port.out.{Entity}RepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * {Entity} 도메인 서비스
 *
 * 책임: 여러 도메인 객체를 조율하거나 복잡한 비즈니스 규칙 검증
 */
@Service
@RequiredArgsConstructor
public class {Entity}DomainService {

    private final {Entity}RepositoryPort {entity}RepositoryPort;

    /**
     * 생성 전 검증
     */
    public void validateForCreation({Entity} {entity}) {
        // 고유성 검증
        validateUniqueness({entity});

        // 필수값 검증
        validateRequiredFields({entity});

        // 비즈니스 규칙 검증
        validateBusinessRules({entity});
    }

    /**
     * 수정 전 검증
     */
    public void validateForUpdate({IdType} id, {Entity} {entity}) {
        // 존재 여부 확인
        if (!{entity}RepositoryPort.existsById(id)) {
            throw new IllegalArgumentException("{Entity}를 찾을 수 없습니다: " + id);
        }

        // 변경 가능 여부 검증
        validateUpdatePermission(id, {entity});
    }

    private void validateUniqueness({Entity} {entity}) {
        // 도메인별 고유성 검증 로직
    }

    private void validateRequiredFields({Entity} {entity}) {
        // 도메인별 필수값 검증 로직
    }

    private void validateBusinessRules({Entity} {entity}) {
        // 도메인별 비즈니스 규칙 검증
    }

    private void validateUpdatePermission({IdType} id, {Entity} {entity}) {
        // 수정 권한 검증
    }
}
```

---

### 2. Application Layer 템플릿

#### 2.1 관리 Service (CUD 작업)

```java
// Template: application/{도메인}/Manage{Entity}Service.java
package com.aiportfolio.backend.application.{도메인};

import com.aiportfolio.backend.domain.{도메인}.model.{Entity};
import com.aiportfolio.backend.domain.{도메인}.port.in.Manage{Entity}UseCase;
import com.aiportfolio.backend.domain.{도메인}.port.out.{Entity}RepositoryPort;
import com.aiportfolio.backend.domain.{도메인}.service.{Entity}DomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {Entity} 관리 서비스
 *
 * 책임: {Entity} 생성/수정/삭제 UseCase 구현
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class Manage{Entity}Service implements Manage{Entity}UseCase {

    private final {Entity}RepositoryPort {entity}RepositoryPort;
    private final {Entity}DomainService {entity}DomainService;

    @Override
    public {Entity} create{Entity}({Entity} {entity}) {
        log.info("Creating new {entity}: {}", {entity}.get{식별필드}());

        // 1. 검증
        {entity}DomainService.validateForCreation({entity});

        // 2. 저장
        {Entity} saved = {entity}RepositoryPort.save({entity});

        log.info("{Entity} created successfully: {}", saved.getId());
        return saved;
    }

    @Override
    public {Entity} update{Entity}({IdType} id, {Entity} {entity}) {
        log.info("Updating {entity}: {}", id);

        // 1. 검증
        {entity}DomainService.validateForUpdate(id, {entity});

        // 2. 수정
        {Entity} updated = {entity}RepositoryPort.updateById(id, {entity});

        log.info("{Entity} updated successfully: {}", updated.getId());
        return updated;
    }

    @Override
    public void delete{Entity}({IdType} id) {
        log.info("Deleting {entity}: {}", id);

        // 1. 존재 여부 확인
        if (!{entity}RepositoryPort.existsById(id)) {
            throw new IllegalArgumentException("{Entity}를 찾을 수 없습니다: " + id);
        }

        // 2. 삭제
        {entity}RepositoryPort.deleteById(id);

        log.info("{Entity} deleted successfully: {}", id);
    }

    @Override
    public {Entity} toggle{Entity}Status({IdType} id) {
        log.info("Toggling {entity} status: {}", id);

        {Entity} {entity} = {entity}RepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("{Entity}를 찾을 수 없습니다: " + id));

        // 상태 토글
        {Entity} toggled = {Entity}.builder()
            .id({entity}.getId())
            .isActive(!{entity}.getIsActive())
            // 다른 필드 복사
            .build();

        return {entity}RepositoryPort.save(toggled);
    }
}
```

#### 2.2 조회 Service (R 작업)

```java
// Template: application/{도메인}/Get{Entity}Service.java
package com.aiportfolio.backend.application.{도메인};

import com.aiportfolio.backend.domain.{도메인}.model.{Entity};
import com.aiportfolio.backend.domain.{도메인}.port.in.Get{Entity}UseCase;
import com.aiportfolio.backend.domain.{도메인}.port.out.{Entity}RepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * {Entity} 조회 서비스
 *
 * 책임: {Entity} 조회 UseCase 구현
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class Get{Entity}Service implements Get{Entity}UseCase {

    private final {Entity}RepositoryPort {entity}RepositoryPort;

    @Override
    public List<{Entity}> getAll{Entities}() {
        log.debug("Fetching all {entities}");
        return {entity}RepositoryPort.findAll();
    }

    @Override
    public List<{Entity}> getAllActive{Entities}() {
        log.debug("Fetching all active {entities}");
        return {entity}RepositoryPort.findAllActive();
    }

    @Override
    public Optional<{Entity}> get{Entity}ById({IdType} id) {
        log.debug("Fetching {entity} by id: {}", id);
        return {entity}RepositoryPort.findById(id);
    }

    @Override
    public List<{Entity}> get{Entities}By{조건}({조건타입} {조건}) {
        log.debug("Fetching {entities} by {조건}: {}", {조건});
        return {entity}RepositoryPort.findBy{조건}({조건});
    }

    @Override
    public List<{Entity}> search{Entities}(String keyword) {
        log.debug("Searching {entities} with keyword: {}", keyword);
        return {entity}RepositoryPort.findByKeyword(keyword);
    }
}
```

---

### 3. Infrastructure Layer 템플릿

#### 3.1 JPA Entity

```java
// Template: infrastructure/persistence/postgres/entity/{Entity}JpaEntity.java
package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * {Entity} JPA 엔티티
 *
 * 역할: PostgreSQL 테이블과 매핑
 */
@Entity
@Table(name = "{table_name}")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class {Entity}JpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.{전략})  // IDENTITY, UUID, AUTO 등
    private {IdType} id;

    @Column(name = "{column_name}", nullable = false, unique = true)
    private String {필드};

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at", updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    // 연관관계 (선택적)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "{fk_column_name}")
    private {Related}JpaEntity {related};
}
```

#### 3.2 JPA Repository

```java
// Template: infrastructure/persistence/postgres/repository/{Entity}JpaRepository.java
package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.{Entity}JpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * {Entity} JPA Repository
 *
 * 역할: Spring Data JPA를 통한 DB 접근
 */
@Repository
public interface {Entity}JpaRepository extends JpaRepository<{Entity}JpaEntity, {IdType}> {

    // 메서드 쿼리 (Spring Data JPA 자동 구현)
    List<{Entity}JpaEntity> findByIsActiveTrueOrderBy{정렬필드}Asc();

    Optional<{Entity}JpaEntity> findBy{유니크필드}(String {유니크필드});

    boolean existsBy{유니크필드}(String {유니크필드});

    List<{Entity}JpaEntity> findBy{조건필드}({조건타입} {조건필드});

    // 커스텀 쿼리 (@Query)
    @Query("SELECT e FROM {Entity}JpaEntity e WHERE e.{필드} LIKE %:keyword%")
    List<{Entity}JpaEntity> searchByKeyword(String keyword);

    @Query("SELECT COUNT(e) FROM {Entity}JpaEntity e WHERE e.isActive = true")
    long countActive();
}
```

#### 3.3 Mapper (Entity ↔ Domain)

```java
// Template: infrastructure/persistence/postgres/mapper/{Entity}Mapper.java
package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

import com.aiportfolio.backend.domain.{도메인}.model.{Entity};
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.{Entity}JpaEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * {Entity} 매퍼
 *
 * 책임: JPA Entity ↔ Domain Model 변환
 */
@Component
public class {Entity}Mapper {

    /**
     * JPA Entity → Domain Model
     */
    public {Entity} toDomain({Entity}JpaEntity entity) {
        if (entity == null) {
            return null;
        }

        return {Entity}.builder()
            .id(entity.getId())
            .{필드}(entity.get{필드}())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    /**
     * Domain Model → JPA Entity
     */
    public {Entity}JpaEntity toEntity({Entity} domain) {
        if (domain == null) {
            return null;
        }

        return {Entity}JpaEntity.builder()
            .id(domain.getId())
            .{필드}(domain.get{필드}())
            .isActive(domain.getIsActive())
            .createdAt(domain.getCreatedAt())
            .updatedAt(domain.getUpdatedAt())
            .build();
    }

    /**
     * List 변환: JPA Entity → Domain Model
     */
    public List<{Entity}> toDomainList(List<{Entity}JpaEntity> entities) {
        return entities.stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }

    /**
     * List 변환: Domain Model → JPA Entity
     */
    public List<{Entity}JpaEntity> toEntityList(List<{Entity}> domains) {
        return domains.stream()
            .map(this::toEntity)
            .collect(Collectors.toList());
    }
}
```

#### 3.4 Repository Adapter (Port 구현)

```java
// Template: infrastructure/persistence/postgres/adapter/{Entity}RepositoryAdapter.java
package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.{도메인}.model.{Entity};
import com.aiportfolio.backend.domain.{도메인}.port.out.{Entity}RepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.{Entity}JpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.{Entity}Mapper;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.{Entity}JpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * {Entity} Repository Adapter
 *
 * 책임: {Entity}RepositoryPort 구현 (Hexagonal Architecture Adapter)
 */
@Component
@RequiredArgsConstructor
public class {Entity}RepositoryAdapter implements {Entity}RepositoryPort {

    private final {Entity}JpaRepository jpaRepository;
    private final {Entity}Mapper mapper;

    @Override
    public List<{Entity}> findAll() {
        return mapper.toDomainList(jpaRepository.findAll());
    }

    @Override
    public List<{Entity}> findAllActive() {
        return mapper.toDomainList(jpaRepository.findByIsActiveTrueOrderBy{정렬필드}Asc());
    }

    @Override
    public Optional<{Entity}> findById({IdType} id) {
        return jpaRepository.findById(id)
            .map(mapper::toDomain);
    }

    @Override
    public List<{Entity}> findBy{조건}({조건타입} {조건}) {
        return mapper.toDomainList(jpaRepository.findBy{조건}({조건}));
    }

    @Override
    public List<{Entity}> findByKeyword(String keyword) {
        return mapper.toDomainList(jpaRepository.searchByKeyword(keyword));
    }

    @Override
    public {Entity} save({Entity} {entity}) {
        {Entity}JpaEntity jpaEntity = mapper.toEntity({entity});
        {Entity}JpaEntity saved = jpaRepository.save(jpaEntity);
        return mapper.toDomain(saved);
    }

    @Override
    public List<{Entity}> saveAll(List<{Entity}> {entities}) {
        List<{Entity}JpaEntity> jpaEntities = mapper.toEntityList({entities});
        List<{Entity}JpaEntity> saved = jpaRepository.saveAll(jpaEntities);
        return mapper.toDomainList(saved);
    }

    @Override
    public {Entity} updateById({IdType} id, {Entity} {entity}) {
        {Entity}JpaEntity existing = jpaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("{Entity}를 찾을 수 없습니다: " + id));

        // 필드 업데이트 (ID 제외)
        existing.set{필드}({entity}.get{필드}());
        existing.setIsActive({entity}.getIsActive());

        {Entity}JpaEntity saved = jpaRepository.save(existing);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById({IdType} id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existsById({IdType} id) {
        return jpaRepository.existsById(id);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }
}
```

#### 3.5 REST Controller

```java
// Template: infrastructure/web/controller/{Entity}Controller.java
package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.{도메인}.model.{Entity};
import com.aiportfolio.backend.domain.{도메인}.port.in.Get{Entity}UseCase;
import com.aiportfolio.backend.domain.{도메인}.port.in.Manage{Entity}UseCase;
import com.aiportfolio.backend.infrastructure.web.dto.{entity}.{Entity}Dto;
import com.aiportfolio.backend.infrastructure.web.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * {Entity} REST API Controller
 *
 * 책임: {Entity} CRUD 엔드포인트 제공
 */
@RestController
@RequestMapping("/api/{entities}")
@RequiredArgsConstructor
@Slf4j
public class {Entity}Controller {

    private final Get{Entity}UseCase get{Entity}UseCase;
    private final Manage{Entity}UseCase manage{Entity}UseCase;

    // ==================== 조회 (Public) ====================

    /**
     * 전체 활성 {Entity} 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<{Entity}Dto>>> getAll{Entities}() {
        log.info("Fetching all active {entities}");

        List<{Entity}> {entities} = get{Entity}UseCase.getAllActive{Entities}();
        List<{Entity}Dto> dtos = {entities}.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    /**
     * ID로 {Entity} 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<{Entity}Dto>> get{Entity}(@PathVariable {IdType} id) {
        log.info("Fetching {entity} by id: {}", id);

        {Entity} {entity} = get{Entity}UseCase.get{Entity}ById(id)
            .orElseThrow(() -> new IllegalArgumentException("{Entity}를 찾을 수 없습니다: " + id));

        return ResponseEntity.ok(ApiResponse.success(convertToDto({entity})));
    }

    /**
     * 검색
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<{Entity}Dto>>> search{Entities}(
            @RequestParam String keyword) {
        log.info("Searching {entities} with keyword: {}", keyword);

        List<{Entity}> {entities} = get{Entity}UseCase.search{Entities}(keyword);
        List<{Entity}Dto> dtos = {entities}.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    // ==================== 관리 (Admin) ====================

    /**
     * {Entity} 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<{Entity}Dto>> create{Entity}(
            @Valid @RequestBody {Entity}Dto dto) {
        log.info("Creating new {entity}: {}", dto.get{식별필드}());

        {Entity} {entity} = convertToDomain(dto);
        {Entity} created = manage{Entity}UseCase.create{Entity}({entity});

        return ResponseEntity.ok(ApiResponse.success(
            convertToDto(created),
            "{Entity} 생성 성공"
        ));
    }

    /**
     * {Entity} 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<{Entity}Dto>> update{Entity}(
            @PathVariable {IdType} id,
            @Valid @RequestBody {Entity}Dto dto) {
        log.info("Updating {entity}: {}", id);

        {Entity} {entity} = convertToDomain(dto);
        {Entity} updated = manage{Entity}UseCase.update{Entity}(id, {entity});

        return ResponseEntity.ok(ApiResponse.success(
            convertToDto(updated),
            "{Entity} 수정 성공"
        ));
    }

    /**
     * {Entity} 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete{Entity}(@PathVariable {IdType} id) {
        log.info("Deleting {entity}: {}", id);

        manage{Entity}UseCase.delete{Entity}(id);

        return ResponseEntity.ok(ApiResponse.success(null, "{Entity} 삭제 성공"));
    }

    /**
     * {Entity} 상태 토글
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<{Entity}Dto>> toggle{Entity}Status(
            @PathVariable {IdType} id) {
        log.info("Toggling {entity} status: {}", id);

        {Entity} toggled = manage{Entity}UseCase.toggle{Entity}Status(id);

        return ResponseEntity.ok(ApiResponse.success(
            convertToDto(toggled),
            "{Entity} 상태 변경 성공"
        ));
    }

    // ==================== 변환 메서드 ====================

    private {Entity}Dto convertToDto({Entity} {entity}) {
        return {Entity}Dto.builder()
            .id({entity}.getId())
            .{필드}({entity}.get{필드}())
            .isActive({entity}.getIsActive())
            .createdAt({entity}.getCreatedAt())
            .updatedAt({entity}.getUpdatedAt())
            .build();
    }

    private {Entity} convertToDomain({Entity}Dto dto) {
        return {Entity}.builder()
            .id(dto.getId())
            .{필드}(dto.get{필드}())
            .isActive(dto.getIsActive())
            .build();
    }
}
```

#### 3.6 DTO

```java
// Template: infrastructure/web/dto/{entity}/{Entity}Dto.java
package com.aiportfolio.backend.infrastructure.web.dto.{entity};

import lombok.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

/**
 * {Entity} DTO (Data Transfer Object)
 *
 * 역할: REST API 요청/응답 데이터 전송
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class {Entity}Dto {

    private {IdType} id;

    @NotBlank(message = "{필드명}은 필수입니다")
    private String {필드};

    @NotNull(message = "활성화 여부는 필수입니다")
    private Boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

## 디렉토리 구조

```
backend/src/main/java/com/aiportfolio/backend/

├── domain/{도메인}/                      # 도메인 계층
│   ├── model/                           # 도메인 모델
│   │   ├── {Entity}.java               # 핵심 엔티티
│   │   └── vo/                         # 값 객체 (선택)
│   │       └── {ValueObject}.java
│   ├── port/                           # 포트 (인터페이스)
│   │   ├── in/                         # Use Case 인터페이스
│   │   │   ├── Manage{Entity}UseCase.java
│   │   │   └── Get{Entity}UseCase.java
│   │   └── out/                        # Repository 포트
│   │       └── {Entity}RepositoryPort.java
│   └── service/                        # 도메인 서비스
│       └── {Entity}DomainService.java

├── application/{도메인}/                 # 애플리케이션 계층
│   ├── Manage{Entity}Service.java      # CUD UseCase 구현
│   └── Get{Entity}Service.java         # R UseCase 구현

└── infrastructure/                      # 인프라 계층
    ├── persistence/postgres/           # PostgreSQL 영속성
    │   ├── entity/
    │   │   └── {Entity}JpaEntity.java
    │   ├── repository/
    │   │   └── {Entity}JpaRepository.java
    │   ├── mapper/
    │   │   └── {Entity}Mapper.java
    │   └── adapter/
    │       └── {Entity}RepositoryAdapter.java
    └── web/                            # 웹 계층
        ├── controller/
        │   └── {Entity}Controller.java
        └── dto/{entity}/
            └── {Entity}Dto.java
```

---

## 적용 가이드라인

### 1. 새 도메인 추가 시 절차

#### 백엔드

1. **Domain Layer 작성** (외부 의존성 없음)
   - [ ] 도메인 모델 정의 (`{Entity}.java`)
   - [ ] UseCase 인터페이스 정의 (`Manage{Entity}UseCase`, `Get{Entity}UseCase`)
   - [ ] Repository Port 정의 (`{Entity}RepositoryPort`)
   - [ ] Domain Service 작성 (필요 시)

2. **Application Layer 작성**
   - [ ] Service 구현 (`Manage{Entity}Service`, `Get{Entity}Service`)
   - [ ] `@Transactional` 설정
   - [ ] 에러 처리 로직 추가

3. **Infrastructure Layer 작성**
   - [ ] JPA Entity 작성 (`{Entity}JpaEntity`)
   - [ ] JPA Repository 작성 (`{Entity}JpaRepository`)
   - [ ] Mapper 작성 (`{Entity}Mapper`)
   - [ ] Adapter 작성 (`{Entity}RepositoryAdapter`)
   - [ ] Controller 작성 (`{Entity}Controller`)
   - [ ] DTO 작성 (`{Entity}Dto`)

4. **테스트 작성**
   - [ ] Domain 단위 테스트
   - [ ] Service 통합 테스트
   - [ ] Controller API 테스트

### 2. 템플릿 커스터마이징 가이드

#### 도메인별로 달라지는 부분

**백엔드**:
1. **도메인 모델 필드**: 각 도메인의 속성에 맞게 수정
2. **비즈니스 로직**: `{Entity}DomainService`의 검증 규칙
3. **쿼리 메서드**: Repository Port 및 JPA Repository의 도메인별 쿼리
4. **DTO 구조**: API 응답에 포함될 필드

#### 재사용 가능한 부분 (수정 불필요)

**백엔드**:
- UseCase 인터페이스 구조
- Service 기본 CRUD 로직
- Adapter 패턴
- Controller 기본 엔드포인트 구조

---

## 마이그레이션 체크리스트

### 우선순위

| 순위 | 도메인 | 복잡도 | 예상 작업 시간 | 비고 |
|-----|--------|--------|--------------|------|
| 1 | Education (교육 이력) | 중 | 4-6시간 | 단순 CRUD, 관계 적음 |
| 2 | Experience (경력) | 중 | 4-6시간 | 단순 CRUD, 관계 적음 |
| 3 | Project (프로젝트) | 높음 | 8-10시간 | 복잡한 관계, 다중 연관 |
| 4 | Admin (관리자) | 중 | 6-8시간 | 인증/인가 로직 포함 |

### 마이그레이션 체크리스트

각 도메인 마이그레이션 시 다음 체크리스트를 따릅니다:

#### ✅ 사전 준비
- [ ] 현재 코드 분석 (구조, 의존성)
- [ ] 템플릿 선택 (CRUD 템플릿 적용 가능 여부)
- [ ] 도메인별 특수 요구사항 파악

#### ✅ 백엔드 마이그레이션
- [ ] Domain Layer 리팩토링
  - [ ] 도메인 모델 분리 (JPA 어노테이션 제거)
  - [ ] UseCase 인터페이스 정의
  - [ ] Repository Port 정의
- [ ] Application Layer 리팩토링
  - [ ] Service를 UseCase 구현체로 변경
  - [ ] 비즈니스 로직을 Domain Service로 분리
- [ ] Infrastructure Layer 리팩토링
  - [ ] JPA Entity 분리
  - [ ] Mapper 생성
  - [ ] Adapter 생성
  - [ ] Controller 리팩토링

#### ✅ 테스트 및 검증
- [ ] 단위 테스트 작성/수정
- [ ] 통합 테스트 검증
- [ ] API 테스트 검증

#### ✅ 문서화
- [ ] 가이드라인 업데이트
- [ ] 마이그레이션 기록 작성
- [ ] 다음 도메인 마이그레이션 계획 수립

---

## 결론

이 템플릿을 활용하면 다음과 같은 이점을 얻을 수 있습니다:

1. **일관성**: 모든 도메인이 동일한 아키텍처 패턴을 따름
2. **생산성**: 반복적인 코드 작성 시간 단축
3. **유지보수성**: 구조화된 코드로 버그 추적 및 수정 용이
4. **확장성**: 새로운 도메인 추가 시 템플릿 기반으로 빠르게 구현
5. **학습 곡선**: 신규 개발자가 코드베이스 이해하기 쉬움

다음 단계는 이 템플릿을 실제 도메인(Education, Experience, Project 등)에 적용하고, 마이그레이션 경험을 바탕으로 템플릿을 계속 개선하는 것입니다.

---

## Admin 도메인 패턴

Admin 도메인은 관리자 전용 기능(캐시 관리, 인증 등)을 위한 특수 패턴입니다.

### 디렉토리 구조

```
backend/src/main/java/com/aiportfolio/backend/

├── domain/admin/                        # Admin 도메인 계층
│   ├── port/                           # 포트 (인터페이스)
│   │   ├── in/                         # Use Case 인터페이스
│   │   │   ├── ManageCacheUseCase.java
│   │   │   └── AuthenticateUserUseCase.java
│   │   └── out/                        # Port Out
│   │       ├── CacheManagementPort.java
│   │       └── UserAuthenticationPort.java
│   └── model/                          # Admin 도메인 모델 (선택적)

├── application/admin/                   # Admin 애플리케이션 계층
│   └── service/
│       ├── CacheManagementService.java
│       └── AuthService.java

└── infrastructure/
    ├── persistence/redis/adapter/      # Redis 어댑터
    │   └── RedisCacheManagementAdapter.java
    └── web/admin/controller/           # Admin 전용 Controller
        └── AdminCacheController.java
```

### Admin UseCase 예시: 캐시 관리

#### 1. UseCase 인터페이스 (Port In)

```java
// domain/admin/port/in/ManageCacheUseCase.java
package com.aiportfolio.backend.domain.admin.port.in;

import java.util.List;
import java.util.Map;

public interface ManageCacheUseCase {

    /**
     * 모든 캐시를 초기화합니다.
     */
    void flushAllCache();

    /**
     * 캐시 통계를 조회합니다.
     */
    Map<String, Object> getCacheStats();

    /**
     * 특정 패턴의 캐시를 삭제합니다.
     */
    void evictCacheByPattern(String pattern);

    /**
     * 모든 캐시 키 목록을 조회합니다.
     */
    List<String> getAllCacheKeys();

    /**
     * 특정 패턴과 일치하는 캐시 키 목록을 조회합니다.
     */
    List<String> getCacheKeysByPattern(String pattern);
}
```

#### 2. Port Out 인터페이스

```java
// domain/admin/port/out/CacheManagementPort.java
package com.aiportfolio.backend.domain.admin.port.out;

import java.util.Map;
import java.util.Set;

public interface CacheManagementPort {

    void flushAll();
    void evictByPattern(String pattern);
    void evict(String cacheName, String key);
    Map<String, Object> getStatistics();
    long getKeyCount(String pattern);
    Map<String, Object> getCacheStatus();
    Set<String> getKeysByPattern(String pattern);
}
```

#### 3. Service 구현 (Application Layer)

```java
// application/admin/service/CacheManagementService.java
package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.port.in.ManageCacheUseCase;
import com.aiportfolio.backend.domain.admin.port.out.CacheManagementPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheManagementService implements ManageCacheUseCase {

    private final CacheManagementPort cacheManagementPort;

    @Override
    public void flushAllCache() {
        log.info("Starting cache flush operation");
        try {
            cacheManagementPort.flushAll();
            log.info("Cache flush completed successfully");
        } catch (Exception e) {
            log.error("Error during cache flush", e);
            throw new RuntimeException("캐시 초기화 중 오류가 발생했습니다", e);
        }
    }

    @Override
    public Map<String, Object> getCacheStats() {
        log.info("Retrieving cache statistics");
        try {
            return cacheManagementPort.getStatistics();
        } catch (Exception e) {
            log.error("Error retrieving cache stats", e);
            throw new RuntimeException("캐시 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    @Override
    public List<String> getAllCacheKeys() {
        log.info("Retrieving all cache keys");
        try {
            Set<String> keys = cacheManagementPort.getKeysByPattern("*");
            List<String> sortedKeys = new ArrayList<>(keys);
            Collections.sort(sortedKeys);
            return sortedKeys;
        } catch (Exception e) {
            log.error("Error retrieving cache keys", e);
            throw new RuntimeException("캐시 키 목록 조회 중 오류가 발생했습니다", e);
        }
    }
}
```

#### 4. Redis Adapter (Infrastructure Layer)

```java
// infrastructure/persistence/redis/adapter/RedisCacheManagementAdapter.java
package com.aiportfolio.backend.infrastructure.persistence.redis.adapter;

import com.aiportfolio.backend.domain.admin.port.out.CacheManagementPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisCacheManagementAdapter implements CacheManagementPort {

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void flushAll() {
        Set<String> keys = redisTemplate.keys("*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Override
    public Set<String> getKeysByPattern(String pattern) {
        Set<String> keys = redisTemplate.keys(pattern);
        return keys != null ? keys : Set.of();
    }

    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        Set<String> allKeys = redisTemplate.keys("*");
        stats.put("totalKeys", allKeys != null ? allKeys.size() : 0);
        // 추가 통계 정보...
        return stats;
    }
}
```

#### 5. Admin Controller

```java
// infrastructure/web/admin/controller/AdminCacheController.java
package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.admin.port.in.ManageCacheUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cache")
@RequiredArgsConstructor
@Slf4j
public class AdminCacheController {

    private final ManageCacheUseCase manageCacheUseCase;

    @PostMapping("/flush")
    public ResponseEntity<Map<String, Object>> flushCache() {
        manageCacheUseCase.flushAllCache();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "캐시가 성공적으로 초기화되었습니다."
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        Map<String, Object> stats = manageCacheUseCase.getCacheStats();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", stats
        ));
    }

    @GetMapping("/keys")
    public ResponseEntity<Map<String, Object>> getAllCacheKeys() {
        List<String> keys = manageCacheUseCase.getAllCacheKeys();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", keys,
            "count", keys.size()
        ));
    }
}
```

### Admin 패턴 특징

1. **도메인 모델 없음**: Admin 기능은 주로 인프라 관리이므로 도메인 모델이 없을 수 있음
2. **Port Out 중심**: Redis, 외부 시스템과의 통신을 Port Out으로 추상화
3. **관리자 전용 엔드포인트**: `/api/admin/*` 경로 사용
4. **응답 형식 통일**: `{ success, data, message }` 구조 사용

### Admin 패턴 적용 대상

- 캐시 관리 (Redis)
- 인증/인가 관리
- 시스템 모니터링
- 설정 관리
- 로그 관리

---

**작성일**: 2025-01-26
**버전**: 1.1
**작성자**: AI Agent (Claude)
**변경사항**: Admin 도메인 패턴 추가


