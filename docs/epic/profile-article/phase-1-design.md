# Phase 1: 자기소개 Markdown 관리 설계 문서

## 개요

**목표**: 프로필 페이지의 자기소개 섹션을 마크다운 형식으로 관리 가능하게 하고, Admin에서 편집할 수 있도록 구현

**범위**:
- DB 스키마 추가 (ProfileIntroduction 테이블)
- Backend API (Hexagonal Architecture)
- Admin UI (마크다운 에디터, Feature-Sliced Design)
- Frontend 표시 UI (마크다운 렌더링)

**비범위**:
- 마크다운 에디터 직접 구현 (기존 라이브러리 활용)
- 버전 히스토리 UI (DB 스키마에는 준비되어 있으나 UI는 미구현)
- 다국어 지원

**전제 조건**:
- Phase 0 완료 (Admin 공통 프레임 정비)
- `admin/shared/ui/markdown/MarkdownEditor.tsx` 컴포넌트 존재 확인

---

## 1. DB 스키마 설계

### 1.1 ProfileIntroduction 테이블

```sql
CREATE TABLE IF NOT EXISTS profile_introduction (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,  -- Markdown 형식
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 초기 데이터 삽입 (선택적)
INSERT INTO profile_introduction (content, version)
VALUES ('# 안녕하세요

저는 AI와 함께 성장하는 개발자입니다.

## 주요 관심사
- Full Stack 개발
- 클린 아키텍처
- AI 활용 개발

더 자세한 내용은 프로젝트를 통해 확인해주세요!', 1)
ON CONFLICT DO NOTHING;
```

**설계 의도:**
- **별도 테이블**: 프로필과 자기소개를 분리하여 책임 분리
- **단일 레코드**: 항상 1개의 레코드만 존재 (최신 자기소개)
- **버전 관리**: 향후 버전 히스토리 기능 확장 가능
- **TEXT 타입**: 긴 마크다운 콘텐츠 저장 가능

### 1.2 마이그레이션 파일

**파일 위치**: `backend/src/main/resources/db/migration/V004__create_profile_introduction_table.sql`

```sql
-- V004__create_profile_introduction_table.sql
CREATE TABLE IF NOT EXISTS profile_introduction (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_profile_introduction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_introduction_updated_at
    BEFORE UPDATE ON profile_introduction
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_introduction_updated_at();

-- 초기 데이터 (선택적)
INSERT INTO profile_introduction (content, version)
VALUES ('# 안녕하세요

저는 AI와 함께 성장하는 개발자입니다.

## 주요 관심사
- Full Stack 개발
- 클린 아키텍처
- AI 활용 개발

더 자세한 내용은 프로젝트를 통해 확인해주세요!', 1);
```

---

## 2. Backend 설계 (Hexagonal Architecture)

### 2.1 아키텍처 개요

```
Domain Layer (순수 비즈니스 로직)
    ├── model/ProfileIntroduction.java
    ├── port/in/ManageProfileIntroductionUseCase.java
    ├── port/in/GetProfileIntroductionUseCase.java
    └── port/out/ProfileIntroductionRepositoryPort.java

Application Layer (유스케이스 구현)
    ├── ManageProfileIntroductionService.java
    └── GetProfileIntroductionService.java

Infrastructure Layer (어댑터)
    ├── persistence/
    │   ├── entity/ProfileIntroductionJpaEntity.java
    │   ├── repository/ProfileIntroductionJpaRepository.java
    │   ├── mapper/ProfileIntroductionMapper.java
    │   └── adapter/PostgresProfileIntroductionRepository.java
    └── web/
        ├── admin/controller/AdminProfileIntroductionController.java
        └── controller/ProfileIntroductionController.java
```

### 2.2 Domain Layer

#### 2.2.1 ProfileIntroduction (Domain Model)

**파일**: `backend/src/main/java/com/portfolio/domain/portfolio/model/ProfileIntroduction.java`

