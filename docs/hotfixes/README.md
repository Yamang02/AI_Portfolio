# 핫픽스 기록

에픽 없이 **긴급 반영한 결함 수정**만 요약한다. 배경·Phase·에픽 번호는 쓰지 않고, 재발 방지에 필요한 사실만 남긴다.

## 네이밍

`YYYY-MM-DD_{짧은-슬러그}.md` (예: `2026-04-03_redis-genericjackson2jsonserializer-spring-data.md`)

## 목록

| 날짜 | 문서 | 한 줄 |
|------|------|--------|
| 2026-04-03 | [redis-genericjackson2jsonserializer-spring-data](./2026-04-03_redis-genericjackson2jsonserializer-spring-data.md) | Redis 캐시: 직렬화기 일관성 + 목록 루트 record 래퍼 + `PortfolioApplicationService` 캐시 정렬 |

## 관련

- 에픽·아카이브와의 관계: 동일 주제의 과거 에픽([E03](../epic/archive/E03.2026-04-03_redis-cache-serialization-refactor/) 등)은 설계 이력용이며, 핫픽스 문서가 **현재 코드·운영 기준**을 우선한다.
