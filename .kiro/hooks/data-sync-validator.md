# 데이터 동기화 검증 Hook

## 트리거 조건
- PostgreSQL 포트폴리오 데이터 변경 시
- 벡터 DB 동기화 작업 완료 후
- 매주 일요일 오후 (정기 검증)

## 실행 작업
1. PostgreSQL과 벡터 DB 데이터 일관성 검증
2. 임베딩 품질 검사 (유사도 점수 분포)
3. 누락된 데이터 감지 및 복구
4. 동기화 성능 메트릭 수집

## 검증 항목
```python
validation_checks = {
    "data_consistency": {
        "postgres_record_count": "SELECT COUNT(*) FROM projects",
        "vector_db_record_count": "qdrant_client.count(collection='portfolio')",
        "match_threshold": 0.95  # 95% 일치율
    },
    "embedding_quality": {
        "avg_similarity_score": "> 0.7",
        "embedding_dimension": "== 384",
        "null_embeddings": "== 0"
    },
    "sync_performance": {
        "last_sync_duration": "< 300 seconds",
        "sync_success_rate": "> 99%"
    }
}
```

## 복구 작업
- 불일치 데이터 자동 재동기화
- 손상된 임베딩 재생성
- 동기화 실패 로그 분석 및 재시도