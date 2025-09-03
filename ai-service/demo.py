"""
HuggingFace Spaces Demo Entry Point
Hexagonal Architecture RAG Demo for AI Portfolio
"""

import asyncio
import gradio as gr
import logging
from typing import List, Tuple, Dict, Any
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import hexagonal architecture components
from src.application.services.rag_hexagonal_service import RAGHexagonalService
from src.adapters.outbound.llm.mock_llm_adapter import MockLLMAdapter
from src.adapters.outbound.databases.vector.vector_adapter_factory import VectorAdapterFactory


# 프로덕션 설정 공유를 위한 import
try:
    from src.shared.config.config_manager import ConfigManager
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False
    logger.warning("ConfigLoader not available, using fallback configuration")


class RAGDemoInterface:
    """RAG 데모를 위한 Gradio 인터페이스"""
    
    def __init__(self):
        # 프로덕션 설정 매니저 초기화
        self.config_manager = None
        if CONFIG_AVAILABLE:
            try:
                self.config_manager = ConfigManager()
                logger.info("✅ Production config manager initialized")
            except Exception as e:
                logger.warning(f"⚠️ Failed to initialize config manager: {e}")
        
        # Initialize hexagonal architecture components
        self.llm_adapter = MockLLMAdapter()
        
        # 벡터스토어 팩토리 (데모 환경용)
        self.vector_adapter_factory = VectorAdapterFactory(environment="demo")
        
        
        
        # 벡터 어댑터 생성 (RAGService 호환용)
        self.vector_adapter = self.vector_adapter_factory.create_vector_adapter()
        
        self.rag_service = RAGHexagonalService(
            vector_store=self.vector_adapter,  # Vector Adapter 사용
            llm_port=self.llm_adapter,
            config_manager=self.config_manager  # 프로덕션 설정 공유
        )
        self.initialized = False
        self.sample_data_loaded = False
        logger.info("✅ Hexagonal RAG Demo initialized with production config sharing")

    async def initialize(self):
        """비동기 초기화 (임베딩 모델 로드)"""
        if self.initialized:
            return
            
        try:
            logger.info("🔄 Initializing LLM and Vector adapters...")
            await self.llm_adapter.initialize()
            
            self.initialized = True
            logger.info("✅ All adapters initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize adapters: {e}")
            raise

    def load_sample_data(self) -> str:
        """sampledata 디렉토리에서 샘플 데이터 로드 (경량화)"""
        try:
            # sampledata 디렉토리 경로 설정
            sample_path = Path("sampledata")
            
            if not sample_path.exists():
                return "❌ sampledata 디렉토리를 찾을 수 없습니다"
            
            logger.info(f"📚 샘플 데이터 로드 시작: {sample_path}")
            sample_data = []
            
            # 핵심 문서만 선택 (경량화)
            core_files = [
                ("ai-portfolio.md", "AI 포트폴리오 프로젝트 개요"),
                ("qa_architecture.md", "헥사고날 아키텍처 Q&A"),
                ("qa_ai-services.md", "RAG 시스템 Q&A")
            ]
            
            for filename, title in core_files:
                file_path = sample_path / filename
                logger.info(f"🔍 파일 확인: {file_path} (존재: {file_path.exists()})")
                if file_path.exists():
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # 내용을 간단하게 요약 (첫 2000자만)
                        if len(content) > 2000:
                            content = content[:2000] + "\n\n... (내용이 길어서 일부만 포함)"
                        sample_data.append({
                            "content": content,
                            "source": filename,
                            "title": title
                        })
                        logger.info(f"✅ {title} 로드 완료 ({len(content)} chars)")
                else:
                    logger.warning(f"⚠️  파일을 찾을 수 없음: {file_path}")
            
            logger.info(f"📊 총 {len(sample_data)}개의 샘플 데이터 준비됨")
            
            if not sample_data:
                return "❌ 샘플 데이터를 찾을 수 없습니다"
            
            # 비동기로 데이터 추가
            async def add_all_samples():
                await self.initialize()
                results = []
                for data in sample_data:
                    try:
                        result = await self.rag_service.add_document_from_text(
                            content=data["content"],
                            source=data["source"],
                            metadata={"title": data["title"], "type": "sample_data"}
                        )
                        if result.get("success"):
                            results.append(f"✅ {data['title']} 추가 완료")
                        else:
                            results.append(f"❌ {data['title']} 추가 실패: {result.get('error', 'Unknown error')}")
                    except Exception as e:
                        results.append(f"❌ {data['title']} 추가 실패: {str(e)}")
                
                self.sample_data_loaded = True
                return "\n".join(results)
            
            return asyncio.run(add_all_samples())
            
        except Exception as e:
            logger.error(f"샘플 데이터 로드 중 오류 발생: {e}")
            return f"❌ 샘플 데이터 로드 실패: {str(e)}"

    def get_sample_queries(self) -> List[str]:
        """샘플 검색 쿼리 목록 반환 (경량화)"""
        return [
            "헥사고날 아키텍처는 어떻게 구현되었나요?",
            "RAG 시스템의 핵심 구성 요소는 무엇인가요?",
            "프로젝트의 주요 목표는 무엇인가요?",
            "어떤 기술 스택을 사용했나요?"
        ]
    
    async def add_document(self, content: str, source: str = "manual_input") -> str:
        """지식 베이스에 문서 추가"""
        if not content.strip():
            return "❌ 내용을 입력해주세요"
        
        try:
            result = await self.rag_service.add_document_from_text(
                content=content.strip(),
                source=source,
                metadata={"timestamp": "demo"}
            )
            
            if result.get("success"):
                return f"✅ 문서가 성공적으로 추가되었습니다! 문서 ID: {result.get('document_id', 'N/A')}"
            else:
                return f"❌ 문서 추가 실패: {result.get('error', 'Unknown error')}"
                
        except Exception as e:
            logger.error(f"문서 추가 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def add_document_with_analysis(self, content: str, source: str = "manual_input") -> Tuple[str, str, str]:
        """상세 분석과 함께 문서 추가"""
        if not content.strip():
            return "❌ 내용을 입력해주세요", "", ""
        
        try:
            result = await self.rag_service.add_document_with_analysis(
                content=content.strip(),
                source=source,
                metadata={"timestamp": "demo"}
            )
            
            if not result.get("success"):
                return f"❌ 문서 추가 실패: {result.get('error', 'Unknown error')}", "", ""
            
            # 기본 결과
            basic_result = f"✅ 문서가 성공적으로 추가되었습니다!\n문서 ID: {result.get('document_id', 'N/A')}\n출처: {result.get('source', 'N/A')}"
            
            # 처리 과정 분석
            processing_steps = result.get("processing_steps", {})
            vector_result = result.get("vector_result", {})
            
            processing_info = f"⏱️ **처리 분석:**\n"
            processing_info += f"• 모델 생성: {processing_steps.get('model_creation', 0):.3f}s\n"
            processing_info += f"• 벡터 처리: {processing_steps.get('vector_processing', 0):.3f}s\n"
            processing_info += f"• 총 시간: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            # 벡터 처리 결과
            if vector_result.get("success"):
                vector_info = f"🔢 **벡터 분석:**\n"
                vector_info += f"• 생성된 청크: {vector_result.get('chunks_created', 0)}\n"
                vector_info += f"• 벡터 차원: {vector_result.get('vector_dimensions', 0)}\n"
                vector_info += f"• 총 문서 수: {vector_result.get('total_documents', 0)}\n"
                vector_info += f"• 총 청크 수: {vector_result.get('total_chunks', 0)}\n\n"
                
                # 청크 상세 정보
                chunk_details = vector_result.get("chunk_details", [])
                if chunk_details:
                    vector_info += "📄 **청크 상세 정보:**\n"
                    for i, chunk in enumerate(chunk_details, 1):
                        vector_info += f"• 청크 {i}: {chunk['length']} chars - {chunk['content_preview']}\n"
            else:
                vector_info = "❌ 벡터 처리 실패"
            
            return basic_result, processing_info, vector_info
                
        except Exception as e:
            logger.error(f"상세 분석과 함께 문서 추가 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", ""
    
    async def search_documents(self, query: str, top_k: int = 3) -> str:
        """지식 베이스에서 문서 검색"""
        if not query.strip():
            return "❌ 검색어를 입력해주세요"
        
        try:
            result = await self.rag_service.search_documents(
                query=query.strip(),
                top_k=top_k,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ 검색 실패: {result.get('error', 'Unknown error')}"
            
            documents = result.get("results", [])
            if not documents:
                return "📭 관련 문서를 찾을 수 없습니다"
            
            output = f"🔍 {len(documents)}개의 관련 문서를 찾았습니다:\n\n"
            for i, doc in enumerate(documents, 1):
                output += f"**{i}. 점수: {doc.get('similarity_score', 0):.3f}**\n"
                output += f"{doc.get('content', '내용 없음')[:200]}...\n\n"
            
            return output
            
        except Exception as e:
            logger.error(f"문서 검색 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def demonstrate_retriever_process(self, query: str) -> Tuple[str, str, str]:
        """리트리버 과정을 단계별로 시연"""
        if not query.strip():
            return "❌ 검색어를 입력해주세요", "", ""
        
        try:
            # 1단계: 쿼리 임베딩 생성
            step1_info = "🔄 **1단계: 쿼리 임베딩 생성**\n"
            step1_info += f"• 쿼리: '{query}'\n"
            step1_info += f"• 모델: sentence-transformers/all-MiniLM-L6-v2\n"
            step1_info += f"• 벡터 차원: 384\n"
            
            # 2단계: 벡터 검색
            step2_info = "🔍 **2단계: 벡터 검색**\n"
            step2_info += f"• 검색 알고리즘: 코사인 유사도 + BM25\n"
            step2_info += f"• 검색 범위: 전체 벡터 스토어\n"
            
            # 실제 검색 실행
            result = await self.rag_service.search_documents_with_analysis(
                query=query.strip(),
                top_k=5,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ 검색 실패: {result.get('error', 'Unknown error')}", "", ""
            
            documents = result.get("results", [])
            detailed_analysis = result.get("detailed_analysis", {})
            processing_steps = detailed_analysis.get("processing_steps", {})
            
            # 3단계: 검색 결과
            step3_info = "📊 **3단계: 검색 결과**\n"
            step3_info += f"• 찾은 문서: {len(documents)}개\n"
            step3_info += f"• 처리 시간: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            for i, doc in enumerate(documents[:3], 1):
                step3_info += f"**{i}. 유사도: {doc.get('similarity_score', 0):.3f}**\n"
                step3_info += f"{doc.get('content', '')[:150]}...\n\n"
            
            # 상세 분석 정보
            analysis_info = "🔬 **상세 분석**\n"
            analysis_info += f"• 전처리: {processing_steps.get('preprocessing', 0):.3f}s\n"
            analysis_info += f"• 벡터화: {processing_steps.get('vectorization', 0):.3f}s\n"
            analysis_info += f"• 유사도 계산: {processing_steps.get('similarity_calculation', 0):.3f}s\n"
            analysis_info += f"• 정렬: {processing_steps.get('sorting', 0):.3f}s\n"
            
            vector_info = detailed_analysis.get("vector_info", {})
            analysis_info += f"• 벡터 차원: {vector_info.get('dimensions', 384)}\n"
            analysis_info += f"• 총 청크 수: {vector_info.get('total_chunks', 0)}\n"
            analysis_info += f"• 처리된 청크: {vector_info.get('processed_chunks', 0)}\n"
            
            return step1_info, step2_info + step3_info, analysis_info
                
        except Exception as e:
            logger.error(f"리트리버 과정 시연 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", ""

    async def search_documents_with_analysis(self, query: str, top_k: int = 3) -> Tuple[str, str, str]:
        """상세 분석과 함께 문서 검색"""
        if not query.strip():
            return "❌ 검색어를 입력해주세요", "", ""
        
        try:
            result = await self.rag_service.search_documents_with_analysis(
                query=query.strip(),
                top_k=top_k,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ 검색 실패: {result.get('error', 'Unknown error')}", "", ""
            
            # 검색 결과
            documents = result.get("results", [])
            if not documents:
                return "📭 관련 문서를 찾을 수 없습니다", "", ""
            
            search_results = f"🔍 {len(documents)}개의 관련 문서를 찾았습니다:\n\n"
            for i, doc in enumerate(documents, 1):
                search_results += f"**{i}. 점수: {doc.get('similarity_score', 0):.3f}**\n"
                search_results += f"{doc.get('content', '내용 없음')[:200]}...\n\n"
            
            # 처리 과정 분석
            detailed_analysis = result.get("detailed_analysis", {})
            processing_steps = detailed_analysis.get("processing_steps", {})
            vector_info = detailed_analysis.get("vector_info", {})
            
            processing_info = f"⏱️ **처리 분석:**\n"
            processing_info += f"• 전처리: {processing_steps.get('preprocessing', 0):.3f}s\n"
            processing_info += f"• 벡터화: {processing_steps.get('vectorization', 0):.3f}s\n"
            processing_info += f"• 유사도 계산: {processing_steps.get('similarity_calculation', 0):.3f}s\n"
            processing_info += f"• 정렬: {processing_steps.get('sorting', 0):.3f}s\n"
            processing_info += f"• 결과 생성: {processing_steps.get('result_creation', 0):.3f}s\n"
            processing_info += f"• 총 시간: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            # 벡터 정보
            vector_analysis = f"🔢 **벡터 분석:**\n"
            vector_analysis += f"• 벡터 차원: {vector_info.get('dimensions', 0)}\n"
            vector_analysis += f"• 총 청크 수: {vector_info.get('total_chunks', 0)}\n"
            vector_analysis += f"• 처리된 청크: {vector_info.get('processed_chunks', 0)}\n"
            vector_analysis += f"• 유사도 임계값: {vector_info.get('threshold_applied', 0)}\n\n"
            
            # 유사도 분포
            similarity_dist = detailed_analysis.get("similarity_distribution", {})
            vector_analysis += f"📊 **유사도 분포:**\n"
            vector_analysis += f"• 정확히 일치: {similarity_dist.get('exact_matches', 0)}\n"
            vector_analysis += f"• 유사도 일치: {similarity_dist.get('similarity_matches', 0)}\n"
            vector_analysis += f"• 문맥상 일치: {similarity_dist.get('contextual_matches', 0)}\n"
            
            return search_results, processing_info, vector_analysis
                
        except Exception as e:
            logger.error(f"상세 분석과 함께 문서 검색 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", ""
    
    async def generate_answer(self, question: str, max_results: int = 3) -> Tuple[str, str]:
        """출처와 함께 RAG 답변 생성"""
        if not question.strip():
            return "❌ 질문을 입력해주세요", ""
        
        try:
            result = await self.rag_service.generate_rag_answer(
                question=question.strip(),
                context_hint=None,
                metadata={"timestamp": "demo"}
            )
            
            # Format answer
            answer = f"🤖 **답변:**\n{result.answer}\n\n"
            answer += f"⏱️ **처리 시간:** {result.processing_time_ms:.0f}ms\n"
            answer += f"🎯 **신뢰도:** {result.confidence:.2f}"
            
            # Format sources
            if result.sources:
                sources = "📚 **사용된 출처:**\n\n"
                for i, source in enumerate(result.sources, 1):
                    sources += f"**{i}. 유사도: {source.similarity_score:.3f}**\n"
                    sources += f"{source.chunk.content[:300]}...\n\n"
            else:
                sources = "📭 출처를 찾을 수 없습니다"
            
            return answer, sources
            
        except Exception as e:
            logger.error(f"답변 생성 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", ""
    
    async def clear_knowledge_base(self) -> str:
        """지식 베이스의 모든 문서 삭제"""
        try:
            result = await self.rag_service.clear_storage()
            if result.get("success"):
                return "✅ 지식 베이스가 성공적으로 삭제되었습니다"
            else:
                return f"❌ 삭제 실패: {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"❌ 오류: {str(e)}"
    
    async def get_status(self) -> str:
        """시스템 상태 가져오기"""
        try:
            status = await self.rag_service.get_status()
            
            # 실제 사용 중인 어댑터 정보 가져오기
            llm_info = await self.llm_adapter.get_info()
            vector_info = await self.vector_adapter.get_info()
            
            return f"""
📊 **시스템 상태**

**📄 문서 관리:**
• 저장된 문서: {status.get('document_count', 0)}개
• 벡터 임베딩: {status.get('vector_count', 0)}개

**🤖 LLM 서비스:**
• 모델: {llm_info.get('model_name', 'MockLLM')}
• 상태: {'✅ 준비됨' if status.get('llm_available') else '❌ 사용 불가'}
• 타입: {llm_info.get('type', 'Mock')}

**🔍 벡터 스토어:**
• 스토어: {vector_info.get('store_name', 'MemoryVector')}
• 상태: {'✅ 준비됨' if status.get('vector_store_available') else '❌ 사용 불가'}
• 환경: {self.vector_adapter_factory.environment}
• 저장된 벡터: {vector_info.get('stored_vectors', 0)}개

**🔤 임베딩 서비스:**
• 모델: {vector_info.get('embedding_model', 'sentence-transformers/all-MiniLM-L6-v2')}
• 차원: {vector_info.get('dimensions', 384)}
• 상태: {'✅ 준비됨' if vector_info.get('embedding_available', True) else '❌ 사용 불가'}
            """
        except Exception as e:
            return f"❌ 상태 가져오기 오류: {str(e)}"

    async def view_all_documents(self) -> str:
        """데모: 저장된 모든 문서 보기"""
        try:
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 저장된 문서가 없습니다."
            
            output = f"📚 **저장된 문서 ({len(documents)}개)**\n\n"
            
            for i, doc in enumerate(documents, 1):
                output += f"**{i}. {doc['source']}** `{doc['id'][:8]}...`\n"
                output += f"• **길이**: {doc['content_length']} chars\n"
                output += f"• **생성일**: {doc['created_at'][:19] if doc['created_at'] else 'N/A'}\n"
                output += f"• **미리보기**: {doc['content_preview']}\n\n"
                
            return output
            
        except Exception as e:
            logger.error(f"전체 문서 조회 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def get_embedding_analysis(self) -> str:
        """데모: 임베딩 분석 정보"""
        try:
            info = await self.vector_adapter.get_embedding_info()
            
            if not info.get("embeddings_available"):
                return "❌ 임베딩이 사용 불가능합니다."
                
            output = f"""
🔬 **임베딩 분석**

**모델**: {info['model_name']}
**문서 수**: {info['document_count']}
**임베딩 차원**: {info['embedding_dimensions']}
**임베딩 형태**: {info['embedding_shape']}
**샘플 벡터 크기**: {info['sample_embedding_norm']:.4f}
            """
            
            return output
            
        except Exception as e:
            logger.error(f"임베딩 분석 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def get_memory_info(self) -> str:
        """메모리 사용량 및 상태 정보"""
        try:
            import psutil
            import gc
            
            # 시스템 메모리 정보
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            # 가비지 컬렉터 정보
            gc_stats = gc.get_stats()
            
            # 프로세스 메모리 정보
            process = psutil.Process()
            process_memory = process.memory_info()
            
            output = f"""
💾 **시스템 메모리 상태**

**전체 메모리:**
• 총 메모리: {memory.total / (1024**3):.2f} GB
• 사용 가능: {memory.available / (1024**3):.2f} GB
• 사용률: {memory.percent:.1f}%
• 사용 중: {memory.used / (1024**3):.2f} GB

**스왑 메모리:**
• 총 스왑: {swap.total / (1024**3):.2f} GB
• 사용 중: {swap.used / (1024**3):.2f} GB
• 사용률: {swap.percent:.1f}%

**현재 프로세스:**
• RSS (물리 메모리): {process_memory.rss / (1024**2):.2f} MB
• VMS (가상 메모리): {process_memory.vms / (1024**2):.2f} MB

**가비지 컬렉터:**
• 세대 0: {gc_stats[0]['collections']}회 수집
• 세대 1: {gc_stats[1]['collections']}회 수집
• 세대 2: {gc_stats[2]['collections']}회 수집
            """
            
            return output
            
        except Exception as e:
            logger.error(f"메모리 정보 가져오기 중 오류 발생: {e}")
            return f"❌ 메모리 정보 가져오기 실패: {str(e)}"

    async def get_chunk_analysis(self) -> str:
        """청크 분석 정보"""
        try:
            # 모든 문서의 청크 정보 가져오기
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 저장된 문서가 없습니다."
            
            # 청크 통계 계산
            total_chunks = 0
            chunk_lengths = []
            chunk_sources = {}
            
            for doc in documents:
                chunks = await self.vector_adapter.get_document_chunks(doc['id'])
                total_chunks += len(chunks)
                
                for chunk in chunks:
                    chunk_lengths.append(len(chunk.get('content', '')))
                    source = chunk.get('source', 'unknown')
                    chunk_sources[source] = chunk_sources.get(source, 0) + 1
            
            if not chunk_lengths:
                return "📭 청크 정보를 찾을 수 없습니다."
            
            avg_length = sum(chunk_lengths) / len(chunk_lengths)
            min_length = min(chunk_lengths)
            max_length = max(chunk_lengths)
            
            output = f"""
📄 **청크 분석**

**기본 통계:**
• 총 문서 수: {len(documents)}개
• 총 청크 수: {total_chunks}개
• 평균 청크 길이: {avg_length:.1f} 문자
• 최소 청크 길이: {min_length} 문자
• 최대 청크 길이: {max_length} 문자

**출처별 청크 분포:**
"""
            
            for source, count in sorted(chunk_sources.items(), key=lambda x: x[1], reverse=True):
                output += f"• {source}: {count}개 청크\n"
            
            # 길이 분포 분석
            short_chunks = len([l for l in chunk_lengths if l < 100])
            medium_chunks = len([l for l in chunk_lengths if 100 <= l < 500])
            long_chunks = len([l for l in chunk_lengths if l >= 500])
            
            output += f"""
**길이 분포:**
• 짧은 청크 (<100자): {short_chunks}개 ({short_chunks/total_chunks*100:.1f}%)
• 중간 청크 (100-500자): {medium_chunks}개 ({medium_chunks/total_chunks*100:.1f}%)
• 긴 청크 (≥500자): {long_chunks}개 ({long_chunks/total_chunks*100:.1f}%)
            """
            
            return output
            
        except Exception as e:
            logger.error(f"청크 분석 중 오류 발생: {e}")
            return f"❌ 청크 분석 실패: {str(e)}"

    async def get_vector_store_detailed_info(self) -> str:
        """벡터스토어 상세 정보"""
        try:
            # 기본 정보
            info = await self.vector_adapter.get_info()
            embedding_info = await self.vector_adapter.get_embedding_info()
            
            # 저장된 문서 정보
            documents = await self.vector_adapter.get_all_documents()
            
            # 벡터 통계
            total_vectors = 0
            vector_dimensions = 0
            if documents:
                total_vectors = sum(len(await self.vector_adapter.get_document_chunks(doc['id'])) for doc in documents)
                if documents:
                    sample_chunks = await self.vector_adapter.get_document_chunks(documents[0]['id'])
                    if sample_chunks:
                        vector_dimensions = len(sample_chunks[0].get('embedding', []))
            
            output = f"""
🔍 **벡터스토어 상세 정보**

**스토어 정보:**
• 스토어 이름: {info.get('store_name', 'Unknown')}
• 스토어 타입: {info.get('store_type', 'Unknown')}
• 초기화 상태: {'✅ 초기화됨' if info.get('initialized', False) else '❌ 초기화 안됨'}

**임베딩 모델:**
• 모델명: {embedding_info.get('model_name', 'Unknown')}
• 차원: {embedding_info.get('embedding_dimensions', 0)}
• 모델 형태: {embedding_info.get('embedding_shape', 'Unknown')}
• 샘플 벡터 크기: {embedding_info.get('sample_embedding_norm', 0):.4f}

**저장된 데이터:**
• 총 문서 수: {len(documents)}개
• 총 벡터 수: {total_vectors}개
• 평균 문서 길이: {sum(len(doc.get('content', '')) for doc in documents) / len(documents) if documents else 0:.1f} 문자

**성능 정보:**
• 임베딩 생성 가능: {'✅ 가능' if embedding_info.get('embeddings_available', False) else '❌ 불가능'}
• 벡터 검색 가능: {'✅ 가능' if info.get('search_available', True) else '❌ 불가능'}
• 벡터 저장 가능: {'✅ 가능' if info.get('storage_available', True) else '❌ 불가능'}
            """
            
            return output
            
        except Exception as e:
            logger.error(f"벡터스토어 상세 정보 가져오기 중 오류 발생: {e}")
            return f"❌ 벡터스토어 상세 정보 가져오기 실패: {str(e)}"

    async def get_memory_content(self) -> str:
        """메모리에 저장된 실제 내용 확인"""
        try:
            # 메모리 어댑터에서 직접 데이터 가져오기
            if hasattr(self.vector_adapter, 'get_memory_content'):
                content = await self.vector_adapter.get_memory_content()
                return content
            
            # 기본 메모리 내용 (문서 목록)
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 메모리에 저장된 내용이 없습니다."
            
            output = f"💾 **메모리에 저장된 내용 ({len(documents)}개 문서)**\n\n"
            
            for i, doc in enumerate(documents, 1):
                output += f"**{i}. 문서 ID: {doc['id']}**\n"
                output += f"• 출처: {doc['source']}\n"
                output += f"• 길이: {doc['content_length']} 문자\n"
                output += f"• 생성일: {doc['created_at'][:19] if doc['created_at'] else 'N/A'}\n"
                output += f"• 내용 미리보기:\n{doc['content_preview'][:300]}...\n\n"
                
                # 청크 정보도 포함
                chunks = await self.vector_adapter.get_document_chunks(doc['id'])
                output += f"  📄 청크 수: {len(chunks)}개\n"
                for j, chunk in enumerate(chunks[:3], 1):  # 처음 3개 청크만
                    output += f"    • 청크 {j}: {chunk.get('content', '')[:100]}...\n"
                output += "\n"
            
            return output
            
        except Exception as e:
            logger.error(f"메모리 내용 가져오기 중 오류 발생: {e}")
            return f"❌ 메모리 내용 가져오기 실패: {str(e)}"

    async def get_chunk_content(self) -> str:
        """청크의 실제 내용 확인"""
        try:
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 저장된 문서가 없습니다."
            
            output = f"📄 **청크 내용 확인**\n\n"
            
            for i, doc in enumerate(documents, 1):
                chunks = await self.vector_adapter.get_document_chunks(doc['id'])
                
                output += f"**문서 {i}: {doc['source']}** (ID: {doc['id'][:8]}...)\n"
                output += f"총 {len(chunks)}개 청크\n\n"
                
                for j, chunk in enumerate(chunks, 1):
                    output += f"**청크 {j}:**\n"
                    output += f"• 길이: {len(chunk.get('content', ''))} 문자\n"
                    output += f"• 내용:\n{chunk.get('content', '')}\n\n"
                    
                    # 처음 2개 문서의 처음 3개 청크만 표시
                    if i > 2 or j > 3:
                        break
                
                if i > 2:
                    output += "... (더 많은 문서가 있습니다)\n"
                    break
                
                output += "---\n\n"
            
            return output
            
        except Exception as e:
            logger.error(f"청크 내용 가져오기 중 오류 발생: {e}")
            return f"❌ 청크 내용 가져오기 실패: {str(e)}"

    async def get_vector_store_content(self) -> str:
        """벡터스토어의 실제 내용 확인"""
        try:
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 벡터스토어에 저장된 내용이 없습니다."
            
            output = f"🔍 **벡터스토어 내용 확인**\n\n"
            
            for i, doc in enumerate(documents, 1):
                chunks = await self.vector_adapter.get_document_chunks(doc['id'])
                
                output += f"**문서 {i}: {doc['source']}**\n"
                output += f"• 문서 ID: {doc['id']}\n"
                output += f"• 전체 내용 길이: {doc['content_length']} 문자\n"
                output += f"• 청크 수: {len(chunks)}개\n"
                output += f"• 생성일: {doc['created_at'][:19] if doc['created_at'] else 'N/A'}\n\n"
                
                # 벡터 정보 포함
                if chunks:
                    sample_chunk = chunks[0]
                    embedding = sample_chunk.get('embedding', [])
                    output += f"**벡터 정보:**\n"
                    output += f"• 벡터 차원: {len(embedding)}\n"
                    output += f"• 샘플 벡터 (처음 10개): {embedding[:10]}\n"
                    output += f"• 벡터 크기: {len(embedding)} 차원\n\n"
                
                # 청크 상세 정보
                output += f"**청크 상세 정보:**\n"
                for j, chunk in enumerate(chunks, 1):
                    output += f"• 청크 {j}: {len(chunk.get('content', ''))} 문자\n"
                    output += f"  내용: {chunk.get('content', '')[:200]}...\n"
                    if j >= 3:  # 처음 3개 청크만
                        break
                
                output += "\n---\n\n"
                
                if i >= 3:  # 처음 3개 문서만
                    output += "... (더 많은 문서가 있습니다)\n"
                    break
            
            return output
            
        except Exception as e:
            logger.error(f"벡터스토어 내용 가져오기 중 오류 발생: {e}")
            return f"❌ 벡터스토어 내용 가져오기 실패: {str(e)}"

    async def demonstrate_complete_rag_pipeline(self, content: str, query: str) -> Tuple[str, str, str, str]:
        """완전한 RAG 파이프라인 시연: 문서 추가부터 검색까지"""
        try:
            pipeline_log = []
            
            # === 1단계: 문서 로딩 ===
            pipeline_log.append("🔄 **1단계: 문서 로딩**")
            pipeline_log.append(f"• 입력 텍스트 길이: {len(content)} 문자")
            pipeline_log.append(f"• 문서 타입: 텍스트")
            pipeline_log.append(f"• 처리 시간: 즉시\n")
            
            # === 2단계: 문서 저장 및 벡터화 ===
            pipeline_log.append("🔄 **2단계: 문서 저장 및 벡터화**")
            add_result = await self.rag_service.add_document_with_analysis(
                content=content.strip(),
                source="pipeline_demo",
                metadata={"demo": "complete_pipeline"}
            )
            
            if not add_result.get("success"):
                return "❌ 문서 추가 실패", "", "", ""
            
            processing_steps = add_result.get("processing_steps", {})
            vector_result = add_result.get("vector_result", {})
            
            pipeline_log.append(f"• 임베딩 모델: sentence-transformers/all-MiniLM-L6-v2")
            pipeline_log.append(f"• 벡터 차원: {vector_result.get('vector_dimensions', 384)}")
            pipeline_log.append(f"• 생성된 청크: {vector_result.get('chunks_created', 0)}개")
            pipeline_log.append(f"• 벡터화 시간: {processing_steps.get('vector_processing', 0):.3f}s")
            pipeline_log.append(f"• BM25 인덱싱 완료\n")
            
            # === 3단계: 쿼리 처리 ===
            pipeline_log.append("🔍 **3단계: 쿼리 처리**")
            pipeline_log.append(f"• 검색 쿼리: '{query}'")
            pipeline_log.append(f"• 쿼리 길이: {len(query)} 문자")
            pipeline_log.append(f"• 검색 알고리즘: 하이브리드 (Vector + BM25)\n")
            
            # === 4단계: 유사도 검색 실행 ===
            search_result = await self.rag_service.search_documents_with_analysis(
                query=query.strip(),
                top_k=3,
                similarity_threshold=0.1
            )
            
            if not search_result.get("success"):
                return "\n".join(pipeline_log), "❌ 검색 실패", "", ""
            
            documents = search_result.get("results", [])
            detailed_analysis = search_result.get("detailed_analysis", {})
            processing_steps_search = detailed_analysis.get("processing_steps", {})
            
            pipeline_log.append("📊 **4단계: 검색 실행 결과**")
            pipeline_log.append(f"• 찾은 문서: {len(documents)}개")
            pipeline_log.append(f"• 검색 시간: {processing_steps_search.get('total_time', 0):.3f}s")
            pipeline_log.append(f"• 벡터 유사도 계산: {processing_steps_search.get('similarity_calculation', 0):.3f}s")
            pipeline_log.append(f"• BM25 점수 계산: {processing_steps_search.get('preprocessing', 0):.3f}s")
            
            # 검색 결과 포맷팅
            search_results = f"🔍 **검색 결과 ({len(documents)}개)**\n\n"
            for i, doc in enumerate(documents, 1):
                search_results += f"**{i}. 유사도: {doc.get('similarity_score', 0):.3f}**\n"
                search_results += f"{doc.get('content', '')[:300]}...\n\n"
            
            # 벡터 분석 정보
            vector_info = detailed_analysis.get("vector_info", {})
            vector_analysis = f"🔢 **벡터 분석**\n"
            vector_analysis += f"• 처리된 청크: {vector_info.get('processed_chunks', 0)}개\n"
            vector_analysis += f"• 벡터 차원: {vector_info.get('dimensions', 384)}\n"
            vector_analysis += f"• 유사도 임계값: {vector_info.get('threshold_applied', 0.1)}\n\n"
            
            similarity_dist = detailed_analysis.get("similarity_distribution", {})
            vector_analysis += f"**유사도 분포:**\n"
            vector_analysis += f"• 고유사도 (>0.7): {similarity_dist.get('exact_matches', 0)}개\n"
            vector_analysis += f"• 중유사도 (0.3-0.7): {similarity_dist.get('similarity_matches', 0)}개\n"
            vector_analysis += f"• 저유사도 (<0.3): {similarity_dist.get('contextual_matches', 0)}개\n"
            
            # === 5단계: RAG 답변 생성 ===
            if documents:
                rag_result = await self.rag_service.generate_rag_answer(
                    question=query.strip(),
                    context_hint=None,
                    metadata={"demo": "complete_pipeline"}
                )
                
                pipeline_log.append(f"\n🤖 **5단계: RAG 답변 생성**")
                pipeline_log.append(f"• LLM 모델: MockLLM (데모용)")
                pipeline_log.append(f"• 사용된 컨텍스트: {len(rag_result.sources)}개 문서")
                pipeline_log.append(f"• 답변 생성 시간: {rag_result.processing_time_ms:.0f}ms")
                pipeline_log.append(f"• 신뢰도: {rag_result.confidence:.2f}")
                
                final_answer = f"🤖 **최종 RAG 답변**\n\n{rag_result.answer}\n\n"
                final_answer += f"**메타 정보:**\n"
                final_answer += f"• 처리 시간: {rag_result.processing_time_ms:.0f}ms\n"
                final_answer += f"• 신뢰도: {rag_result.confidence:.2f}\n"
                final_answer += f"• 사용된 소스: {len(rag_result.sources)}개"
            else:
                pipeline_log.append(f"\n❌ **5단계: RAG 답변 생성 실패**")
                pipeline_log.append("• 관련 문서를 찾을 수 없어 답변을 생성할 수 없습니다.")
                final_answer = "❌ 관련 문서를 찾을 수 없어 답변을 생성할 수 없습니다."
            
            return "\n".join(pipeline_log), search_results, vector_analysis, final_answer
            
        except Exception as e:
            logger.error(f"완전한 RAG 파이프라인 시연 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", "", ""


def create_demo_interface() -> gr.Blocks:
    """Gradio 데모 인터페이스 생성"""
    
    demo_controller = RAGDemoInterface()
    
    with gr.Blocks(
        title="AI 포트폴리오 RAG 데모",
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 1800px !important;
            margin: 0 auto !important;
        }
        .tab-nav {
            justify-content: center !important;
        }
        .contain {
            max-width: none !important;
            margin: 0 auto !important;
        }
        .card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 16px;
            margin: 8px 0;
            background: #f8f9fa;
        }
        .feature-card {
            border: 1px solid #007bff;
            border-radius: 8px;
            padding: 12px;
            margin: 4px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .usage-card {
            border: 1px solid #28a745;
            border-radius: 8px;
            padding: 12px;
            margin: 4px;
            background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-card {
            border: 1px solid #17a2b8;
            border-radius: 8px;
            padding: 12px;
            margin: 4px;
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        """
    ) as demo:
        
        gr.Markdown("""
        # 🚀 AI 포트폴리오 RAG 데모
        """)
        
        with gr.Row():
            # 왼쪽: 사용 방법 카드
            with gr.Column(scale=1):
                gr.Markdown("""
                <div class="usage-card" style="border: 1px solid #28a745; border-radius: 8px; padding: 12px; margin: 4px; background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3>🎯 사용 방법</h3>
                    <ol style="margin: 8px 0; padding-left: 20px;">
                        <li><strong>📚 샘플 데이터 로드</strong>를 통해 AI 포트폴리오 프로젝트 문서를 자동으로 추가하세요</li>
                        <li><strong>📄 문서 추가</strong>를 통해 추가 지식 베이스를 구축하세요</li>
                        <li><strong>🔍 문서 검색</strong>을 통해 관련 내용을 찾으세요 (샘플 쿼리 제공)</li>
                        <li><strong>🤖 질문하기</strong>를 통해 AI 생성 답변을 받으세요</li>
                        <li><strong>🔬 문서 분석</strong>을 통해 상세 처리 단계를 확인하세요</li>
                    </ol>
                </div>
                """)
            
            # 오른쪽: 시스템 정보 카드 (동적 업데이트)
            with gr.Column(scale=1):
                system_status_html = gr.HTML(
                    value="""
                    <div class="status-card" style="border: 1px solid #17a2b8; border-radius: 8px; padding: 12px; margin: 4px; background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%); box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 300px; width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <h3 style="margin: 0;">📊 시스템 정보</h3>
                            <span style="font-size: 16px;" title="새로고침">🔄</span>
                        </div>
                        <div style="font-size: 14px; line-height: 1.4;">
                            <div style="margin-bottom: 8px;">
                                <strong>📄 문서 관리:</strong><br>
                                • 저장된 문서: <strong>로딩 중...</strong><br>
                                • 벡터 임베딩: <strong>로딩 중...</strong>
                            </div>
                            
                            <div style="margin-bottom: 8px;">
                                <strong>🤖 LLM 서비스:</strong><br>
                                <strong>로딩 중...</strong>
                            </div>
                            
                            <div style="margin-bottom: 8px;">
                                <strong>🔍 벡터 스토어:</strong><br>
                                <strong>로딩 중...</strong>
                            </div>
                            
                            <div style="margin-bottom: 8px;">
                                <strong>🔤 임베딩 서비스:</strong><br>
                                <strong>로딩 중...</strong>
                            </div>
                        </div>
                    </div>
                    """,
                    label="시스템 상태"
                )
                
                # 시스템 상태 새로고침 버튼
                refresh_status_btn = gr.Button("🔄 시스템 상태 새로고침", variant="secondary", size="sm")
        
        with gr.Tab("📄 문서 관리"):
            with gr.Row():
                # 왼쪽 열: 샘플 데이터 로드
                with gr.Column(scale=1):
                    gr.Markdown("### 🚀 빠른 시작: 샘플 데이터 로드")
                    load_sample_btn = gr.Button("📚 AI 포트폴리오 샘플 데이터 로드", variant="primary", size="lg")
                    sample_status = gr.Textbox(
                        label="샘플 데이터 상태",
                        lines=8,
                        interactive=False,
                        placeholder="샘플 데이터를 로드하면 AI 포트폴리오 프로젝트의 모든 문서가 자동으로 추가됩니다..."
                    )
                
                # 중앙 열: 수동 문서 추가
                with gr.Column(scale=1):
                    gr.Markdown("### 📝 수동 문서 추가")
                    doc_input = gr.Textbox(
                        label="문서 내용",
                        placeholder="여기에 문서 내용을 붙여넣으세요...",
                        lines=8
                    )
                    source_input = gr.Textbox(
                        label="출처 이름 (선택 사항)",
                        placeholder="예: research_paper.pdf",
                        value="manual_input"
                    )
                    add_btn = gr.Button("➕ 문서 추가", variant="primary")
                    add_output = gr.Textbox(
                        label="상태",
                        lines=3,
                        interactive=False
                    )
                    clear_btn = gr.Button("🗑️ 모든 문서 삭제", variant="secondary")
                    clear_output = gr.Textbox(
                        label="상태 초기화",
                        lines=2,
                        interactive=False
                    )
                
                # 오른쪽 열: 문서 보기 (전체 높이)
                with gr.Column(scale=1):
                    gr.Markdown("### 📚 저장된 문서 보기")
                    view_docs_btn = gr.Button("📚 전체 문서 보기", variant="primary")
                    documents_output = gr.Textbox(
                        label="저장된 문서",
                        lines=25,
                        interactive=False,
                        max_lines=30
                    )

        with gr.Tab("🔬 문서 분석"):
            with gr.Row():
                # 왼쪽 열: 문서 입력
                with gr.Column(scale=1):
                    gr.Markdown("### 📄 분석할 문서")
                    doc_input_analysis = gr.Textbox(
                        label="분석할 문서 내용",
                        placeholder="상세 분석을 위해 여기에 문서 내용을 붙여넣으세요...",
                        lines=12
                    )
                    source_input_analysis = gr.Textbox(
                        label="출처 이름 (선택 사항)",
                        placeholder="예: research_paper.pdf",
                        value="manual_input"
                    )
                    add_analysis_btn = gr.Button("🔬 추가 및 분석", variant="primary")
                
                # 중앙 열: 기본 결과
                with gr.Column(scale=1):
                    gr.Markdown("### ✅ 기본 결과")
                    basic_result = gr.Textbox(
                        label="기본 결과",
                        lines=6,
                        interactive=False
                    )
                    gr.Markdown("### ⏱️ 처리 분석")
                    processing_info = gr.Textbox(
                        label="처리 분석",
                        lines=8,
                        interactive=False
                    )
                
                # 오른쪽 열: 벡터 분석
                with gr.Column(scale=1):
                    gr.Markdown("### 🔢 벡터 분석")
                    vector_info = gr.Textbox(
                        label="벡터 분석",
                        lines=20,
                        interactive=False
                    )
        
        with gr.Tab("🔄 리트리버 과정 시연"):
            with gr.Row():
                # 왼쪽 열: 쿼리 입력
                with gr.Column(scale=1):
                    gr.Markdown("### 🔍 리트리버 과정 시연")
                    gr.Markdown("**실제 리트리버 과정을 단계별로 보여줍니다:**")
                    gr.Markdown("• 1단계: 쿼리 임베딩 생성")
                    gr.Markdown("• 2단계: 벡터 검색 (코사인 유사도)")
                    gr.Markdown("• 3단계: 검색 결과 분석")
                    
                    retriever_query = gr.Textbox(
                        label="검색할 쿼리",
                        placeholder="예: 헥사고날 아키텍처의 장점은 무엇인가요?",
                        lines=3
                    )
                    retriever_btn = gr.Button("🔄 리트리버 과정 시연", variant="primary")
                
                # 중앙 열: 1단계 + 2단계
                with gr.Column(scale=1):
                    gr.Markdown("### 📊 처리 과정")
                    step1_output = gr.Textbox(
                        label="1단계: 쿼리 임베딩 생성",
                        lines=6,
                        interactive=False
                    )
                    step2_output = gr.Textbox(
                        label="2단계: 벡터 검색 + 결과",
                        lines=12,
                        interactive=False
                    )
                
                # 오른쪽 열: 상세 분석
                with gr.Column(scale=1):
                    gr.Markdown("### 🔬 상세 분석")
                    analysis_output = gr.Textbox(
                        label="상세 분석 정보",
                        lines=20,
                        interactive=False
                    )

        with gr.Tab("🔍 문서 검색"):
            with gr.Row():
                # 왼쪽 열: 검색 입력
                with gr.Column(scale=1):
                    gr.Markdown("### 💡 샘플 검색 쿼리")
                    sample_query_dropdown = gr.Dropdown(
                        choices=demo_controller.get_sample_queries(),
                        label="미리 정의된 질문들",
                        value="",
                        interactive=True
                    )
                    use_sample_btn = gr.Button("🔍 선택한 질문으로 검색", variant="secondary")
                    
                    gr.Markdown("---")
                    gr.Markdown("### 🔍 직접 검색")
                    search_input = gr.Textbox(
                        label="검색어",
                        placeholder="예: 헥사고날 아키텍처, RAG 시스템, Docker 최적화, CI/CD 파이프라인, 성능 최적화, 문제 해결...",
                        lines=4
                    )
                    top_k = gr.Slider(
                        label="결과 수",
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1
                    )
                    search_btn = gr.Button("🔍 검색", variant="primary")
                
                # 중앙 열: 검색 결과
                with gr.Column(scale=1):
                    gr.Markdown("### 📋 검색 결과")
                    search_output = gr.Textbox(
                        label="검색 결과",
                        lines=20,
                        interactive=False
                    )
                
                # 오른쪽 열: 임베딩 분석
                with gr.Column(scale=1):
                    gr.Markdown("### 🔬 임베딩 분석")
                    embedding_analysis_btn = gr.Button("🔬 임베딩 분석", variant="secondary")
                    embedding_output = gr.Textbox(
                        label="임베딩 분석",
                        lines=25,
                        interactive=False
                    )

        with gr.Tab("🔬 검색 분석"):
            with gr.Row():
                # 왼쪽 열: 검색 입력
                with gr.Column(scale=1):
                    gr.Markdown("### 🔍 분석할 검색")
                    search_input_analysis = gr.Textbox(
                        label="분석할 검색어",
                        placeholder="상세 분석을 위해 검색어를 입력하세요...",
                        lines=4
                    )
                    top_k_analysis = gr.Slider(
                        label="결과 수",
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1
                    )
                    search_analysis_btn = gr.Button("🔬 검색 및 분석", variant="primary")
                
                # 중앙 열: 검색 결과
                with gr.Column(scale=1):
                    gr.Markdown("### 📋 검색 결과")
                    search_results_analysis = gr.Textbox(
                        label="검색 결과",
                        lines=12,
                        interactive=False
                    )
                    gr.Markdown("### ⏱️ 처리 분석")
                    search_processing_info = gr.Textbox(
                        label="처리 분석",
                        lines=10,
                        interactive=False
                    )
                
                # 오른쪽 열: 벡터 분석
                with gr.Column(scale=1):
                    gr.Markdown("### 🔢 벡터 분석")
                    search_vector_info = gr.Textbox(
                        label="벡터 분석",
                        lines=20,
                        interactive=False
                    )
        
        with gr.Tab("🤖 RAG Q&A"):
            with gr.Row():
                # 왼쪽 열: 질문 입력
                with gr.Column(scale=1):
                    gr.Markdown("### 💬 질문하기")
                    question_input = gr.Textbox(
                        label="질문",
                        placeholder="예: 헥사고날 아키텍처의 장점은 무엇인가요? RAG 시스템은 어떻게 작동하나요? Docker 최적화 방법을 알려주세요...",
                        lines=6
                    )
                    max_sources = gr.Slider(
                        label="사용할 최대 출처 수",
                        minimum=1,
                        maximum=5,
                        value=3,
                        step=1
                    )
                    answer_btn = gr.Button("💬 답변 생성", variant="primary")
                
                # 중앙 열: AI 답변
                with gr.Column(scale=1):
                    gr.Markdown("### 🤖 AI 답변")
                    answer_output = gr.Textbox(
                        label="AI 답변",
                        lines=20,
                        interactive=False
                    )
                
                # 오른쪽 열: 출처 문서
                with gr.Column(scale=1):
                    gr.Markdown("### 📚 출처 문서")
                    sources_output = gr.Textbox(
                        label="출처 문서",
                        lines=25,
                        interactive=False
                    )

        with gr.Tab("🔄 RAG 파이프라인"):
            with gr.Row():
                gr.Markdown("""
                ## 🎯 완전한 RAG 파이프라인 시연
                **문서 로딩 → 청킹 → 벡터화 → 저장 → 검색 → 답변생성**의 전체 과정을 한 번에 보여줍니다.
                """)
            
            with gr.Row():
                # 왼쪽 열: 입력
                with gr.Column(scale=1):
                    gr.Markdown("### 📝 입력 데이터")
                    pipeline_document = gr.Textbox(
                        label="분석할 문서",
                        placeholder="RAG 파이프라인으로 처리할 문서를 입력하세요...",
                        lines=10
                    )
                    pipeline_query = gr.Textbox(
                        label="검색 쿼리",
                        placeholder="문서에서 찾고자 하는 내용을 질문하세요...",
                        lines=3
                    )
                    pipeline_btn = gr.Button("🚀 전체 파이프라인 실행", variant="primary")
                
                # 중앙 열: 파이프라인 과정
                with gr.Column(scale=1):
                    gr.Markdown("### 🔄 처리 과정")
                    pipeline_process = gr.Textbox(
                        label="파이프라인 로그",
                        lines=25,
                        interactive=False
                    )
                
                # 오른쪽 열: 검색 결과
                with gr.Column(scale=1):
                    gr.Markdown("### 🔍 검색 결과")
                    pipeline_search_result = gr.Textbox(
                        label="검색된 문서",
                        lines=12,
                        interactive=False
                    )
                    gr.Markdown("### 🔢 벡터 분석")
                    pipeline_vector_analysis = gr.Textbox(
                        label="벡터 분석 결과",
                        lines=10,
                        interactive=False
                    )
            
            with gr.Row():
                # 하단: 최종 RAG 답변
                with gr.Column():
                    gr.Markdown("### 🤖 최종 RAG 답변")
                    pipeline_final_answer = gr.Textbox(
                        label="생성된 답변",
                        lines=8,
                        interactive=False
                    )

        with gr.Tab("📊 데이터 확인"):
            with gr.Row():
                # 왼쪽 열: 메모리 내용 확인
                with gr.Column(scale=1):
                    gr.Markdown("### 💾 메모리 내용 확인")
                    memory_content_btn = gr.Button("💾 메모리 내용 보기", variant="primary")
                    memory_content_output = gr.Textbox(
                        label="메모리에 저장된 내용",
                        lines=20,
                        interactive=False
                    )
                
                # 중앙 열: 청크 내용 확인
                with gr.Column(scale=1):
                    gr.Markdown("### 📄 청크 내용 확인")
                    chunk_content_btn = gr.Button("📄 청크 내용 보기", variant="primary")
                    chunk_content_output = gr.Textbox(
                        label="청크 내용",
                        lines=20,
                        interactive=False
                    )
                
                # 오른쪽 열: 벡터스토어 내용 확인
                with gr.Column(scale=1):
                    gr.Markdown("### 🔍 벡터스토어 내용 확인")
                    vector_content_btn = gr.Button("🔍 벡터스토어 내용 보기", variant="primary")
                    vector_content_output = gr.Textbox(
                        label="벡터스토어 내용",
                        lines=20,
                        interactive=False
                    )
        
        # Async wrapper functions for Gradio compatibility
        def sync_add_document(content, source):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.add_document(content, source)
            return asyncio.run(run())
        
        def sync_add_document_with_analysis(content, source):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.add_document_with_analysis(content, source)
            return asyncio.run(run())
        
        def sync_clear_knowledge_base():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.clear_knowledge_base()
            return asyncio.run(run())
        
        def sync_search_documents(query, top_k):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.search_documents(query, top_k)
            return asyncio.run(run())
        
        def sync_search_documents_with_analysis(query, top_k):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.search_documents_with_analysis(query, top_k)
            return asyncio.run(run())
        
        def sync_generate_answer(question, max_sources):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.generate_answer(question, max_sources)
            return asyncio.run(run())
        
        def sync_get_status():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_status()
            return asyncio.run(run())

        def sync_view_all_documents():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.view_all_documents()
            return asyncio.run(run())

        def sync_get_embedding_analysis():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_embedding_analysis()
            return asyncio.run(run())

        def sync_get_memory_info():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_memory_info()
            return asyncio.run(run())

        def sync_get_chunk_analysis():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_chunk_analysis()
            return asyncio.run(run())

        def sync_get_vector_store_detailed_info():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_vector_store_detailed_info()
            return asyncio.run(run())

        def sync_demonstrate_retriever_process(query):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.demonstrate_retriever_process(query)
            return asyncio.run(run())

        def sync_get_memory_content():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_memory_content()
            return asyncio.run(run())

        def sync_get_chunk_content():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_chunk_content()
            return asyncio.run(run())

        def sync_get_vector_store_content():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_vector_store_content()
            return asyncio.run(run())
        
        def sync_demonstrate_complete_rag_pipeline(document, query):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.demonstrate_complete_rag_pipeline(document, query)
            return asyncio.run(run())

        def format_system_status_html(status_text):
            """시스템 상태 텍스트를 HTML로 포맷팅"""
            if not status_text or "❌" in status_text:
                return """<div style="font-size: 14px; line-height: 1.4; color: #dc3545; min-width: 300px; width: 100%;">
                    <div style="margin-bottom: 8px;">
                        <strong>📄 문서 관리:</strong><br>
                        • 저장된 문서: <strong>❌ 오류</strong><br>
                        • 벡터 임베딩: <strong>❌ 오류</strong>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <strong>🤖 LLM 서비스:</strong><br>
                        <strong>❌ 준비안됨</strong>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <strong>🔍 벡터 스토어:</strong><br>
                        <strong>❌ 준비안됨</strong>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <strong>🔤 임베딩 서비스:</strong><br>
                        <strong>❌ 준비안됨</strong>
                    </div>
                </div>"""
            
            # 상태 텍스트에서 정보 추출 (실제 출력 구조에 맞게 수정)
            lines = status_text.split('\n')
            doc_count = "0"
            vector_count = "0"
            llm_model = "MockLLM"
            llm_type = "Mock"
            llm_status = "❌ 준비안됨"
            vector_store = "MemoryVector"
            stored_vectors = "0"
            vector_status = "❌ 준비안됨"
            embedding_model = "sentence-transformers/all-MiniLM-L6-v2"
            dimensions = "384"
            embedding_status = "❌ 준비안됨"
            
            # 실제 출력 구조에 맞게 파싱
            for line in lines:
                line = line.strip()
                if "저장된 문서:" in line:
                    doc_count = line.split(":")[-1].strip().replace("개", "")
                elif "벡터 임베딩:" in line:
                    vector_count = line.split(":")[-1].strip().replace("개", "")
                elif "스토어:" in line:
                    vector_store = line.split(":")[-1].strip()
                elif "저장된 벡터:" in line:
                    stored_vectors = line.split(":")[-1].strip().replace("개", "")
                elif "모델:" in line and "sentence-transformers" in line:
                    embedding_model = line.split(":")[-1].strip()
                elif "차원:" in line:
                    dimensions = line.split(":")[-1].strip()
                elif "상태:" in line and "✅" in line:
                    # 현재 섹션을 추정하여 상태 설정
                    if "LLM" in status_text and "MockLLM" in status_text:
                        llm_status = "✅ 준비됨"
                    if "MemoryVector" in line or "스토어" in line:
                        vector_status = "✅ 준비됨"
                    if "sentence-transformers" in line or "차원" in line:
                        embedding_status = "✅ 준비됨"
            
            # 기본값 설정 (실제 상태에서 정보가 없을 경우)
            if "✅ 준비됨" in status_text:
                llm_status = "✅ 준비됨"
                vector_status = "✅ 준비됨"
                embedding_status = "✅ 준비됨"
            
            return f"""<div style="font-size: 14px; line-height: 1.4; min-width: 300px; width: 100%;">
                <div style="margin-bottom: 8px;">
                    <strong>📄 문서 관리:</strong><br>
                    • 저장된 문서: <strong>{doc_count}개</strong><br>
                    • 벡터 임베딩: <strong>{vector_count}개</strong>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <strong>🤖 LLM 서비스:</strong><br>
                    <strong>{llm_model}({llm_type})</strong> - <strong>{llm_status}</strong>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <strong>🔍 벡터 스토어:</strong><br>
                    <strong>{vector_store}</strong> - <strong>{stored_vectors}개 벡터</strong> - <strong>{vector_status}</strong>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <strong>🔤 임베딩 서비스:</strong><br>
                    <strong>{embedding_model}</strong> - <strong>{dimensions}차원</strong> - <strong>{embedding_status}</strong>
                </div>
            </div>"""

        # Event handlers
        load_sample_btn.click(
            fn=lambda: demo_controller.load_sample_data(),
            outputs=sample_status
        )
        
        use_sample_btn.click(
            fn=lambda query: query if query else "검색어를 선택해주세요",
            inputs=sample_query_dropdown,
            outputs=search_input
        )
        
        add_btn.click(
            fn=sync_add_document,
            inputs=[doc_input, source_input],
            outputs=add_output
        )
        
        add_analysis_btn.click(
            fn=sync_add_document_with_analysis,
            inputs=[doc_input_analysis, source_input_analysis],
            outputs=[basic_result, processing_info, vector_info]
        )
        
        clear_btn.click(
            fn=sync_clear_knowledge_base,
            outputs=clear_output
        )
        
        search_btn.click(
            fn=sync_search_documents,
            inputs=[search_input, top_k],
            outputs=search_output
        )
        
        search_analysis_btn.click(
            fn=sync_search_documents_with_analysis,
            inputs=[search_input_analysis, top_k_analysis],
            outputs=[search_results_analysis, search_processing_info, search_vector_info]
        )
        
        retriever_btn.click(
            fn=sync_demonstrate_retriever_process,
            inputs=[retriever_query],
            outputs=[step1_output, step2_output, analysis_output]
        )

        answer_btn.click(
            fn=sync_generate_answer,
            inputs=[question_input, max_sources],
            outputs=[answer_output, sources_output]
        )

        view_docs_btn.click(
            fn=sync_view_all_documents,
            outputs=documents_output
        )

        # 임베딩 분석 버튼 이벤트 핸들러
        embedding_analysis_btn.click(
            fn=sync_get_embedding_analysis,
            outputs=embedding_output
        )

        # 시스템 상태 새로고침 이벤트 핸들러
        refresh_status_btn.click(
            fn=lambda: format_system_status_html(sync_get_status()),
            outputs=system_status_html
        )

        # 데이터 확인 이벤트 핸들러
        memory_content_btn.click(
            fn=sync_get_memory_content,
            outputs=memory_content_output
        )

        chunk_content_btn.click(
            fn=sync_get_chunk_content,
            outputs=chunk_content_output
        )

        vector_content_btn.click(
            fn=sync_get_vector_store_content,
            outputs=vector_content_output
        )

        # RAG 파이프라인 이벤트 핸들러
        pipeline_btn.click(
            fn=sync_demonstrate_complete_rag_pipeline,
            inputs=[pipeline_document, pipeline_query],
            outputs=[pipeline_process, pipeline_search_result, pipeline_vector_analysis, pipeline_final_answer]
        )

        # 페이지 로드 시 초기 시스템 상태 업데이트
        demo.load(
            fn=lambda: format_system_status_html(sync_get_status()),
            outputs=system_status_html
        )
    
    return demo


if __name__ == "__main__":
    logger.info("🚀 Starting Hexagonal RAG Demo...")
    
    try:
        demo = create_demo_interface()
        demo.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=False,
            show_error=True
        )
    except Exception as e:
        logger.error(f"❌ Failed to start demo: {e}")
        raise
