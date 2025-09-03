"""
Status Interface
시스템 상태 관련 그라디오 인터페이스
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class StatusInterface:
    """시스템 상태 관련 인터페이스"""
    
    def __init__(self, rag_service, llm_adapter, vector_adapter):
        self.rag_service = rag_service
        self.llm_adapter = llm_adapter
        self.vector_adapter = vector_adapter

    async def get_status(self) -> str:
        """시스템 상태 가져오기"""
        try:
            status = await self.rag_service.get_status()
            
            # 실제 사용 중인 어댑터 정보 가져오기
            llm_info = await self.llm_adapter.get_info()
            vector_info = await self.vector_adapter.get_info()
            
            return f"""
📊 **시스템 상태**

**🤖 LLM 서비스:**
• 모델: {llm_info.get('model_name', 'MockLLM')}
• 상태: {'✅ 준비됨' if status.get('llm_available') else '❌ 사용 불가'}
• 타입: {llm_info.get('type', 'Mock')}

**🔍 벡터 스토어:**
• 스토어: {vector_info.get('store_name', 'MemoryVector')}
• 상태: {'✅ 준비됨' if status.get('vector_store_available') else '❌ 사용 불가'}
• 저장된 벡터: {vector_info.get('stored_vectors', 0)}개

**🔤 임베딩 서비스:**
• 모델: {vector_info.get('embedding_model', 'sentence-transformers/all-MiniLM-L6-v2')}
• 차원: {vector_info.get('dimensions', 384)}
• 상태: {'✅ 준비됨' if vector_info.get('embedding_available', True) else '❌ 사용 불가'}
            """
        except Exception as e:
            return f"❌ 상태 가져오기 오류: {str(e)}"

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

    async def get_embedding_analysis(self) -> str:
        """임베딩 분석 정보"""
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

    def format_system_status_html(self, status_text: str) -> str:
        """시스템 상태 텍스트를 HTML로 포맷팅"""
        if not status_text or "❌" in status_text:
            return """<div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 8px 0; background: #ffffff; width: 100%; height: 200px; display: flex; flex-direction: column; justify-content: center; min-height: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="margin: 0; color: #333;">📊 시스템 현재 상태</h3>
                    <button id="refresh-status-btn" style="background: none; border: none; font-size: 16px; color: #666; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'" onclick="this.style.transform='scale(0.9)'; setTimeout(() => this.style.transform='scale(1)', 150); this.style.backgroundColor='#e0e0e0'; setTimeout(() => this.style.backgroundColor='transparent', 200);" title="새로고침">🔄</button>
                </div>
                <div style="font-size: 14px; line-height: 1.4; color: #555; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="margin-bottom: 8px;">
                        <div style="margin-left: 20px;">
                            <strong>🤖 LLM 서비스:</strong><br>
                            <div style="margin-left: 40px;">
                                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ccc; margin-right: 6px;"></span><strong>MockLLM(Mock)</strong>: <strong>not ready</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <div style="margin-left: 20px;">
                            <strong>🔍 벡터 스토어:</strong><br>
                            <div style="margin-left: 40px;">
                                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ccc; margin-right: 6px;"></span><strong>MemoryVector - 0개 벡터</strong>: <strong>not ready</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <div style="margin-left: 20px;">
                            <strong>🔤 임베딩 서비스:</strong><br>
                            <div style="margin-left: 40px;">
                                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ccc; margin-right: 6px;"></span><strong>sentence-transformers/all-MiniLM-L6-v2 - 384차원</strong>: <strong>not ready</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>"""
        
        # 상태 텍스트에서 정보 추출
        lines = status_text.split('\n')
        llm_model = "MockLLM"
        llm_type = "Mock"
        llm_status = "not ready"
        vector_store = "MemoryVector"
        stored_vectors = "0"
        vector_status = "not ready"
        embedding_model = "sentence-transformers/all-MiniLM-L6-v2"
        dimensions = "384"
        embedding_status = "not ready"
        
        # 실제 출력 구조에 맞게 파싱
        for line in lines:
            line = line.strip()
            if "스토어:" in line:
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
                    llm_status = "ready"
                if "MemoryVector" in line or "스토어" in line:
                    vector_status = "ready"
                if "sentence-transformers" in line or "차원" in line:
                    embedding_status = "ready"
        
        # 기본값 설정 (실제 상태에서 정보가 없을 경우)
        if "✅ 준비됨" in status_text:
            llm_status = "ready"
            vector_status = "ready"
            embedding_status = "ready"
        
        # 상태에 따른 아이콘 색상 결정
        llm_icon_color = "#28a745" if llm_status == "ready" else "#ccc"
        vector_icon_color = "#28a745" if vector_status == "ready" else "#ccc"
        embedding_icon_color = "#28a745" if embedding_status == "ready" else "#ccc"
        
        return f"""<div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 8px 0; background: #ffffff; width: 100%; height: 200px; display: flex; flex-direction: column; justify-content: center; min-height: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0; color: #333;">📊 시스템 현재 상태</h3>
                <button id="refresh-status-btn" style="background: none; border: none; font-size: 16px; color: #666; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'" onclick="this.style.transform='scale(0.9)'; setTimeout(() => this.style.transform='scale(1)', 150); this.style.backgroundColor='#e0e0e0'; setTimeout(() => this.style.backgroundColor='transparent', 200);" title="새로고침">🔄</button>
            </div>
            <div style="font-size: 14px; line-height: 1.4; color: #555; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                <div style="margin-bottom: 8px;">
                    <div style="margin-left: 20px;">
                        <strong>🤖 LLM 서비스:</strong><br>
                        <div style="margin-left: 40px;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: {llm_icon_color}; margin-right: 6px;"></span><strong>{llm_model}({llm_type})</strong>: <strong>{llm_status}</strong>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <div style="margin-left: 20px;">
                        <strong>🔍 벡터 스토어:</strong><br>
                        <div style="margin-left: 40px;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: {vector_icon_color}; margin-right: 6px;"></span><strong>{vector_store} - {stored_vectors}개 벡터</strong>: <strong>{vector_status}</strong>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <div style="margin-left: 20px;">
                        <strong>🔤 임베딩 서비스:</strong><br>
                        <div style="margin-left: 40px;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: {embedding_icon_color}; margin-right: 6px;"></span><strong>{embedding_model} - {dimensions}차원</strong>: <strong>{embedding_status}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>"""