```java
package com.portfolio.domain.portfolio.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 프로필 자기소개 도메인 모델
 */
@Getter
@Builder
public class ProfileIntroduction {
    private Long id;
    private String content;  // Markdown 형식
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 콘텐츠 업데이트
     */
    public ProfileIntroduction updateContent(String newContent) {
        return ProfileIntroduction.builder()
                .id(this.id)
                .content(newContent)
                .version(this.version + 1)
                .createdAt(this.createdAt)
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * 유효성 검증
     */
    public void validate() {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("자기소개 내용은 필수입니다.");
        }
        if (content.length() > 50000) {
            throw new IllegalArgumentException("자기소개 내용은 50,000자를 초과할 수 없습니다.");
        }
    }
}
```

#### 2.2.2 ManageProfileIntroductionUseCase (Input Port)

**파일**: `backend/src/main/java/com/portfolio/domain/portfolio/port/in/ManageProfileIntroductionUseCase.java`

```java
package com.portfolio.domain.portfolio.port.in;

import com.portfolio.domain.portfolio.model.ProfileIntroduction;

/**
 * 프로필 자기소개 관리 유스케이스
 */
public interface ManageProfileIntroductionUseCase {

    /**
     * 자기소개 생성 또는 업데이트
     * (단일 레코드이므로 CREATE/UPDATE 통합)
     */
    ProfileIntroduction saveOrUpdate(SaveProfileIntroductionCommand command);

    /**
     * 자기소개 저장 커맨드
     */
    record SaveProfileIntroductionCommand(String content) {
        public SaveProfileIntroductionCommand {
            if (content == null || content.isBlank()) {
                throw new IllegalArgumentException("자기소개 내용은 필수입니다.");
            }
        }
    }
}
```

#### 2.2.3 GetProfileIntroductionUseCase (Input Port)

**파일**: `backend/src/main/java/com/portfolio/domain/portfolio/port/in/GetProfileIntroductionUseCase.java`

```java
package com.portfolio.domain.portfolio.port.in;

import com.portfolio.domain.portfolio.model.ProfileIntroduction;

import java.util.Optional;

/**
 * 프로필 자기소개 조회 유스케이스
 */
public interface GetProfileIntroductionUseCase {

    /**
     * 현재 자기소개 조회
     * (단일 레코드이므로 항상 최신 버전 반환)
     */
    Optional<ProfileIntroduction> getCurrent();
}
```

#### 2.2.4 ProfileIntroductionRepositoryPort (Output Port)

**파일**: `backend/src/main/java/com/portfolio/domain/portfolio/port/out/ProfileIntroductionRepositoryPort.java`

```java
package com.portfolio.domain.portfolio.port.out;

import com.portfolio.domain.portfolio.model.ProfileIntroduction;

import java.util.Optional;

/**
 * 프로필 자기소개 저장소 포트
 */
public interface ProfileIntroductionRepositoryPort {

    /**
     * 자기소개 저장 (생성 또는 업데이트)
     */
    ProfileIntroduction save(ProfileIntroduction profileIntroduction);

    /**
     * 현재 자기소개 조회
     */
    Optional<ProfileIntroduction> findCurrent();

    /**
     * ID로 조회
     */
    Optional<ProfileIntroduction> findById(Long id);
}
```

### 2.3 Application Layer

#### 2.3.1 ManageProfileIntroductionService

**파일**: `backend/src/main/java/com/portfolio/application/portfolio/ManageProfileIntroductionService.java`

```java
package com.portfolio.application.portfolio;

import com.portfolio.domain.portfolio.model.ProfileIntroduction;
import com.portfolio.domain.portfolio.port.in.ManageProfileIntroductionUseCase;
import com.portfolio.domain.portfolio.port.out.ProfileIntroductionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 프로필 자기소개 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ManageProfileIntroductionService implements ManageProfileIntroductionUseCase {

    private final ProfileIntroductionRepositoryPort repository;

    @Override
    public ProfileIntroduction saveOrUpdate(SaveProfileIntroductionCommand command) {
        // 기존 자기소개 조회
        return repository.findCurrent()
                .map(existing -> {
                    // 업데이트
                    ProfileIntroduction updated = existing.updateContent(command.content());
                    updated.validate();
                    return repository.save(updated);
                })
                .orElseGet(() -> {
                    // 신규 생성
                    ProfileIntroduction newIntro = ProfileIntroduction.builder()
                            .content(command.content())
                            .version(1)
                            .build();
                    newIntro.validate();
                    return repository.save(newIntro);
                });
    }
}
```

