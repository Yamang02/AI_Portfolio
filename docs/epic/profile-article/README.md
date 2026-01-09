# Epic: Profile Article Management

## Overview

프로필 페이지의 자기소개를 마크다운으로 관리하고, 프로젝트와 연계 가능한 기술 아티클 게시판을 추가하는 에픽입니다.

---

## Documents

- [PRD (Product Requirements Document)](./PRD.md) - 요구사항 및 설계 문서

---

## Phase 0: Admin 공통 프레임 정비 (추천 선행)

### Goal
Admin 기능이 늘어나도 일관된 방식으로 빠르게 확장할 수 있도록, 통신/쿼리/테이블/에러 처리의 공통 프레임을 정리합니다.

### Key Decisions
- 인증: **세션 쿠키 고정** (`credentials: include`)
- Markdown: **HTML 렌더링은 현재 비활성**(escape), 필요 시 sanitize 전제로 향후 옵션화
- Article: 혼자 운영 기준이지만 **서버 페이징/정렬/필터 계약을 초기부터 확정**

### Deliverables
- 공통 Admin API 클라이언트(중복 fetch 제거)
- React Query 안정 옵션 유틸(리페치 중 이전 데이터 유지)
- Article 목록을 위한 테이블 표준 패턴 확정

---

## Phase 1: 자기소개 Markdown 관리

### Goal
프로필 페이지의 자기소개 섹션을 관리자 페이지에서 마크다운 형식으로 편집 가능하게 만듭니다.

### Deliverables
- ProfileIntroduction 도메인 (Backend)
- Admin 관리 UI (마크다운 에디터)
- Profile 페이지 마크다운 렌더링

---

## Phase 2: 기술 아티클 시스템

### Goal
프로젝트와 연계 가능한(Optional) 기술 아티클 게시판을 추가합니다.

### Deliverables
- Article 도메인 (Backend)
- Admin CRUD UI
- Frontend 게시글 목록/상세 페이지
- 프로젝트 연관 게시글 표시

---

## Status

**Current Phase**: Planning
**Branch**: `epic/profile_article`
**Start Date**: 2025-01-09

---

## Key Features

1. **자기소개 Markdown 관리**
   - 관리자 페이지에서 편집
   - 미리보기 기능
   - Profile 페이지 렌더링

2. **기술 아티클 게시판**
   - 프로젝트 연계 (Optional)
   - 카테고리/태그 분류
   - 기술 스택 연계
   - 상태 관리 (초안/발행/보관)
   - 정렬 순서 관리

---

## Architecture

### Backend
- Hexagonal Architecture (Ports & Adapters)
- Domain: `ProfileIntroduction`, `Article`
- Repository Pattern
- Cache Strategy (Admin: no cache, Public: cache)

### Frontend
- Feature-Sliced Design
- Entities → Features → Pages
- Shared 컴포넌트 재사용

---

## Tech Stack

### Backend
- Spring Boot
- PostgreSQL
- Flyway (마이그레이션)

### Frontend
- React + TypeScript
- React Query
- Markdown Editor: `@uiw/react-md-editor`
- Markdown Renderer: `react-markdown` + `remark-gfm`

---

## Related Documents

- [프로젝트 가이드](../../technical/guides/agent-development-guide.md)
- [백엔드 CRUD 템플릿](../../technical/guides/backend/crud-template-guide.md)
- [프론트엔드 CRUD 템플릿](../../technical/guides/frontend/crud-template-guide.md)

---

**작성일**: 2025-01-09
**작성자**: AI Agent (Claude)
