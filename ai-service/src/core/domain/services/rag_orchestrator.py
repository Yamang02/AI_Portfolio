"""
RAG Orchestrator
전체 RAG 파이프라인을 조율하는 중앙 서비스
임베딩 기반 지능형 분류와 동적 전략 선택 사용
"""

from typing import Dict, Any, List, Optional
import logging
import asyncio
from datetime import datetime
import time

from .intelligent_query_classifier import IntelligentQueryClassifier, QueryClassification, QueryType
from ..strategies.adaptive_strategy_factory import AdaptiveStrategyFactory, ConfigurableStrategy
from ..strategies.base_strategy import RAGStrategy
from ..models import RAGQuery, RAGResult
from ...ports.document_loader_port import DocumentLoaderPort
from ...ports.text_splitter_port import TextSplitterPort  
from ...ports.embedding_port import EmbeddingPort
from ...ports.vector_port import VectorPort

logger = logging.getLogger(__name__)


class RAGOrchestrator:
    """지능형 RAG 파이프라인 조율자"""
    
    def __init__(
        self,
        document_loader: DocumentLoaderPort,
        text_splitter: TextSplitterPort,
        embedding_service: EmbeddingPort,
        vector_store: VectorPort,
        query_classifier: Optional[IntelligentQueryClassifier] = None,
        strategy_factory: Optional[AdaptiveStrategyFactory] = None
    ):
        """RAG Orchestrator 초기화"""
        
        # 핵심 컴포넌트들
        self.document_loader = document_loader
        self.text_splitter = text_splitter
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        
        # 지능형 분류기 (임베딩 기반)
        self.query_classifier = query_classifier or IntelligentQueryClassifier()
        
        # 동적 전략 팩토리
        self.strategy_factory = strategy_factory or AdaptiveStrategyFactory()
        
        # 전략들 로드
        self.strategies: List[RAGStrategy] = []
        self._load_strategies()
        
        # 성능 메트릭
        self.performance_metrics = {
            'total_queries': 0,
            'successful_queries': 0,
            'average_response_time': 0.0,
            'classification_accuracy': 0.0,
            'strategy_usage': {}
        }
        
        # 파이프라인 상태
        self.is_initialized = False
        
    def _load_strategies(self):
        """전략들 로드 (템플릿 + 설정 파일)"""
        try:
            # 1. 기본 템플릿 전략들
            template_strategies = self.strategy_factory.get_all_template_strategies()
            self.strategies.extend(template_strategies)
            
            # 2. 설정 파일 전략들 (있다면)
            file_strategies = self.strategy_factory.load_strategies_from_directory()
            self.strategies.extend(file_strategies)
            
            # 성능 통계 초기화
            for strategy in self.strategies:
                self.performance_metrics['strategy_usage'][strategy.strategy_name] = 0
                
            logger.info(f"RAG 전략 로드 완료: {len(self.strategies)}개")
            
        except Exception as e:
            logger.error(f"전략 로드 실패: {e}")
            # 최소한 하나의 기본 전략이라도 생성
            default_strategy = self.strategy_factory.create_strategy_from_template('project_focused')
            self.strategies = [default_strategy]
    
    async def initialize(self):
        """RAG 시스템 초기화"""
        if self.is_initialized:
            return
            
        logger.info("RAG Orchestrator 초기화 시작...")
        
        try:
            # 각 컴포넌트 초기화 체크
            await self._verify_components()
            
            # 쿼리 분류기 준비 상태 확인
            classifier_stats = self.query_classifier.get_classification_stats()
            logger.info(f"쿼리 분류기 준비 완료: {classifier_stats}")
            
            self.is_initialized = True
            logger.info("RAG Orchestrator 초기화 완료")
            
        except Exception as e:
            logger.error(f"RAG Orchestrator 초기화 실패: {e}")
            raise
    
    async def _verify_components(self):
        """핵심 컴포넌트들 동작 확인"""
        try:
            # Document Loader 테스트
            test_docs = await self.document_loader.load_documents(limit=1)
            logger.info(f"Document Loader 확인: {len(test_docs)}개 문서")
            
            # Text Splitter 테스트 (문서가 있다면)
            if test_docs:
                test_chunks = await self.text_splitter.split_documents(test_docs[:1])
                logger.info(f"Text Splitter 확인: {len(test_chunks)}개 청크")
            
            # Embedding 서비스 테스트
            test_embedding = await self.embedding_service.encode_texts(["테스트 텍스트"])
            logger.info(f"Embedding Service 확인: {len(test_embedding)}개 임베딩")
            
        except Exception as e:
            logger.warning(f"컴포넌트 검증 중 오류 (계속 진행): {e}")
    
    async def process_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """지능형 RAG 쿼리 처리 (전체 파이프라인)"""
        
        if not self.is_initialized:
            await self.initialize()
            
        start_time = time.time()
        
        if context is None:
            context = {}
            
        try:
            # 1. 지능형 쿼리 분류
            classification = await self.query_classifier.classify_query(query)
            logger.info(f"쿼리 분류: {classification.query_type.value} (신뢰도: {classification.confidence:.3f})")
            
            # 2. 최적 전략 선택
            selected_strategy = await self._select_optimal_strategy(query, classification)
            
            # 3. RAG 쿼리 객체 생성
            rag_query = RAGQuery(question=query)
            
            # 4. 선택된 전략으로 실행
            enhanced_context = await selected_strategy.execute(rag_query, context)
            
            # 5. 실제 RAG 파이프라인 실행
            rag_result = await self._execute_rag_pipeline(rag_query, enhanced_context)
            
            # 6. 결과에 분류 정보 추가
            rag_result.update({
                'query_classification': {
                    'type': classification.query_type.value,
                    'confidence': classification.confidence,
                    'reasoning': classification.reasoning,
                    'alternatives': [(alt[0].value, alt[1]) for alt in classification.alternative_types]
                },
                'selected_strategy': selected_strategy.strategy_name,
                'total_processing_time_ms': (time.time() - start_time) * 1000
            })
            
            # 7. 성능 메트릭 업데이트
            self._update_metrics(selected_strategy.strategy_name, time.time() - start_time, True)
            
            logger.info(f"RAG 쿼리 처리 완료: {(time.time() - start_time) * 1000:.1f}ms")
            
            return rag_result
            
        except Exception as e:
            logger.error(f"RAG 쿼리 처리 오류: {e}")
            
            # 오류 시 기본 응답
            error_result = {
                'error': str(e),
                'query': query,
                'processing_time_ms': (time.time() - start_time) * 1000,
                'fallback_response': "죄송합니다. 요청을 처리하는 중 오류가 발생했습니다."
            }
            
            self._update_metrics('error', time.time() - start_time, False)
            
            return error_result
    
    async def _select_optimal_strategy(self, query: str, classification: QueryClassification) -> RAGStrategy:
        """분류 결과를 바탕으로 최적 전략 선택"""
        
        # 각 전략의 적합도 점수 계산
        strategy_scores = []
        
        for strategy in self.strategies:
            try:
                score = strategy.can_handle(query, classification.query_type)
                
                # 분류 신뢰도를 반영한 보정 점수
                confidence_boost = classification.confidence * 0.2
                adjusted_score = score + confidence_boost
                
                strategy_scores.append((strategy, adjusted_score, score))
                
            except Exception as e:
                logger.warning(f"전략 {strategy.strategy_name} 점수 계산 오류: {e}")
                strategy_scores.append((strategy, 0.0, 0.0))
        
        # 점수순 정렬
        strategy_scores.sort(key=lambda x: x[1], reverse=True)
        
        if not strategy_scores or strategy_scores[0][1] == 0:
            logger.warning("적합한 전략을 찾지 못해 첫 번째 전략 사용")
            return self.strategies[0]
        
        selected_strategy = strategy_scores[0][0]
        selected_score = strategy_scores[0][1]
        original_score = strategy_scores[0][2]
        
        logger.info(
            f"전략 선택: {selected_strategy.strategy_name} "
            f"(원점수: {original_score:.3f}, 보정점수: {selected_score:.3f})"
        )
        
        return selected_strategy
    
    async def _execute_rag_pipeline(self, rag_query: RAGQuery, context: Dict[str, Any]) -> Dict[str, Any]:
        """실제 RAG 파이프라인 실행"""
        
        try:
            # 1. 문서 로드
            document_filters = context.get('document_filters', {})
            documents = await self.document_loader.load_documents(filters=document_filters)
            logger.info(f"문서 로드: {len(documents)}개")
            
            if not documents:
                return {
                    'answer': "관련 문서를 찾을 수 없습니다.",
                    'source_documents': [],
                    'retrieval_info': {'documents_found': 0}
                }
            
            # 2. 텍스트 분할
            text_splitter_config = context.get('text_splitter_config', {})
            chunks = await self.text_splitter.split_documents(
                documents, 
                **text_splitter_config
            )
            logger.info(f"텍스트 분할: {len(chunks)}개 청크")
            
            # 3. 임베딩 생성
            embedding_config = context.get('embedding_config', {})
            chunk_texts = [chunk.content for chunk in chunks]
            embeddings = await self.embedding_service.encode_texts(
                chunk_texts,
                **embedding_config
            )
            logger.info(f"임베딩 생성: {len(embeddings)}개")
            
            # 4. 벡터 검색
            search_config = context.get('search_config', {})
            query_embedding = await self.embedding_service.encode_texts([rag_query.question])
            
            retrieval_results = await self.vector_store.similarity_search(
                query_vectors=query_embedding,
                top_k=search_config.get('top_k', 6),
                threshold=search_config.get('similarity_threshold', 0.7),
                **search_config
            )
            
            logger.info(f"벡터 검색: {len(retrieval_results)}개 결과")
            
            # 5. 결과 구성
            result = {
                'answer': self._generate_answer_from_context(rag_query.question, retrieval_results),
                'source_documents': [
                    {
                        'content': result.get('content', ''),
                        'metadata': result.get('metadata', {}),
                        'similarity_score': result.get('score', 0.0)
                    }
                    for result in retrieval_results
                ],
                'retrieval_info': {
                    'documents_loaded': len(documents),
                    'chunks_created': len(chunks),
                    'embeddings_generated': len(embeddings),
                    'results_found': len(retrieval_results),
                    'search_config': search_config
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"RAG 파이프라인 실행 오류: {e}")
            raise
    
    def _generate_answer_from_context(self, question: str, retrieval_results: List[Dict[str, Any]]) -> str:
        """검색 결과를 바탕으로 답변 생성 (간단한 템플릿 기반)"""
        
        if not retrieval_results:
            return "관련 정보를 찾을 수 없습니다."
        
        # 상위 결과들에서 컨텍스트 추출
        contexts = []
        for result in retrieval_results[:3]:  # 상위 3개 결과만 사용
            content = result.get('content', '')
            if content.strip():
                contexts.append(content.strip())
        
        if not contexts:
            return "관련 내용을 추출할 수 없습니다."
        
        # 간단한 템플릿 기반 답변 생성
        combined_context = '\n\n'.join(contexts)
        
        answer = f"""질문에 대한 관련 정보를 찾았습니다:

{combined_context}

위 내용을 바탕으로 질문에 답변드리면, 더 구체적인 정보가 필요하시면 추가로 문의해 주세요."""
        
        return answer
    
    def _update_metrics(self, strategy_name: str, processing_time: float, success: bool):
        """성능 메트릭 업데이트"""
        self.performance_metrics['total_queries'] += 1
        
        if success:
            self.performance_metrics['successful_queries'] += 1
        
        # 이동 평균 계산
        total = self.performance_metrics['total_queries']
        current_avg = self.performance_metrics['average_response_time']
        self.performance_metrics['average_response_time'] = (
            (current_avg * (total - 1) + processing_time * 1000) / total
        )
        
        # 전략별 사용 횟수
        if strategy_name in self.performance_metrics['strategy_usage']:
            self.performance_metrics['strategy_usage'][strategy_name] += 1
    
    def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 정보 반환"""
        return {
            'initialized': self.is_initialized,
            'total_strategies': len(self.strategies),
            'strategies': [s.strategy_name for s in self.strategies],
            'performance_metrics': self.performance_metrics.copy(),
            'classifier_info': self.query_classifier.get_classification_stats(),
            'factory_info': self.strategy_factory.get_strategy_info()
        }
    
    async def optimize_system(self):
        """시스템 최적화 수행"""
        logger.info("RAG 시스템 최적화 시작...")
        
        # 성능이 낮은 전략들 식별
        total_queries = self.performance_metrics['total_queries']
        if total_queries > 50:  # 충분한 데이터가 있을 때만
            
            underperforming_strategies = []
            for strategy_name, usage_count in self.performance_metrics['strategy_usage'].items():
                usage_rate = usage_count / total_queries
                if usage_rate < 0.05 and usage_count > 5:  # 사용률 5% 미만
                    underperforming_strategies.append(strategy_name)
            
            if underperforming_strategies:
                logger.info(f"사용률이 낮은 전략들: {underperforming_strategies}")
        
        logger.info("RAG 시스템 최적화 완료")
        
        return {
            'optimized': True,
            'optimization_timestamp': datetime.now().isoformat(),
            'system_status': self.get_system_status()
        }