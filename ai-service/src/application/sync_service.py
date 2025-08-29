"""
Synchronization Service - Application Layer (Hexagonal Architecture)
데이터 동기화 및 벡터화 관리 서비스
"""

import asyncio
import logging
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from ..adapters.secondary.database.postgres_adapter import PostgreSQLAdapter
from ..adapters.secondary.vector.qdrant_adapter import QdrantAdapter
from .knowledge_base_service import KnowledgeBaseService
from ..core.domain.models import Document

logger = logging.getLogger(__name__)


class SyncService:
    """데이터 동기화 서비스"""
    
    def __init__(
        self,
        postgres_adapter: PostgreSQLAdapter,
        qdrant_adapter: QdrantAdapter,
        knowledge_base_service: KnowledgeBaseService
    ):
        self.postgres_adapter = postgres_adapter
        self.qdrant_adapter = qdrant_adapter
        self.knowledge_base_service = knowledge_base_service
        
        # 동기화 상태
        self.sync_status = {
            "last_sync": None,
            "is_syncing": False,
            "sync_errors": [],
            "sync_stats": {}
        }

    async def sync_single_item(
        self, 
        content_type: str, 
        content_id: str
    ) -> Dict[str, Any]:
        """단일 항목 동기화"""
        start_time = time.time()
        
        try:
            logger.info(f"Starting sync for {content_type}:{content_id}")
            
            # 1. PostgreSQL에서 데이터 조회
            postgres_data = await self.postgres_adapter.get_content_by_id(
                content_type=content_type,
                content_id=content_id
            )
            
            if not postgres_data:
                return {
                    "success": False,
                    "error": f"Content not found: {content_type}:{content_id}",
                    "processing_time": time.time() - start_time
                }
            
            # 2. Knowledge Base로 데이터 풍성화
            enriched_content = self.knowledge_base_service.enrich_data(postgres_data)
            
            # 3. Document 객체 생성
            document = Document(
                id=f"{content_type}_{content_id}",
                content=enriched_content,
                source=f"postgres_{content_type}",
                metadata={
                    **postgres_data,
                    "sync_timestamp": datetime.now().isoformat(),
                    "enriched": True
                }
            )
            
            # 4. Qdrant에 벡터화하여 저장
            vector_result = await self.qdrant_adapter.add_document(document)
            
            processing_time = time.time() - start_time
            
            logger.info(f"Successfully synced {content_type}:{content_id} in {processing_time:.2f}s")
            
            return {
                "success": True,
                "content_type": content_type,
                "content_id": content_id,
                "processing_time": processing_time,
                "enriched_content_length": len(enriched_content),
                "vector_result": vector_result
            }
            
        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = f"Sync failed for {content_type}:{content_id}: {str(e)}"
            logger.error(error_msg)
            
            return {
                "success": False,
                "content_type": content_type,
                "content_id": content_id,
                "error": error_msg,
                "processing_time": processing_time
            }

    async def sync_all_data(
        self, 
        content_types: Optional[List[str]] = None,
        force_update: bool = False
    ) -> Dict[str, Any]:
        """전체 데이터 동기화"""
        
        if self.sync_status["is_syncing"] and not force_update:
            return {
                "success": False,
                "error": "Sync already in progress",
                "current_status": self.sync_status
            }
        
        self.sync_status["is_syncing"] = True
        self.sync_status["sync_errors"] = []
        sync_start_time = time.time()
        
        try:
            logger.info(f"Starting full data sync (content_types: {content_types})")
            
            # 1. PostgreSQL에서 모든 데이터 조회
            all_data = await self.postgres_adapter.get_portfolio_data(
                content_types=content_types,
                limit=1000  # 필요시 증가
            )
            
            if not all_data:
                return {
                    "success": False,
                    "error": "No data found in PostgreSQL",
                    "processing_time": time.time() - sync_start_time
                }
            
            # 2. 병렬 동기화 (배치 처리)
            sync_results = []
            batch_size = 5  # 동시 처리 수
            
            for i in range(0, len(all_data), batch_size):
                batch = all_data[i:i + batch_size]
                
                tasks = [
                    self.sync_single_item(
                        item["content_type"], 
                        item["content_id"]
                    )
                    for item in batch
                ]
                
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for result in batch_results:
                    if isinstance(result, Exception):
                        error_result = {
                            "success": False,
                            "error": str(result),
                            "processing_time": 0
                        }
                        sync_results.append(error_result)
                        self.sync_status["sync_errors"].append(str(result))
                    else:
                        sync_results.append(result)
                
                # 배치 간 잠깐 대기 (리소스 관리)
                await asyncio.sleep(0.5)
            
            # 3. 결과 집계
            successful_syncs = [r for r in sync_results if r.get("success", False)]
            failed_syncs = [r for r in sync_results if not r.get("success", False)]
            
            total_processing_time = time.time() - sync_start_time
            
            self.sync_status.update({
                "last_sync": datetime.now().isoformat(),
                "is_syncing": False,
                "sync_stats": {
                    "total_items": len(all_data),
                    "successful_syncs": len(successful_syncs),
                    "failed_syncs": len(failed_syncs),
                    "total_processing_time": total_processing_time,
                    "avg_processing_time": total_processing_time / len(sync_results) if sync_results else 0
                }
            })
            
            logger.info(f"Full sync completed: {len(successful_syncs)}/{len(all_data)} successful")
            
            return {
                "success": True,
                "total_items": len(all_data),
                "successful_syncs": len(successful_syncs),
                "failed_syncs": len(failed_syncs),
                "processing_time": total_processing_time,
                "sync_results": sync_results,
                "sync_status": self.sync_status
            }
            
        except Exception as e:
            self.sync_status["is_syncing"] = False
            error_msg = f"Full sync failed: {str(e)}"
            logger.error(error_msg)
            
            return {
                "success": False,
                "error": error_msg,
                "processing_time": time.time() - sync_start_time,
                "sync_status": self.sync_status
            }
        
        finally:
            self.sync_status["is_syncing"] = False

    async def sync_recent_changes(self, hours: int = 24) -> Dict[str, Any]:
        """최근 변경사항만 동기화"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            # PostgreSQL에서 최근 변경된 데이터만 조회
            # 실제로는 updated_at 필드로 필터링하는 쿼리 필요
            all_data = await self.postgres_adapter.get_portfolio_data(limit=1000)
            
            # 임시로 모든 데이터를 가져와서 필터링 (실제로는 쿼리에서 필터링 필요)
            recent_data = [
                item for item in all_data
                if item.get("last_updated") and 
                   datetime.fromisoformat(str(item["last_updated"])) > cutoff_time
            ]
            
            if not recent_data:
                return {
                    "success": True,
                    "message": f"No changes in the last {hours} hours",
                    "total_items": 0
                }
            
            # 최근 변경사항 동기화
            sync_results = []
            for item in recent_data:
                result = await self.sync_single_item(
                    item["content_type"],
                    item["content_id"]
                )
                sync_results.append(result)
            
            successful = [r for r in sync_results if r.get("success", False)]
            
            return {
                "success": True,
                "total_items": len(recent_data),
                "successful_syncs": len(successful),
                "failed_syncs": len(recent_data) - len(successful),
                "sync_results": sync_results
            }
            
        except Exception as e:
            logger.error(f"Recent changes sync failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def validate_sync_integrity(self) -> Dict[str, Any]:
        """동기화 무결성 검증"""
        try:
            # PostgreSQL 데이터 개수
            postgres_stats = await self.postgres_adapter.get_statistics()
            postgres_total = postgres_stats.get("total", 0)
            
            # Qdrant 벡터 개수
            qdrant_stats = await self.qdrant_adapter.get_statistics()
            qdrant_total = qdrant_stats.get("total_vectors", 0)
            
            # 무결성 검증
            integrity_issues = []
            
            if postgres_total == 0:
                integrity_issues.append("No data in PostgreSQL")
            
            if qdrant_total == 0:
                integrity_issues.append("No vectors in Qdrant")
            
            # 데이터 개수 차이 확인 (벡터 청크로 인해 Qdrant가 더 많을 수 있음)
            if postgres_total > qdrant_total:
                integrity_issues.append(f"PostgreSQL has more items ({postgres_total}) than Qdrant ({qdrant_total})")
            
            sync_coverage = (min(postgres_total, qdrant_total) / max(postgres_total, 1)) * 100
            
            return {
                "success": len(integrity_issues) == 0,
                "postgres_items": postgres_total,
                "qdrant_vectors": qdrant_total,
                "sync_coverage_percent": round(sync_coverage, 2),
                "integrity_issues": integrity_issues,
                "postgres_stats": postgres_stats,
                "qdrant_stats": qdrant_stats
            }
            
        except Exception as e:
            logger.error(f"Integrity validation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_sync_status(self) -> Dict[str, Any]:
        """동기화 상태 조회"""
        return self.sync_status.copy()

    async def clear_all_vectors(self) -> Dict[str, Any]:
        """모든 벡터 삭제 (재동기화 준비)"""
        try:
            result = await self.qdrant_adapter.clear_all()
            logger.info("All vectors cleared from Qdrant")
            return result
        except Exception as e:
            logger.error(f"Failed to clear vectors: {e}")
            return {"success": False, "error": str(e)}


class WebhookSyncService:
    """Webhook 기반 동기화 서비스"""
    
    def __init__(self, sync_service: SyncService):
        self.sync_service = sync_service
        self.webhook_queue = asyncio.Queue()
        self.is_processing = False
    
    async def handle_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Webhook 이벤트 처리"""
        try:
            content_type = webhook_data.get("content_type")
            content_id = webhook_data.get("content_id")
            action = webhook_data.get("action", "update")  # create, update, delete
            
            if not content_type or not content_id:
                return {
                    "success": False,
                    "error": "Missing content_type or content_id"
                }
            
            # 큐에 추가
            await self.webhook_queue.put({
                "content_type": content_type,
                "content_id": content_id,
                "action": action,
                "timestamp": datetime.now().isoformat(),
                "webhook_data": webhook_data
            })
            
            # 처리 시작 (백그라운드)
            if not self.is_processing:
                asyncio.create_task(self._process_webhook_queue())
            
            return {
                "success": True,
                "message": "Webhook queued for processing",
                "queue_size": self.webhook_queue.qsize()
            }
            
        except Exception as e:
            logger.error(f"Webhook handling failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _process_webhook_queue(self):
        """Webhook 큐 처리 (백그라운드 태스크)"""
        self.is_processing = True
        
        try:
            while not self.webhook_queue.empty():
                webhook_item = await self.webhook_queue.get()
                
                try:
                    content_type = webhook_item["content_type"]
                    content_id = webhook_item["content_id"]
                    action = webhook_item["action"]
                    
                    if action == "delete":
                        # 벡터 삭제
                        document_id = f"{content_type}_{content_id}"
                        await self.sync_service.qdrant_adapter.delete_document(document_id)
                        logger.info(f"Deleted vector for {content_type}:{content_id}")
                    
                    else:
                        # 생성 또는 업데이트
                        result = await self.sync_service.sync_single_item(content_type, content_id)
                        
                        if result.get("success"):
                            logger.info(f"Webhook sync successful for {content_type}:{content_id}")
                        else:
                            logger.error(f"Webhook sync failed: {result.get('error')}")
                    
                    # 처리 완료 표시
                    self.webhook_queue.task_done()
                    
                    # 다음 처리 전 잠시 대기
                    await asyncio.sleep(0.1)
                    
                except Exception as e:
                    logger.error(f"Failed to process webhook item: {e}")
                    self.webhook_queue.task_done()
        
        finally:
            self.is_processing = False
    
    def get_queue_status(self) -> Dict[str, Any]:
        """큐 상태 조회"""
        return {
            "queue_size": self.webhook_queue.qsize(),
            "is_processing": self.is_processing
        }