#### 2.3.2 GetProfileIntroductionService

**파일**: `backend/src/main/java/com/portfolio/application/portfolio/GetProfileIntroductionService.java`

```java
package com.portfolio.application.portfolio;

import com.portfolio.domain.portfolio.model.ProfileIntroduction;
import com.portfolio.domain.portfolio.port.in.GetProfileIntroductionUseCase;
import com.portfolio.domain.portfolio.port.out.ProfileIntroductionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 프로필 자기소개 조회 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetProfileIntroductionService implements GetProfileIntroductionUseCase {

    private final ProfileIntroductionRepositoryPort repository;

    @Override
    public Optional<ProfileIntroduction> getCurrent() {
        return repository.findCurrent();
    }
}
```

### 2.4 Infrastructure Layer

#### 2.4.1 ProfileIntroductionJpaEntity

**파일**: `backend/src/main/java/com/portfolio/infrastructure/persistence/postgres/entity/ProfileIntroductionJpaEntity.java`

```java
package com.portfolio.infrastructure.persistence.postgres.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 프로필 자기소개 JPA 엔티티
 */
@Entity
@Table(name = "profile_introduction")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProfileIntroductionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

#### 2.4.2 ProfileIntroductionJpaRepository

**파일**: `backend/src/main/java/com/portfolio/infrastructure/persistence/postgres/repository/ProfileIntroductionJpaRepository.java`

```java
package com.portfolio.infrastructure.persistence.postgres.repository;

import com.portfolio.infrastructure.persistence.postgres.entity.ProfileIntroductionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

/**
 * 프로필 자기소개 JPA 저장소
 */
public interface ProfileIntroductionJpaRepository extends JpaRepository<ProfileIntroductionJpaEntity, Long> {

    /**
     * 최신 자기소개 조회 (ID 기준 내림차순 첫 번째)
     */
    @Query("SELECT p FROM ProfileIntroductionJpaEntity p ORDER BY p.id DESC LIMIT 1")
    Optional<ProfileIntroductionJpaEntity> findLatest();
}
```

#### 2.4.3 ProfileIntroductionMapper

**파일**: `backend/src/main/java/com/portfolio/infrastructure/persistence/postgres/mapper/ProfileIntroductionMapper.java`

```java
package com.portfolio.infrastructure.persistence.postgres.mapper;

import com.portfolio.domain.portfolio.model.ProfileIntroduction;
import com.portfolio.infrastructure.persistence.postgres.entity.ProfileIntroductionJpaEntity;
import org.springframework.stereotype.Component;

/**
 * ProfileIntroduction 도메인 모델 <-> JPA 엔티티 매퍼
 */
@Component
public class ProfileIntroductionMapper {

