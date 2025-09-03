"""
Chunking Interface
텍스트 분할 관련 그라디오 인터페이스
"""

import logging
from typing import List, Dict, Any, Tuple
from .ui_components import UIComponents

# Import new chunking strategies
from src.core.domain.services.chunking import ChunkingStrategyFactory
from src.shared.config.chunking import ChunkingConfigManager

logger = logging.getLogger(__name__)


class ChunkingInterface:
    """텍스트 분할 관련 인터페이스"""
    
    def __init__(self, document_interface):
        self.document_interface = document_interface
        self.current_chunk_settings = {
            'chunk_size': 500,
            'chunk_overlap': 75,
            'preset': '기본 설정 (500/75)'
        }
        self.chunking_results = None
        
        # Initialize chunking configuration manager
        try:
            self.config_manager = ChunkingConfigManager()
            logger.info("✅ Chunking config manager initialized")
        except Exception as e:
            logger.warning(f"⚠️ Failed to initialize chunking config: {e}")
            self.config_manager = None

    def update_chunking_settings(self, preset: str, chunk_size: int, chunk_overlap: int) -> str:
        """청킹 설정 업데이트"""
        # 프리셋에 따른 설정 적용
        if preset == "기본 설정 (500/75)":
            chunk_size, chunk_overlap = 500, 75
        elif preset == "작은 청크 (300/50)":
            chunk_size, chunk_overlap = 300, 50
        elif preset == "큰 청크 (800/100)":
            chunk_size, chunk_overlap = 800, 100
        # "사용자 정의"인 경우 입력값 그대로 사용
        
        # 설정 저장
        self.current_chunk_settings = {
            'chunk_size': chunk_size,
            'chunk_overlap': chunk_overlap,
            'preset': preset
        }
        
        # HTML 형태로 현재 설정 반환
        return f"""
        <div style="padding: 10px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #007bff;">
            <strong>현재 설정:</strong><br>
            • 청크 크기: {chunk_size:,} 문자<br>
            • 청크 겹침: {chunk_overlap:,} 문자<br>
            • 분할 방식: 문장 단위<br>
            • 프리셋: {preset}<br>
            • 설정 소스: {preset if preset != "사용자 정의" else "사용자 입력"}
        </div>
        """

    def execute_chunking(self, document_selection: str, selected_document: str, selected_documents: list = None) -> Tuple[str, str]:
        """청킹 실행 및 결과 반환 (새로운 전략 기반)"""
        try:
            # 대상 문서 선택
            target_documents = []
            
            if document_selection == "전체 문서":
                # 모든 문서 선택
                target_documents = self.document_interface.get_all_documents()
            elif document_selection == "개별 문서 선택":
                # 개별 문서 선택
                if selected_document:
                    # 선택된 문서 찾기
                    all_docs = self.document_interface.get_all_documents()
                    
                    for doc in all_docs:
                        if f"📖 {doc['title']} ({doc['source']})" == selected_document or f"✍️ {doc['title']} ({doc['source']})" == selected_document:
                            target_documents.append(doc)
                            break
            elif document_selection == "다중 문서 선택":
                # 다중 문서 선택
                if selected_documents:
                    all_docs = self.document_interface.get_all_documents()
                    
                    for doc in all_docs:
                        doc_choice = f"📖 {doc['title']} ({doc['source']})" if doc['type'] == 'sample_data' else f"✍️ {doc['title']} ({doc['source']})"
                        if doc_choice in selected_documents:
                            target_documents.append(doc)
            
            if not target_documents:
                return (
                    "<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 처리할 문서가 없습니다.</div>",
                    "❌ 처리할 문서가 없습니다."
                )
            
            # 새로운 템플릿 기반 청킹 실행
            all_chunks = []
            chunk_analysis = []
            
            for i, doc in enumerate(target_documents, 1):
                logger.info(f"🔍 Processing document {i}: {doc['title']}")
                
                # 문서 메타데이터 구성
                document_metadata = {
                    'file_path': doc.get('source', ''),
                    'source': doc.get('source', ''),
                    'title': doc.get('title', '')
                }
                
                # 청킹 설정 구성
                chunker_config = {
                    'chunk_size': self.current_chunk_settings['chunk_size'],
                    'chunk_overlap': self.current_chunk_settings['chunk_overlap'],
                    'preserve_structure': True
                }
                
                # 전략 기반 청커 선택 및 실행
                chunker = ChunkingStrategyFactory.get_chunker(
                    document=doc['content'],
                    document_metadata=document_metadata,
                    chunker_config=chunker_config
                )
                
                # 문서 분석 및 청킹
                analysis = ChunkingStrategyFactory.analyze_document_for_strategy(
                    document=doc['content'],
                    document_metadata=document_metadata
                )
                
                document_chunks = chunker.chunk_document(
                    document=doc['content'],
                    document_metadata=document_metadata
                )
                
                # 결과 저장
                doc_chunks = []
                for chunk in document_chunks:
                    doc_chunks.append({
                        'content': chunk.content,
                        'metadata': {
                            'chunk_type': chunk.metadata.chunk_type,
                            'source_section': chunk.metadata.source_section,
                            'document_type': chunk.metadata.document_type,
                            'priority': chunk.metadata.priority,
                            'keywords': chunk.metadata.keywords
                        },
                        'document_title': doc['title']
                    })
                
                all_chunks.extend(doc_chunks)
                
                # 분석 정보 저장
                chunk_analysis.append({
                    'document': doc['title'],
                    'strategy_used': analysis['recommended_strategy'],
                    'chunk_count': len(document_chunks),
                    'analysis': analysis,
                    'chunks_preview': doc_chunks[:3]  # 처음 3개 청크만 미리보기
                })
            
            # 청킹 결과 저장
            self.chunking_results = {
                'chunks': all_chunks,
                'settings': self.current_chunk_settings,
                'total_chunks': len(all_chunks),
                'total_documents': len(target_documents),
                'analysis': chunk_analysis
            }
            
            # 상태 메시지 생성
            total_strategies = set(analysis['strategy_used'] for analysis in chunk_analysis)
            status_html = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); border: 2px solid #4caf50; border-radius: 12px; padding: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #2c3e50;">✅ 지능형 청킹 완료!</h4>
                    <div style="color: #495057;">
                        <div><strong>📄 처리된 문서:</strong> {len(target_documents)}개</div>
                        <div><strong>✂️ 생성된 청크:</strong> {len(all_chunks)}개</div>
                        <div><strong>🧠 사용된 전략:</strong> {', '.join(total_strategies)}</div>
                        <div><strong>⚙️ 기본 청크 크기:</strong> {self.current_chunk_settings['chunk_size']:,} 문자</div>
                    </div>
                </div>
            </div>
            """
            
            # 분석 결과 생성
            analysis_text = f"🔬 **지능형 청킹 분석 결과**\n\n"
            analysis_text += f"📊 **전체 요약:**\n"
            analysis_text += f"• 처리된 문서: {len(target_documents)}개\n"
            analysis_text += f"• 생성된 청크: {len(all_chunks)}개\n"
            analysis_text += f"• 사용된 청킹 전략: {', '.join(total_strategies)}\n\n"
            
            analysis_text += "📄 **문서별 상세 분석:**\n"
            for doc_analysis in chunk_analysis:
                analysis_text += f"\n🔍 **{doc_analysis['document']}**\n"
                analysis_text += f"• 감지된 문서 유형: {doc_analysis['strategy_used']}\n"
                analysis_text += f"• 생성된 청크 수: {doc_analysis['chunk_count']}개\n"
                
                # 청크 유형별 분포 표시
                chunk_types = {}
                for chunk in doc_analysis['chunks_preview']:
                    chunk_type = chunk['metadata']['chunk_type']
                    chunk_types[chunk_type] = chunk_types.get(chunk_type, 0) + 1
                
                analysis_text += f"• 청크 유형 분포: {', '.join(f'{k}({v}개)' for k, v in chunk_types.items())}\n"
                
                # 우선순위 분포
                priorities = [chunk['metadata']['priority'] for chunk in doc_analysis['chunks_preview']]
                if priorities:
                    avg_priority = sum(priorities) / len(priorities)
                    analysis_text += f"• 평균 우선순위: {avg_priority:.1f}\n"
            
            return status_html, analysis_text
            
        except Exception as e:
            logger.error(f"청킹 실행 중 오류 발생: {e}")
            return (
                f"<div style='text-align: center; color: #dc3545; padding: 20px; font-weight: 600;'>❌ 청킹 실패: {str(e)}</div>",
                f"❌ 청킹 실패: {str(e)}"
            )

    def get_chunk_cards(self) -> str:
        """생성된 청크들을 카드 형태로 반환"""
        if not self.chunking_results:
            return "<div style='text-align: center; color: #6c757d; padding: 40px; font-weight: 600;'>📭 청킹을 먼저 실행해주세요.</div>"
        
        chunks = self.chunking_results['chunks']
        
        html_output = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">📄 생성된 청크들 (총 {len(chunks)}개)</h3>
            <div style="display: flex; overflow-x: auto; gap: 16px; padding-bottom: 10px;">
        """
        
        for i, chunk in enumerate(chunks):
            # 내용 미리보기 (최대 150자)
            content_preview = chunk['content'][:150] + "..." if len(chunk['content']) > 150 else chunk['content']
            
            # 문서 타입에 따른 색상 설정
            if chunk['type'] == 'sample_data':
                bg_color = '#e8f5e8'
                border_color = '#4caf50'
                icon = '📖'
            else:
                bg_color = '#fff3e0'
                border_color = '#ff9800'
                icon = '✍️'
            
            html_output += f"""
            <div style="
                background: linear-gradient(135deg, {bg_color} 0%, {bg_color.replace('e8', 'f0').replace('f3', 'f8')} 100%);
                border: 2px solid {border_color};
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: transform 0.2s ease-in-out;
                min-width: 300px;
                flex-shrink: 0;
            " onclick="showChunkContent({i})" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 18px;">{icon}</span>
                    <span style="font-size: 12px; color: #666; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px;">
                        청크 {chunk['chunk_id']}
                    </span>
                </div>
                
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                    <div><strong>📄 문서:</strong> {chunk['document_title']}</div>
                    <div><strong>📏 크기:</strong> {chunk['length']:,} 문자</div>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.8);
                    border-radius: 6px;
                    padding: 10px;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #555;
                    max-height: 80px;
                    overflow: hidden;
                ">
                    {content_preview}
                </div>
            </div>
            """
        
        html_output += """
            </div>
            <script>
            function showChunkContent(chunkIndex) {
                // 이 함수는 Gradio의 JavaScript 이벤트와 연동되어야 함
                console.log('Chunk clicked:', chunkIndex);
            }
            </script>
        </div>
        """
        
        return html_output

    def get_chunk_content(self, chunk_index: int) -> str:
        """특정 청크의 전체 내용 반환"""
        if not self.chunking_results:
            return "❌ 청킹을 먼저 실행해주세요."
        
        chunks = self.chunking_results['chunks']
        
        if chunk_index < 0 or chunk_index >= len(chunks):
            return "❌ 잘못된 청크 인덱스입니다."
        
        chunk = chunks[chunk_index]
        
        return f"""📄 **청크 상세 내용**

**문서 정보:**
• 문서 제목: {chunk['document_title']}
• 문서 출처: {chunk['document_source']}
• 청크 ID: {chunk['chunk_id']}
• 청크 크기: {chunk['length']:,} 문자
• 문서 타입: {chunk['type']}

**청크 내용:**
{chunk['content']}"""

    def get_chunking_results(self):
        """청킹 결과 반환 (다른 인터페이스에서 사용)"""
        return self.chunking_results
