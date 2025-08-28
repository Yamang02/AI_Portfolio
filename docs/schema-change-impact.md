# PostgreSQL 스키마 변경이 Qdrant에 미치는 영향

## 🎯 스키마 변경 유형별 영향도 분석

### 1. 영향도 매트릭스

| 변경 유형 | Qdrant 영향도 | 대응 방법 | 예시 |
|-----------|---------------|-----------|------|
| **컬럼 추가** | 🟡 중간 | 점진적 업데이트 | `priority_score` 추가 |
| **컬럼 삭제** | 🔴 높음 | 전체 재벡터화 | `deprecated_field` 제거 |
| **컬럼명 변경** | 🔴 높음 | 매핑 업데이트 | `demo_url` → `live_url` |
| **데이터 타입 변경** | 🟡 중간 | 변환 로직 추가 | `TEXT` → `TEXT[]` |
| **테이블 추가** | 🟢 낮음 | 새 벡터 생성 | `personal_info` 테이블 |
| **테이블 삭제** | 🔴 높음 | 벡터 정리 | 사용하지 않는 테이블 |
| **인덱스 변경** | 🟢 없음 | 영향 없음 | 성능 최적화만 |

### 2. 구체적인 시나리오별 분석

#### 시나리오 A: 컬럼 추가 (낮은 영향)
```sql
-- PostgreSQL 스키마 변경
ALTER TABLE projects ADD COLUMN priority_score INTEGER DEFAULT 5;
ALTER TABLE projects ADD COLUMN project_summary TEXT;
```

**Qdrant 영향:**
```python
# 기존 벡터 데이터 (영향 없음)
{
    "id": "project_PJT001",
    "vector": [0.1, 0.2, ...],
    "payload": {
        "project_id": "PJT001",
        "content": "기존 콘텐츠...",
        "technologies": ["React", "Spring Boot"]
        # priority_score, project_summary 없음 (문제없음)
    }
}

# 새로운 벡터 데이터 (점진적 추가)
{
    "id": "project_PJT002_updated",
    "vector": [0.3, 0.4, ...],
    "payload": {
        "project_id": "PJT002",
        "content": "새로운 요약과 함께...",
        "technologies": ["Vue.js", "Node.js"],
        "priority_score": 8,  # 새 필드 추가
        "project_summary": "간단한 요약"  # 새 필드 추가
    }
}
```

**대응 전략:**
```python
class GradualVectorUpdate:
    async def handle_new_columns(self, table_name: str, new_columns: List[str]):
        """새 컬럼 추가 시 점진적 업데이트"""
        
        # 1. 기존 벡터는 그대로 유지
        # 2. 새로 업데이트되는 데이터만 새 필드 포함
        # 3. 검색 시 새 필드 없어도 정상 동작하도록 처리
        
        updated_projects = await self.postgres.get_recently_updated(
            table_name, 
            since=datetime.now() - timedelta(days=1)
        )
        
        for project in updated_projects:
            # 새 필드 포함하여 벡터 재생성
            await self.update_vector_with_new_fields(project)
```

#### 시나리오 B: 컬럼 삭제 (높은 영향)
```sql
-- PostgreSQL 스키마 변경
ALTER TABLE projects DROP COLUMN readme;  -- README 필드 제거
```

**Qdrant 영향:**
```python
# 문제: 기존 벡터에 삭제된 필드 참조
{
    "id": "project_PJT001",
    "payload": {
        "project_id": "PJT001",
        "readme_content": "삭제된 README 내용...",  # 더 이상 존재하지 않음
        "content": "README 내용을 포함한 벡터..."  # 벡터 자체도 오래된 정보
    }
}
```

**대응 전략:**
```python
class SchemaChangeHandler:
    async def handle_column_deletion(self, table_name: str, deleted_columns: List[str]):
        """컬럼 삭제 시 전체 재벡터화"""
        
        # 1. 영향받는 모든 벡터 식별
        affected_vectors = await self.qdrant.scroll(
            collection_name="portfolio",
            scroll_filter={
                "must": [
                    {"key": "source_table", "match": {"value": table_name}}
                ]
            }
        )
        
        # 2. 삭제된 필드 제거 및 재벡터화
        for vector in affected_vectors:
            # 삭제된 필드 제거
            cleaned_payload = self.remove_deleted_fields(
                vector.payload, 
                deleted_columns
            )
            
            # 새로운 콘텐츠로 벡터 재생성
            new_content = await self.regenerate_content(cleaned_payload)
            new_vector = await self.embedding_service.encode(new_content)
            
            # Qdrant 업데이트
            await self.qdrant.upsert(
                collection_name="portfolio",
                points=[{
                    "id": vector.id,
                    "vector": new_vector,
                    "payload": cleaned_payload
                }]
            )
```

#### 시나리오 C: 컬럼명 변경 (높은 영향)
```sql
-- PostgreSQL 스키마 변경
ALTER TABLE projects RENAME COLUMN demo_url TO live_url;
ALTER TABLE experiences RENAME COLUMN company TO organization;
```

**Qdrant 영향:**
```python
# 문제: 필드명 불일치
{
    "payload": {
        "demo_url": "https://old-demo.com",  # 더 이상 사용하지 않는 필드명
        "company": "Old Company Name"        # 변경된 필드명
    }
}

# 해결: 매핑 업데이트 필요
{
    "payload": {
        "live_url": "https://old-demo.com",     # 새 필드명으로 변경
        "organization": "Old Company Name"      # 새 필드명으로 변경
    }
}
```