    /**
     * JPA 엔티티 -> 도메인 모델
     */
    public ProfileIntroduction toDomain(ProfileIntroductionJpaEntity entity) {
        return ProfileIntroduction.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .version(entity.getVersion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * 도메인 모델 -> JPA 엔티티
     */
    public ProfileIntroductionJpaEntity toEntity(ProfileIntroduction domain) {
        return ProfileIntroductionJpaEntity.builder()
                .id(domain.getId())
                .content(domain.getContent())
                .version(domain.getVersion())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
```

#### 2.4.4 PostgresProfileIntroductionRepository (Adapter)

**파일**: `backend/src/main/java/com/portfolio/infrastructure/persistence/postgres/adapter/PostgresProfileIntroductionRepository.java`

```java
package com.portfolio.infrastructure.persistence.postgres.adapter;

import com.portfolio.domain.portfolio.model.ProfileIntroduction;
import com.portfolio.domain.portfolio.port.out.ProfileIntroductionRepositoryPort;
import com.portfolio.infrastructure.persistence.postgres.entity.ProfileIntroductionJpaEntity;
import com.portfolio.infrastructure.persistence.postgres.mapper.ProfileIntroductionMapper;
import com.portfolio.infrastructure.persistence.postgres.repository.ProfileIntroductionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * PostgreSQL 기반 프로필 자기소개 저장소 어댑터
 */
@Repository
@RequiredArgsConstructor
public class PostgresProfileIntroductionRepository implements ProfileIntroductionRepositoryPort {

    private final ProfileIntroductionJpaRepository jpaRepository;
    private final ProfileIntroductionMapper mapper;

    @Override
    public ProfileIntroduction save(ProfileIntroduction profileIntroduction) {
        ProfileIntroductionJpaEntity entity = mapper.toEntity(profileIntroduction);
        ProfileIntroductionJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<ProfileIntroduction> findCurrent() {
        return jpaRepository.findLatest()
                .map(mapper::toDomain);
    }

    @Override
    public Optional<ProfileIntroduction> findById(Long id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }
}
```

### 2.5 Web Layer (Controllers)

#### 2.5.1 AdminProfileIntroductionController

**파일**: `backend/src/main/java/com/portfolio/infrastructure/web/admin/controller/AdminProfileIntroductionController.java`

```java
package com.portfolio.infrastructure.web.admin.controller;

import com.portfolio.domain.portfolio.model.ProfileIntroduction;
import com.portfolio.domain.portfolio.port.in.GetProfileIntroductionUseCase;
import com.portfolio.domain.portfolio.port.in.ManageProfileIntroductionUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Admin 프로필 자기소개 컨트롤러
 */
@RestController
@RequestMapping("/api/admin/profile-introduction")
@RequiredArgsConstructor
public class AdminProfileIntroductionController {

    private final ManageProfileIntroductionUseCase manageUseCase;
    private final GetProfileIntroductionUseCase getUseCase;

    /**
     * 현재 자기소개 조회
     */
    @GetMapping
    public ResponseEntity<ProfileIntroductionResponse> getCurrent() {
        return getUseCase.getCurrent()
                .map(intro -> ResponseEntity.ok(ProfileIntroductionResponse.from(intro)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 자기소개 저장 (생성 또는 업데이트)
     */
    @PutMapping
    public ResponseEntity<ProfileIntroductionResponse> saveOrUpdate(
            @RequestBody SaveProfileIntroductionRequest request) {

        ManageProfileIntroductionUseCase.SaveProfileIntroductionCommand command =
                new ManageProfileIntroductionUseCase.SaveProfileIntroductionCommand(request.content());

        ProfileIntroduction saved = manageUseCase.saveOrUpdate(command);
        return ResponseEntity.ok(ProfileIntroductionResponse.from(saved));
    }

    /**
     * Request DTO
     */
    public record SaveProfileIntroductionRequest(String content) {}

    /**
     * Response DTO
     */
    public record ProfileIntroductionResponse(
            Long id,
            String content,
            Integer version,
            String createdAt,
            String updatedAt
    ) {
        public static ProfileIntroductionResponse from(ProfileIntroduction domain) {
            return new ProfileIntroductionResponse(
                    domain.getId(),
                    domain.getContent(),
                    domain.getVersion(),
                    domain.getCreatedAt().toString(),
                    domain.getUpdatedAt().toString()
            );
        }
    }
}
```

#### 2.5.2 ProfileIntroductionController (Public API)

**파일**: `backend/src/main/java/com/portfolio/infrastructure/web/controller/ProfileIntroductionController.java`

```java
package com.portfolio.infrastructure.web.controller;

import com.portfolio.domain.portfolio.model.ProfileIntroduction;
import com.portfolio.domain.portfolio.port.in.GetProfileIntroductionUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public 프로필 자기소개 컨트롤러
 */
@RestController
@RequestMapping("/api/profile-introduction")
@RequiredArgsConstructor
public class ProfileIntroductionController {

    private final GetProfileIntroductionUseCase getUseCase;

    /**
     * 현재 자기소개 조회
     */
    @GetMapping
    public ResponseEntity<ProfileIntroductionResponse> getCurrent() {
        return getUseCase.getCurrent()
                .map(intro -> ResponseEntity.ok(ProfileIntroductionResponse.from(intro)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Response DTO (Public용 - 필요한 정보만 노출)
     */
    public record ProfileIntroductionResponse(
            String content,
            String updatedAt
    ) {
        public static ProfileIntroductionResponse from(ProfileIntroduction domain) {
            return new ProfileIntroductionResponse(
                    domain.getContent(),
                    domain.getUpdatedAt().toString()
            );
        }
    }
}
```

---

## 3. Admin UI 설계 (Feature-Sliced Design)

### 3.1 아키텍처 개요

```
frontend/src/admin/
├── entities/profile-introduction/
│   ├── model/profileIntroduction.types.ts
│   ├── api/adminProfileIntroductionApi.ts
│   ├── api/useAdminProfileIntroductionQuery.ts
│   └── index.ts
├── features/profile-introduction-management/
│   ├── hooks/useProfileIntroductionForm.ts
│   └── ui/ProfileIntroductionEditor.tsx
└── pages/
    └── ProfileIntroductionManagement.tsx
```

### 3.2 Entities Layer

#### 3.2.1 타입 정의

**파일**: `frontend/src/admin/entities/profile-introduction/model/profileIntroduction.types.ts`

```typescript
/**
 * 프로필 자기소개 타입
 */
export interface ProfileIntroduction {
  id: number;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 자기소개 저장 요청
 */
export interface SaveProfileIntroductionRequest {
  content: string;
}
```

#### 3.2.2 API 클라이언트

**파일**: `frontend/src/admin/entities/profile-introduction/api/adminProfileIntroductionApi.ts`

```typescript
import { adminApiClient } from '@/admin/api/adminApiClient';
import { ProfileIntroduction, SaveProfileIntroductionRequest } from '../model/profileIntroduction.types';

/**
 * Admin 프로필 자기소개 API
 */
export const adminProfileIntroductionApi = {
  /**
   * 현재 자기소개 조회
   */
  getCurrent: () =>
    adminApiClient.get<ProfileIntroduction>('/profile-introduction'),

  /**
   * 자기소개 저장 (생성 또는 업데이트)
   */
  saveOrUpdate: (data: SaveProfileIntroductionRequest) =>
    adminApiClient.put<ProfileIntroduction>('/profile-introduction', data),
};
```

#### 3.2.3 React Query 훅

**파일**: `frontend/src/admin/entities/profile-introduction/api/useAdminProfileIntroductionQuery.ts`

```typescript
import { useAdminQuery } from '@/admin/hooks/useAdminQuery';
import { useAdminMutation } from '@/admin/hooks/useAdminMutation';
import { adminProfileIntroductionApi } from './adminProfileIntroductionApi';
import { SaveProfileIntroductionRequest } from '../model/profileIntroduction.types';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

/**
 * 현재 자기소개 조회 쿼리
 */
export function useAdminProfileIntroductionQuery() {
  return useAdminQuery({
    queryKey: ['admin', 'profile-introduction'],
    queryFn: () => adminProfileIntroductionApi.getCurrent(),
  });
}

/**
 * 자기소개 저장 뮤테이션
 */
export function useSaveProfileIntroductionMutation() {
  const queryClient = useQueryClient();

  return useAdminMutation({
    mutationFn: (data: SaveProfileIntroductionRequest) =>
      adminProfileIntroductionApi.saveOrUpdate(data),
    onSuccess: () => {
      message.success('자기소개가 저장되었습니다.');
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile-introduction'] });
    },
  });
}
```

#### 3.2.4 Index (배럴 파일)

**파일**: `frontend/src/admin/entities/profile-introduction/index.ts`

```typescript
export * from './model/profileIntroduction.types';
export * from './api/adminProfileIntroductionApi';
export * from './api/useAdminProfileIntroductionQuery';
```

### 3.3 Features Layer

#### 3.3.1 useProfileIntroductionForm 훅

**파일**: `frontend/src/admin/features/profile-introduction-management/hooks/useProfileIntroductionForm.ts`

```typescript
import { useState, useEffect } from 'react';
import {
  useAdminProfileIntroductionQuery,
  useSaveProfileIntroductionMutation,
} from '@/admin/entities/profile-introduction';

/**
 * 프로필 자기소개 폼 훅
 */
export function useProfileIntroductionForm() {
  const [content, setContent] = useState('');

  // 현재 자기소개 조회
  const { data: introduction, isLoading } = useAdminProfileIntroductionQuery();

  // 자기소개 저장
  const { mutate: save, isPending: isSaving } = useSaveProfileIntroductionMutation();

  // 초기 데이터 로드
  useEffect(() => {
    if (introduction) {
      setContent(introduction.content);
    }
  }, [introduction]);

  // 저장 핸들러
  const handleSave = () => {
    if (!content.trim()) {
      return;
    }
    save({ content });
  };

  return {
    content,
    setContent,
    handleSave,
    isSaving,
    isLoading,
    introduction,
  };
}
```

#### 3.3.2 ProfileIntroductionEditor 컴포넌트

**파일**: `frontend/src/admin/features/profile-introduction-management/ui/ProfileIntroductionEditor.tsx`

```typescript
import { Button, Space, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { MarkdownEditor } from '@/admin/shared/ui/markdown/MarkdownEditor';
import { useProfileIntroductionForm } from '../hooks/useProfileIntroductionForm';

/**
 * 프로필 자기소개 에디터
 *
 * 참고:
 * - MarkdownEditor (@uiw/react-md-editor)는 내장 미리보기 기능 제공
 * - preview prop으로 'edit' | 'live' | 'preview' 모드 전환 가능
 * - 기본값: 'edit' (편집 + 미리보기 분할 화면)
 */
export function ProfileIntroductionEditor() {
  const {
    content,
    setContent,
    handleSave,
    isSaving,
    isLoading,
    introduction,
  } = useProfileIntroductionForm();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="profile-introduction-editor">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">자기소개 관리</h2>
          {introduction && (
            <p className="text-sm text-gray-500 mt-1">
              마지막 수정: {new Date(introduction.updatedAt).toLocaleString('ko-KR')} (버전 {introduction.version})
            </p>
          )}
        </div>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isSaving}
            disabled={!content.trim()}
          >
            저장
          </Button>
        </Space>
      </div>

      {/* 마크다운 에디터 (내장 미리보기 포함) */}
      <MarkdownEditor
        value={content}
        onChange={setContent}
        height={600}
        preview="live" // 편집과 미리보기를 동시에 보여줌
      />

      {/* 가이드 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">마크다운 작성 가이드</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 제목: # H1, ## H2, ### H3</li>
          <li>• 강조: **굵게**, *기울임*</li>
          <li>• 목록: - 또는 1. 2. 3.</li>
          <li>• 링크: [텍스트](URL)</li>
          <li>• 이미지: ![설명](이미지URL)</li>
          <li>• 코드: `인라인 코드` 또는 ```언어로 코드 블록</li>
        </ul>
      </div>
    </div>
  );
}
```

### 3.4 Pages Layer

#### 3.4.1 ProfileIntroductionManagement 페이지

**파일**: `frontend/src/admin/pages/ProfileIntroductionManagement.tsx`

```typescript
import { ProfileIntroductionEditor } from '../features/profile-introduction-management/ui/ProfileIntroductionEditor';

/**
 * 프로필 자기소개 관리 페이지
 */
export function ProfileIntroductionManagement() {
  return (
    <div className="profile-introduction-management-page p-6">
      <ProfileIntroductionEditor />
    </div>
  );
}
```

### 3.5 라우팅 추가

**파일**: `frontend/src/admin/app/AdminApp.tsx` (또는 라우팅 설정 파일)

```typescript
// 라우팅 추가
<Route path="/profile-introduction" element={<ProfileIntroductionManagement />} />
```

---

## 4. Frontend 표시 UI 설계

### 4.1 아키텍처 개요

```
frontend/src/main/
├── entities/profile-introduction/
│   ├── model/profileIntroduction.types.ts
│   ├── api/profileIntroductionApi.ts
│   ├── api/useProfileIntroductionQuery.ts
│   └── index.ts
└── pages/ProfilePage/
    └── components/
        └── IntroductionSection.tsx
```

### 4.2 Entities Layer

#### 4.2.1 타입 정의

**파일**: `frontend/src/main/entities/profile-introduction/model/profileIntroduction.types.ts`

```typescript
/**
 * 프로필 자기소개 (Public)
 */
export interface ProfileIntroduction {
  content: string;
  updatedAt: string;
}
```

#### 4.2.2 API 클라이언트

**파일**: `frontend/src/main/entities/profile-introduction/api/profileIntroductionApi.ts`

```typescript
import { ProfileIntroduction } from '../model/profileIntroduction.types';

/**
 * Public 프로필 자기소개 API
 */
export const profileIntroductionApi = {
  /**
   * 현재 자기소개 조회
   */
  getCurrent: async (): Promise<ProfileIntroduction> => {
    const response = await fetch('/api/profile-introduction');
    if (!response.ok) {
      throw new Error('Failed to fetch profile introduction');
    }
    return response.json();
  },
};
```

#### 4.2.3 React Query 훅

**파일**: `frontend/src/main/entities/profile-introduction/api/useProfileIntroductionQuery.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { profileIntroductionApi } from './profileIntroductionApi';

/**
 * 프로필 자기소개 조회 쿼리
 */
export function useProfileIntroductionQuery() {
  return useQuery({
    queryKey: ['profile-introduction'],
    queryFn: () => profileIntroductionApi.getCurrent(),
    staleTime: 10 * 60 * 1000, // 10분
  });
}
```

#### 4.2.4 Index

**파일**: `frontend/src/main/entities/profile-introduction/index.ts`

```typescript
export * from './model/profileIntroduction.types';
export * from './api/profileIntroductionApi';
export * from './api/useProfileIntroductionQuery';
```

### 4.3 IntroductionSection 컴포넌트 수정

**파일**: `frontend/src/main/pages/ProfilePage/components/IntroductionSection.tsx`

```typescript
import { Card } from '@/design-system/components/Card';
import { SectionTitle } from '@/design-system/components/SectionTitle';
import { useProfileIntroductionQuery } from '@/main/entities/profile-introduction';
import { MarkdownRenderer } from '@/shared/ui/markdown/MarkdownRenderer';

/**
 * 자기소개 섹션
 *
 * 참고:
 * - MarkdownRenderer는 이미 구현된 공용 마크다운 렌더러
 * - react-markdown + remark-gfm + rehype-sanitize + rehype-highlight 적용됨
 * - 코드 하이라이팅, 보안 처리, 커스텀 스타일링 포함
 */
export function IntroductionSection() {
  const { data: introduction, isLoading, error } = useProfileIntroductionQuery();

  if (isLoading) {
    return (
      <section className="introduction-section">
        <SectionTitle>소개</SectionTitle>
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="introduction-section">
        <SectionTitle>소개</SectionTitle>
        <Card>
          <p className="text-red-500">자기소개를 불러오는데 실패했습니다.</p>
        </Card>
      </section>
    );
  }

  if (!introduction) {
    return null;
  }

  return (
    <section className="introduction-section">
      <SectionTitle>소개</SectionTitle>
      <Card>
        <MarkdownRenderer content={introduction.content} />
        <p className="text-sm text-gray-500 mt-6 border-t pt-4">
          마지막 수정: {new Date(introduction.updatedAt).toLocaleString('ko-KR')}
        </p>
      </Card>
    </section>
  );
}
```

---

## 5. 마크다운 렌더링 설정

### 5.1 사용할 컴포넌트

**이미 구현된 컴포넌트:**
- **Admin 에디터**: `MarkdownEditor` ([MarkdownEditor.tsx:1](frontend/src/admin/shared/ui/markdown/MarkdownEditor.tsx#L1))
  - 라이브러리: `@uiw/react-md-editor`
  - 기능: 편집 + 실시간 미리보기

- **Frontend 렌더러**: `MarkdownRenderer` ([MarkdownRenderer.tsx:1](frontend/src/shared/ui/markdown/MarkdownRenderer.tsx#L1))
  - 라이브러리: `react-markdown` + `remark-gfm` + `rehype-sanitize` + `rehype-highlight`
  - 기능: 보안 처리, 코드 하이라이팅, 커스텀 스타일링

### 5.2 필요한 패키지 (이미 설치됨)

```json
{
  "@uiw/react-md-editor": "^4.0.0",
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1",
  "rehype-highlight": "^7.0.2",
  "rehype-sanitize": "^6.0.0",
  "highlight.js": "^11.11.1"
}
```

### 5.3 스타일링 (이미 적용됨)

`MarkdownRenderer` 컴포넌트에 이미 다음 스타일링이 적용되어 있습니다:
- Tailwind CSS 기반 커스텀 컴포넌트 스타일
- 다크 모드 지원
- 코드 하이라이팅 (highlight.js GitHub 테마)
- 반응형 디자인
- 스크롤 마진 (앵커 링크 지원)

**추가 작업 불필요**: 기존 `MarkdownRenderer`를 그대로 사용하면 됩니다.

---

## 6. 구현 순서

1. **Backend 구현** (1일)
   - DB 마이그레이션
   - Domain Layer
   - Application Layer
   - Infrastructure Layer
   - API 테스트

2. **Admin UI 구현** (1일)
   - Entities Layer
   - Features Layer
   - Pages Layer
   - API 연동 테스트

3. **Frontend 표시 UI 구현** (0.5일)
   - Entities Layer
   - IntroductionSection 수정
   - 마크다운 렌더링 테스트

4. **통합 테스트 및 검증** (0.5일)

---

## 7. 검증 기준

### 7.1 Backend
- [ ] DB 마이그레이션이 정상적으로 실행되는가?
- [ ] API가 정상적으로 동작하는가? (GET, PUT)
- [ ] 유효성 검증이 올바르게 작동하는가?
- [ ] Hexagonal Architecture가 올바르게 구현되었는가?

### 7.2 Admin UI
- [ ] 현재 자기소개를 조회할 수 있는가?
- [ ] 마크다운 에디터가 정상 작동하는가?
- [ ] 미리보기가 정상적으로 표시되는가?
- [ ] 저장 기능이 정상 작동하는가?
- [ ] 에러 처리가 적절한가?

### 7.3 Frontend UI
- [ ] 마크다운이 올바르게 렌더링되는가?
- [ ] 스타일이 일관되게 적용되는가?
- [ ] 로딩 상태가 적절히 표시되는가?
- [ ] 에러 상태가 적절히 처리되는가?

---

## 8. 주의사항

1. **단일 레코드 관리**: 항상 최신 1개의 레코드만 사용
2. **마크다운 보안**: HTML 태그는 기본적으로 escape (보안 정책 준수)
3. **버전 관리**: 버전 히스토리 UI는 구현하지 않지만 DB에는 준비
4. **에러 처리**: 모든 API 호출에 적절한 에러 처리 필요
5. **캐시 무효화**: 저장 후 React Query 캐시 무효화 필수

---

**작성일**: 2026-01-10
**작성자**: AI Agent (Claude)
**상태**: 설계 완료
