"""
Document Load Interface
문서 로딩 관련 그라디오 인터페이스
"""

import logging
from pathlib import Path
from typing import List, Dict, Any
from .ui_components import UIComponents

logger = logging.getLogger(__name__)


class DocumentLoadInterface:
    """문서 로딩 관련 인터페이스"""
    
    def __init__(self):
        self.sample_data = []
        self.manual_documents = []
        self.sample_data_loaded = False

    def load_sample_data(self) -> str:
        """sampledata 디렉토리에서 샘플 데이터 로드"""
        try:
            sample_path = Path("sampledata")
            
            if not sample_path.exists():
                return UIComponents.create_error_message("sampledata 디렉토리를 찾을 수 없습니다")
            
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
                return UIComponents.create_error_message("샘플 데이터를 찾을 수 없습니다")
            
            # 샘플 데이터를 메모리에 저장
            self.sample_data = sample_data
            self.sample_data_loaded = True
            
            # 간단한 카드 형태로 결과 표시 (사이드 스크롤바 없음)
            html_output = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">📚 샘플 데이터 로드 완료! (총 {len(sample_data)}개)</h3>
            """
            
            for i, data in enumerate(sample_data, 1):
                style = UIComponents.get_document_card_style('sample_data')
                
                html_output += UIComponents.create_simple_document_card(
                    title=data['title'],
                    source=data['source'],
                    content_length=len(data['content']),
                    doc_type='sample_data',
                    bg_color=style['bg_color'],
                    border_color=style['border_color'],
                    icon=style['icon']
                )
            
            html_output += """
            </div>
            """
            
            return html_output
            
        except Exception as e:
            logger.error(f"샘플 데이터 로드 중 오류 발생: {e}")
            return UIComponents.create_error_message(f"샘플 데이터 로드 실패: {str(e)}")

    def add_document(self, content: str, source: str = "manual_input") -> str:
        """메모리에 문서 로드"""
        if not content.strip():
            return UIComponents.create_error_message("내용을 입력해주세요")
        
        try:
            document_data = {
                "content": content.strip(),
                "source": source,
                "title": f"수동 입력: {source}",
                "timestamp": "demo"
            }
            
            self.manual_documents.append(document_data)
            
            details = [
                f"📄 제목: {document_data['title']}",
                f"📏 크기: {len(content.strip()):,} 문자",
                f"📁 출처: {source}"
            ]
            
            return UIComponents.create_success_message("문서 로드 완료!", details, '#fff3e0', '#ff9800')
                
        except Exception as e:
            logger.error(f"문서 로드 중 오류 발생: {e}")
            return UIComponents.create_error_message(f"오류: {str(e)}")

    def get_all_documents_preview(self) -> str:
        """모든 로드된 문서 통합 미리보기"""
        all_documents = []
        
        # 샘플 데이터 추가
        if self.sample_data:
            for data in self.sample_data:
                all_documents.append({
                    **data,
                    'type': 'sample_data',
                    'icon': '📖',
                    'bg_color': '#e8f5e8',
                    'border_color': '#4caf50'
                })
        
        # 수동 문서 추가
        if self.manual_documents:
            for data in self.manual_documents:
                all_documents.append({
                    **data,
                    'type': 'manual_input',
                    'icon': '✍️',
                    'bg_color': '#fff3e0',
                    'border_color': '#ff9800'
                })
        
        if not all_documents:
            return UIComponents.create_empty_state("아직 로드된 문서가 없습니다.")
        
        # HTML 카드 형태로 출력
        html_output = UIComponents.create_card_container("로드된 문서 미리보기", len(all_documents))
        
        for i, data in enumerate(all_documents, 1):
            content_preview = UIComponents.create_content_preview(data['content'], 200)
            style = UIComponents.get_document_card_style(data['type'])
            
            html_output += UIComponents.create_document_card(
                title=data['title'],
                source=data['source'],
                content_length=len(data['content']),
                content_preview=content_preview,
                doc_type=data['type'],
                bg_color=style['bg_color'],
                border_color=style['border_color'],
                icon=style['icon']
            )
        
        html_output += UIComponents.close_card_container()
        
        return html_output

    def get_document_list(self) -> str:
        """메모리에 로드된 문서 목록을 HTML 형태로 반환"""
        all_documents = []
        
        # 샘플 데이터 추가
        if self.sample_data:
            for data in self.sample_data:
                all_documents.append({
                    **data,
                    'type': 'sample_data',
                    'icon': '📖',
                    'bg_color': '#e8f5e8',
                    'border_color': '#4caf50'
                })
        
        # 수동 문서 추가
        if self.manual_documents:
            for data in self.manual_documents:
                all_documents.append({
                    **data,
                    'type': 'manual_input',
                    'icon': '✍️',
                    'bg_color': '#fff3e0',
                    'border_color': '#ff9800'
                })
        
        if not all_documents:
            return "<div style='text-align: center; color: #6c757d; padding: 20px; font-weight: 600;'>📭 아직 로드된 문서가 없습니다. DocumentLoad 탭에서 문서를 먼저 로드해주세요.</div>"
        
        # HTML 목록 형태로 출력
        html_output = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">📋 로드된 문서 목록 (총 {len(all_documents)}개)</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
        """
        
        for i, data in enumerate(all_documents, 1):
            html_output += f"""
            <div style="
                background: linear-gradient(135deg, {data['bg_color']} 0%, {data['bg_color'].replace('e8', 'f0').replace('f3', 'f8')} 100%);
                border: 2px solid {data['border_color']};
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 20px; margin-right: 8px;">{data['icon']}</span>
                    <h4 style="margin: 0; color: #2c3e50; font-size: 14px; font-weight: 600;">
                        {data['title']}
                    </h4>
                </div>
                
                <div style="font-size: 12px; color: #666; line-height: 1.4;">
                    <div><strong>📁 출처:</strong> {data['source']}</div>
                    <div><strong>📏 크기:</strong> {len(data['content']):,} 문자</div>
                    <div><strong>🏷️ 타입:</strong> {data['type']}</div>
                </div>
            </div>
            """
        
        html_output += """
            </div>
        </div>
        """
        
        return html_output

    def get_document_choices(self) -> List[str]:
        """선택 가능한 문서 목록 반환 (인덱스 포함)"""
        choices = []
        
        # 샘플 데이터 추가 (인덱스 포함)
        if self.sample_data:
            for i, data in enumerate(self.sample_data):
                choices.append(f"📖 {data['title']} ({data['source']}) [S{i}]")
        
        # 수동 문서 추가 (인덱스 포함)
        if self.manual_documents:
            for i, data in enumerate(self.manual_documents):
                choices.append(f"✍️ {data['title']} ({data['source']}) [M{i}]")
        
        return choices

    def get_all_documents(self) -> List[Dict[str, Any]]:
        """모든 문서 데이터 반환 (다른 인터페이스에서 사용)"""
        all_documents = []
        
        if self.sample_data:
            all_documents.extend(self.sample_data)
        
        if self.manual_documents:
            all_documents.extend(self.manual_documents)
        
        return all_documents

    def get_document_by_index(self, index: int) -> Dict[str, Any]:
        """인덱스로 특정 문서 가져오기"""
        all_documents = []
        
        # 샘플 데이터 추가
        if self.sample_data:
            for data in self.sample_data:
                all_documents.append({
                    **data,
                    'type': 'sample_data',
                    'icon': '📖',
                    'bg_color': '#e8f5e8',
                    'border_color': '#4caf50'
                })
        
        # 수동 문서 추가
        if self.manual_documents:
            for data in self.manual_documents:
                all_documents.append({
                    **data,
                    'type': 'manual_input',
                    'icon': '✍️',
                    'bg_color': '#fff3e0',
                    'border_color': '#ff9800'
                })
        
        if not all_documents or index < 0 or index >= len(all_documents):
            return None
        
        return all_documents[index]

    def get_document_by_choice(self, choice: str) -> Dict[str, Any]:
        """선택된 문서 문자열로 특정 문서 가져오기 (인덱스 기반)"""
        logger.info(f"🔍 문서 검색 시작: '{choice}'")
        
        # 인덱스 추출
        if "[S" in choice:  # 샘플 데이터
            try:
                # [S0], [S1] 등의 형태에서 인덱스 추출
                start_idx = choice.find("[S") + 2
                end_idx = choice.find("]", start_idx)
                if end_idx != -1:
                    index = int(choice[start_idx:end_idx])
                    if 0 <= index < len(self.sample_data):
                        data = self.sample_data[index]
                        logger.info(f"✅ 샘플 데이터 매칭 성공: 인덱스 {index} - {data['title']}")
                        return {
                            **data,
                            'type': 'sample_data',
                            'icon': '📖',
                            'bg_color': '#e8f5e8',
                            'border_color': '#4caf50'
                        }
            except (ValueError, IndexError) as e:
                logger.error(f"❌ 샘플 데이터 인덱스 파싱 오류: {e}")
        
        elif "[M" in choice:  # 수동 입력 문서
            try:
                # [M0], [M1] 등의 형태에서 인덱스 추출
                start_idx = choice.find("[M") + 2
                end_idx = choice.find("]", start_idx)
                if end_idx != -1:
                    index = int(choice[start_idx:end_idx])
                    if 0 <= index < len(self.manual_documents):
                        data = self.manual_documents[index]
                        logger.info(f"✅ 수동 입력 매칭 성공: 인덱스 {index} - {data['title']}")
                        return {
                            **data,
                            'type': 'manual_input',
                            'icon': '✍️',
                            'bg_color': '#fff3e0',
                            'border_color': '#ff9800'
                        }
            except (ValueError, IndexError) as e:
                logger.error(f"❌ 수동 입력 인덱스 파싱 오류: {e}")
        
        logger.warning(f"❌ 문서를 찾을 수 없음: '{choice}'")
        return None

    def get_document_titles(self) -> List[str]:
        """모든 문서의 제목 목록 반환"""
        titles = []
        
        # 샘플 데이터 추가
        if self.sample_data:
            for data in self.sample_data:
                titles.append(data['title'])
        
        # 수동 문서 추가
        if self.manual_documents:
            for data in self.manual_documents:
                titles.append(data['title'])
        
        return titles

    def get_document_full_content(self, choice: str) -> str:
        """문서의 전체 내용을 HTML 형태로 반환"""
        document = self.get_document_by_choice(choice)
        
        if not document:
            return UIComponents.create_error_message("문서를 찾을 수 없습니다")
        
        # 파일 확장자에 따른 구문 강조 결정
        source = document['source'].lower()
        language = 'markdown'  # 기본값
        
        if source.endswith('.py'):
            language = 'python'
        elif source.endswith('.js') or source.endswith('.ts'):
            language = 'javascript'
        elif source.endswith('.html'):
            language = 'html'
        elif source.endswith('.css'):
            language = 'css'
        elif source.endswith('.json'):
            language = 'json'
        elif source.endswith('.yaml') or source.endswith('.yml'):
            language = 'yaml'
        elif source.endswith('.sql'):
            language = 'sql'
        elif source.endswith('.md'):
            language = 'markdown'
        elif source.endswith('.txt'):
            language = 'text'
        
        # HTML 출력 생성
        html_output = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="
                background: linear-gradient(135deg, {document['bg_color']} 0%, {document['bg_color'].replace('e8', 'f0').replace('f3', 'f8')} 100%);
                border: 2px solid {document['border_color']};
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            ">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <span style="font-size: 24px; margin-right: 12px;">{document['icon']}</span>
                    <h3 style="margin: 0; color: #2c3e50; font-size: 18px; font-weight: 600;">
                        {document['title']}
                    </h3>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
                        <strong>📁 출처:</strong> {document['source']}
                    </div>
                    <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
                        <strong>📏 크기:</strong> {len(document['content']):,} 문자
                    </div>
                    <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
                        <strong>🏷️ 타입:</strong> {document['type']}
                    </div>
                    <div style="font-size: 13px; color: #666;">
                        <strong>🔤 언어:</strong> {language.upper()}
                    </div>
                </div>
            </div>
            
            <div style="
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                max-height: 600px;
                overflow-y: auto;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.5;
                white-space: pre-wrap;
                word-wrap: break-word;
            ">
                <div style="
                    background: #e9ecef;
                    padding: 8px 12px;
                    margin: -20px -20px 16px -20px;
                    border-radius: 8px 8px 0 0;
                    font-weight: 600;
                    color: #495057;
                    font-size: 12px;
                ">
                    📄 전체 내용 ({language.upper()})
                </div>
                {document['content']}
            </div>
        </div>
        """
        
        return html_output