**대응 전략:**
```python
class FieldMappingUpdater:
    def __init__(self):
        self.field_mappings = {
            "demo_url": "live_url",
            "company": "organization",
            "position": "role"
        }
    
    async def handle_column_rename(self, old_name: str, new_name: str):
        """컬럼명 변경 시 벡터 메타데이터 업데이트"""
        
        # 1. 매핑 테이블 업데이트
        self.field_mappings[old_name] = new_name
        
        # 2. 모든 관련 벡터 업데이트
        await self.batch_update_field_names(old_name, new_name)
    
    async def batch_update_field_names(self, old_name: str, new_name: str):
        """배치로 필드명 업데이트"""
        
        # 영향받는 벡터들 조회
        vectors = await self.qdrant.scroll(
            collection_name="portfolio",
            scroll_filter={
                "must": [
                    {"key": old_name, "match": {"any": ["*"]}}  # 해당 필드가 있는 벡터들
                ]
            }
        )
        
        # 배치 업데이트
        update_points = []
        for vector in vectors:
            if old_name in vector.payload:
                # 필드명 변경
                vector.payload[new_name] = vector.payload.pop(old_name)
                update_points.append({
                    "id": vector.id,
                    "payload": vector.payload
                })
        
        # Qdrant 배치 업데이트
        await self.qdrant.upsert(
            collection_name="portfolio",
            points=update_points
        )
```

### 3. 스키마 변경 감지 및 자동 대응

#### A. 스키마 변경 감지 시스템
```python
class SchemaChangeDetector:
    def __init__(self):
        self.last_schema_snapshot = {}
    
    async def detect_schema_changes(self):
        """PostgreSQL 스키마 변경 감지"""
        
        current_schema = await self.get_current_schema()
        changes = self.compare_schemas(self.last_schema_snapshot, current_schema)
        
        if changes:
            await self.handle_schema_changes(changes)
            self.last_schema_snapshot = current_schema
        
        return changes
    
    async def get_current_schema(self):
        """현재 스키마 정보 조회"""
        query = """
        SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
        """
        return await self.postgres.fetch_all(query)
    
    def compare_schemas(self, old_schema, new_schema):
        """스키마 변경사항 비교"""
        changes = {
            "added_columns": [],
            "deleted_columns": [],
            "renamed_columns": [],
            "type_changes": []
        }
        
        # 변경사항 분석 로직
        # ...
        
        return changes
```

#### B. 자동 대응 워크플로우
```python
class AutoSchemaSync:
    async def handle_schema_changes(self, changes):
        """스키마 변경에 따른 자동 대응"""
        
        for change_type, change_details in changes.items():
            
            if change_type == "added_columns":
                # 점진적 업데이트 (낮은 우선순위)
                await self.schedule_gradual_update(change_details)
                
            elif change_type == "deleted_columns":
                # 즉시 전체 재벡터화 (높은 우선순위)
                await self.schedule_full_revectorization(change_details)
                
            elif change_type == "renamed_columns":
                # 메타데이터 매핑 업데이트 (중간 우선순위)
                await self.schedule_field_mapping_update(change_details)
                
            elif change_type == "type_changes":
                # 데이터 변환 후 재벡터화
                await self.schedule_type_conversion_update(change_details)
```

### 4. 마이그레이션 전략

#### A. 무중단 마이그레이션
```python
class ZeroDowntimeMigration:
    async def migrate_schema_changes(self, changes):
        """무중단 스키마 마이그레이션"""
        
        # 1. 새로운 임시 컬렉션 생성
        temp_collection = f"portfolio_migration_{int(time.time())}"
        await self.qdrant.create_collection(temp_collection)
        
        # 2. 새 스키마로 모든 데이터 재벡터화
        await self.revectorize_all_data(temp_collection, new_schema=True)
        
        # 3. 원자적 컬렉션 교체
        await self.atomic_collection_swap("portfolio", temp_collection)
        
        # 4. 기존 컬렉션 정리
        await self.qdrant.delete_collection(temp_collection)
```

#### B. 점진적 마이그레이션
```python
class GradualMigration:
    async def gradual_schema_update(self, changes):
        """점진적 스키마 업데이트"""
        
        # 1. 변경 우선순위 결정
        priority_queue = self.prioritize_changes(changes)
        
        # 2. 배치 단위로 처리
        for batch in self.create_batches(priority_queue):
            await self.process_batch(batch)
            await asyncio.sleep(1)  # 시스템 부하 방지
```

### 5. 모니터링 및 알림

```python
class SchemaSyncMonitor:
    async def monitor_sync_status(self):
        """동기화 상태 모니터링"""
        
        sync_status = {
            "postgres_schema_version": await self.get_postgres_schema_version(),
            "qdrant_schema_version": await self.get_qdrant_schema_version(),
            "sync_lag_minutes": await self.calculate_sync_lag(),
            "pending_migrations": await self.get_pending_migrations()
        }
        
        if sync_status["sync_lag_minutes"] > 60:  # 1시간 이상 지연
            await self.send_alert("Schema sync lag detected", sync_status)
        
        return sync_status
```

## 🎯 결론 및 권장사항

### 1. **스키마 변경 영향도**
- **낮음**: 컬럼 추가, 인덱스 변경
- **중간**: 데이터 타입 변경, 새 테이블 추가
- **높음**: 컬럼 삭제, 컬럼명 변경, 테이블 삭제

### 2. **대응 전략**
- **점진적 업데이트**: 새 컬럼 추가 시
- **전체 재벡터화**: 컬럼 삭제, 구조적 변경 시
- **메타데이터 매핑**: 컬럼명 변경 시
- **무중단 마이그레이션**: 대규모 변경 시

### 3. **모범 사례**
- 스키마 변경 전 영향도 분석
- 자동 감지 및 알림 시스템 구축
- 단계적 마이그레이션 계획 수립
- 롤백 계획 준비

이렇게 하면 PostgreSQL 스키마 변경이 있어도 Qdrant와의 일관성을 유지할 수 있습니다!