# Epic E01: Backend SonarQube Issue Resolution

## 목표

- 백엔드 SonarQube 오픈 이슈 중 BLOCKER/CRITICAL/MAJOR 271건을 모두 해결한다
- BUG 5건(정규식 오류, InterruptedException 미처리, 미사용 반환값)이 0건이 된다
- BLOCKER 2건(항상 동일 값 반환 메서드, assertion 없는 테스트)이 0건이 된다
- Sonar 재분석 시 대상 범위 이슈가 재등장하지 않는다

## 배경 / 맥락

### 현재 상태

- 2026-03-29 스냅샷 기준 백엔드 OPEN 이슈 331건
- MINOR(46) + INFO(14) = 60건은 이번 범위에서 제외, 필요 시 점진적 개선
- 처리 대상: BLOCKER 2 / CRITICAL 42 / MAJOR 227 = **271건**

### 문제

- BUG 5건 중 정규식 backreference 오류(S6001)는 런타임 장애 가능성이 있다
- `Collectors.toList()` 잔존(S6204, 121건)은 이미 P07에서 일부 처리했으나 백엔드 미완료
- generic exception 사용(S112, 47건)은 에러 핸들링 정밀도를 떨어뜨린다

## 특이점

- SQ-02(이슈 처리 지침)의 배치 단위·루트 원인 확정·검증 게이트를 따른다
- MINOR/INFO는 scope 밖 — 별도 점진적 개선으로 처리 예정
- S6204(121건)와 S1128 등 기계적 치환 가능한 규칙은 병렬 에이전트로 빠르게 처리 가능
- S112(47건)와 S3776(16건)은 설계 판단이 필요하므로 루트 원인 분석 후 수정
- 백엔드는 Hexagonal Architecture — 레이어 경계를 깨뜨리지 않도록 주의

## Phase 목록

- [P01: BUG + BLOCKER 긴급 수정](./P01.bug-and-blocker-fixes.md)
- [P02: 기계적 치환 (S6204, S1128 등)](./P02.mechanical-replacements.md)
- [P03: Generic Exception 정리 (S112)](./P03.generic-exception-cleanup.md)
- [P04: 코드 품질 개선 (S1192, S3776 등 나머지)](./P04.code-quality-improvements.md)

## 상태

- [ ] P01 완료
- [ ] P02 완료
- [ ] P03 완료
- [ ] P04 완료
