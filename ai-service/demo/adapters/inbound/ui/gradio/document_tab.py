"""
Document Management Tab Adapter
문서 관리 탭 어댑터

헥사고널 아키텍처에 맞게 Use Case들을 통해 도메인 서비스를 호출합니다.
문서 CRUD 기능의 UI만 담당합니다.
"""

import gradio as gr
import logging
from typing import List, Tuple, Any
from application.services.load_sample_documents_usecase import LoadSampleDocumentsUseCase
from application.services.add_document_usecase import AddDocumentUseCase
from application.services.get_documents_preview_usecase import GetDocumentsPreviewUseCase
from application.services.get_document_content_usecase import GetDocumentContentUseCase
from domain.services.document_management_service import DocumentService
from .components.ui_components import UIComponents

logger = logging.getLogger(__name__)


class DocumentTabAdapter:
    """문서 관리 탭 어댑터 - 문서 CRUD UI만 담당"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        
        # Use Case 초기화
        self.load_sample_usecase = LoadSampleDocumentsUseCase(document_service)
        self.add_document_usecase = AddDocumentUseCase(document_service)
        self.get_preview_usecase = GetDocumentsPreviewUseCase(document_service)
        self.get_content_usecase = GetDocumentContentUseCase(document_service)
        
        logger.info("✅ Document Tab Adapter initialized with Use Cases")
    
    def create_tab(self) -> gr.Tab:
        """문서 관리 탭 생성"""
        with gr.Tab("📄 DocumentLoad", id=0) as tab:
            gr.Markdown("## 📄 DocumentLoad")
            gr.Markdown("문서를 로드하고 준비합니다")
            
            with gr.Row():
                # 왼쪽: 샘플 데이터 로드
                with gr.Column(scale=1):
                    gr.Markdown("### 🚀 빠른 시작: 샘플 데이터 로드")
                    gr.Markdown("AI 포트폴리오 프로젝트의 핵심 문서들을 로드합니다.")
                    load_sample_btn = gr.Button("📚 샘플 데이터 로드", variant="primary", size="lg")
                    sample_status = gr.HTML(
                        label="로드 상태",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>샘플 데이터를 로드하면 여기에 결과가 표시됩니다.</div>"
                    )
                
                # 오른쪽: 수동 문서 추가
                with gr.Column(scale=1):
                    gr.Markdown("### 📝 수동 문서 추가")
                    gr.Markdown("직접 문서를 입력하여 메모리에 로드합니다.")
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
                    add_btn = gr.Button("📥 문서 로드", variant="primary")
                    add_output = gr.HTML(
                        label="로드 상태",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>문서를 로드하면 여기에 결과가 표시됩니다.</div>"
                    )
            
            # 통합 미리보기 섹션
            gr.Markdown("### 👁️ 로드된 문서 미리보기")
            preview_output = gr.HTML(
                label="문서 미리보기",
                value="<div style='text-align: center; color: #666; padding: 40px;'>문서를 로드하면 자동으로 미리보기가 업데이트됩니다.</div>"
            )
            
            # 문서 내용 조회 섹션
            gr.Markdown("### 📖 문서 전체 내용 조회")
            
            with gr.Row():
                # 문서 선택 드롭다운
                doc_select = gr.Dropdown(
                    label="문서 선택",
                    choices=[],
                    value=None,
                    allow_custom_value=False,
                    interactive=True
                )
                refresh_btn = gr.Button("🔄 목록 새로고침", variant="secondary")
                view_content_btn = gr.Button("📖 전체 내용 보기", variant="primary")
            
            doc_content_output = gr.HTML(
                label="문서 내용",
                value="<div style='text-align: center; color: #666; padding: 40px;'>문서를 선택하고 '전체 내용 보기' 버튼을 클릭하세요.</div>"
            )
            
            # Event handlers  
            load_sample_btn.click(
                fn=self._load_sample_data,
                outputs=[sample_status, preview_output, doc_select]
            )
            add_btn.click(
                fn=self._add_document,
                inputs=[doc_input, source_input],
                outputs=[add_output, preview_output, doc_select]
            )
            refresh_btn.click(
                fn=self._refresh_document_list,
                outputs=doc_select
            )
            view_content_btn.click(
                fn=self._get_document_content,
                inputs=[doc_select],
                outputs=[doc_content_output]
            )
        
        # 드롭다운 컴포넌트 참조 저장 (나중에 업데이트용)
        self._doc_select_component = doc_select
        
        return tab
    
    async def initialize_document_list(self):
        """초기 문서 목록 로드"""
        try:
            # _refresh_document_list은 이제 gr.update(...) 객체를 반환하므로
            # 초기화 호출 시 UI에 바로 적용 가능한 업데이트 객체를 반환합니다.
            choices_update = await self._refresh_document_list()
            if hasattr(self, '_doc_select_component'):
                logger.info(f"초기 문서 목록 준비 완료")
            return choices_update
        except Exception as e:
            logger.error(f"초기 문서 목록 로드 실패: {e}")
            return gr.update(choices=[], value=None)
    
    async def _refresh_document_list(self) -> Any:
        """문서 목록 새로고침 (UI 이벤트 핸들러)"""
        try:
            preview_result = await self.get_preview_usecase.execute()
            
            if preview_result["success"]:
                doc_choices = self._create_document_choices(preview_result)
                logger.info(f"문서 목록 새로고침: {len(doc_choices)}개")
                # gr.Dropdown.update 대신 gr.update 사용
                return gr.update(choices=doc_choices, value=None)
            else:
                logger.warning("문서 목록 새로고침 실패")
                return gr.update(choices=[], value=None)
                
        except Exception as e:
            logger.error(f"Error in _refresh_document_list: {e}")
            return gr.update(choices=[], value=None)
    
    async def _load_sample_data(self) -> Tuple[str, str, Any]:
        """샘플 데이터 로드 (UI 이벤트 핸들러)"""
        try:
            result = await self.load_sample_usecase.execute()
            
            if result["success"]:
                preview_result = await self.get_preview_usecase.execute()
                preview_html = self._create_preview_html(preview_result)
                
                doc_choices = self._create_document_choices(preview_result)
                logger.info(f"샘플 데이터 로드 후 드롭다운 선택지 생성: {len(doc_choices)}개")
                
                success_html = self._create_success_html(result)
                # gr.Dropdown.update -> gr.update
                return success_html, preview_html, gr.update(choices=doc_choices, value=None)
            else:
                error_html = self._create_error_html(result["message"])
                return error_html, "", gr.update(choices=[], value=None)
                
        except Exception as e:
            logger.error(f"Error in _load_sample_data: {e}")
            error_html = self._create_error_html(f"샘플 데이터 로드 중 오류 발생: {str(e)}")
            return error_html, "", gr.update(choices=[], value=None)
    
    async def _add_document(self, content: str, source: str) -> Tuple[str, str, Any]:
        """문서 추가 (UI 이벤트 핸들러)"""
        try:
            if not content.strip():
                error_html = self._create_error_html("내용을 입력해주세요")
                return error_html, "", gr.update(choices=[], value=None)
            
            result = await self.add_document_usecase.execute(content, source)
            
            if result["success"]:
                preview_result = await self.get_preview_usecase.execute()
                preview_html = self._create_preview_html(preview_result)
                
                doc_choices = self._create_document_choices(preview_result)
                
                success_html = self._create_success_html(result)
                return success_html, preview_html, gr.update(choices=doc_choices, value=None)
            else:
                error_html = self._create_error_html(result["error"])
                return error_html, "", gr.update(choices=[], value=None)
                
        except Exception as e:
            logger.error(f"Error in _add_document: {e}")
            error_html = self._create_error_html(f"문서 추가 중 오류 발생: {str(e)}")
            return error_html, "", gr.update(choices=[], value=None)
    
    def _create_document_choices(self, result: dict) -> list:
        """드롭다운 선택지 생성"""
        # 문서가 있는지 확인 (has_documents 또는 documents 키 확인)
        has_docs = result.get("has_documents", False) or (result.get("documents") and len(result["documents"]) > 0)
        
        if not result["success"] or not has_docs:
            logger.warning("문서가 없어서 드롭다운 선택지를 생성할 수 없습니다")
            return []
        
        choices = []
        documents = result.get("documents", [])
        for doc in documents:
            # (표시텍스트, 실제값) 형태로 반환
            display_text = f"{doc['title']} ({doc['document_type']}) - {doc['source']}"
            document_id = doc['document_id']
            choices.append((display_text, document_id))
        
        logger.info(f"드롭다운 선택지 생성 완료: {len(choices)}개")
        logger.debug(f"선택지 목록: {choices}")
        return choices
    
    def _create_document_choices_from_documents(self, documents: list) -> list:
        """문서 리스트에서 드롭다운 선택지 생성"""
        if not documents:
            logger.warning("문서 리스트가 비어있어서 드롭다운 선택지를 생성할 수 없습니다")
            return []
        
        choices = []
        for doc in documents:
            # (표시텍스트, 실제값) 형태로 반환
            display_text = f"{doc['title']} ({doc['document_type']}) - {doc['source']}"
            document_id = doc['document_id']
            choices.append((display_text, document_id))
        
        logger.info(f"문서 리스트에서 드롭다운 선택지 생성 완료: {len(choices)}개")
        return choices
    
    async def _get_document_content(self, document_id: str) -> str:
        """문서 전체 내용 조회 (UI 이벤트 핸들러)"""
        try:
            if not document_id or not document_id.strip():
                return self._create_error_html("문서를 선택해주세요")
            
            # Use Case를 통한 문서 내용 조회
            result = await self.get_content_usecase.execute(document_id)
            
            if result["success"]:
                # 성공 시 문서 내용 HTML 생성
                content_html = self._create_document_content_html(result["document"])
                return content_html
            else:
                # 실패 시 에러 메시지
                error_html = self._create_error_html(result["message"])
                return error_html
                
        except Exception as e:
            logger.error(f"Error in _get_document_content: {e}")
            error_html = self._create_error_html(f"문서 내용 조회 중 오류 발생: {str(e)}")
            return error_html
    
    def _create_success_html(self, result: dict) -> str:
        """성공 메시지 HTML 생성"""
        return f"""
        <div style="
            background: #d4edda;
            color: #155724;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #c3e6cb;
            margin-bottom: 16px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <strong>✅ {result.get('message', '작업이 성공적으로 완료되었습니다')}</strong>
        </div>
        """
    
    def _create_error_html(self, error_message: str) -> str:
        """에러 메시지 HTML 생성"""
        return f"""
        <div style="
            background: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #f5c6cb;
            margin-bottom: 16px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <strong>❌ {error_message}</strong>
        </div>
        """
    
    def _create_preview_html(self, result: dict) -> str:
        """문서 미리보기 HTML 생성"""
        if not result["success"]:
            # 에러 메시지는 이미 상위에서 표시되므로 여기서는 빈 문자열 반환
            return ""
        
        if not result["has_documents"]:
            return f"""
            <div style="text-align: center; color: #666; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h3>📭 {result['message']}</h3>
            </div>
            """
        
        html_output = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">📚 로드된 문서 미리보기 (총 {result['total_count']}개)</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        """
        
        for doc in result["documents"]:
            html_output += self._create_document_card(doc)
        
        html_output += """
            </div>
        </div>
        """
        
        return html_output
    
    def _create_document_content_html(self, doc: dict) -> str:
        """문서 전체 내용 HTML 생성"""
        doc_type = doc.get("document_type", "unknown")
        
        # 타입별 스타일 설정
        if doc_type == "PROJECT":
            bg_color = "#e3f2fd"
            border_color = "#2196f3"
            icon = "🚀"
        elif doc_type == "QA":
            bg_color = "#fff3e0"
            border_color = "#ff9800"
            icon = "❓"
        else:
            bg_color = "#e8f5e8"
            border_color = "#4caf50"
            icon = "📖"
        
        # 태그 HTML 생성
        tags_html = ""
        if doc.get("tags"):
            tags_html = f"""
            <div style="margin-bottom: 16px;">
                <strong>🏷️ 태그:</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
                    {''.join([f'<span style="background: {border_color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px;">{tag}</span>' for tag in doc["tags"]])}
                </div>
            </div>
            """
        
        return f"""
        <div style="
            background: {bg_color};
            border: 2px solid {border_color};
            border-radius: 12px;
            padding: 24px;
            margin: 16px 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <span style="font-size: 32px; margin-right: 12px;">{icon}</span>
                <div>
                    <h2 style="margin: 0; color: #2c3e50; font-size: 24px; font-weight: 600;">
                        {doc['title']}
                    </h2>
                    <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">
                        📁 출처: {doc['source']} | 📏 크기: {doc['content_length']:,} 문자 | 🏷️ 타입: {doc_type}
                    </p>
                </div>
            </div>
            
            {tags_html}
            
            {f'<div style="margin-bottom: 16px;"><strong>📝 설명:</strong><p style="margin: 4px 0; color: #555; font-style: italic;">{doc.get("description", "설명 없음")}</p></div>' if doc.get("description") else ''}
            
            <div style="margin-bottom: 16px;">
                <strong>📅 생성일:</strong> {doc.get("created_at", "알 수 없음")} | 
                <strong>📅 수정일:</strong> {doc.get("updated_at", "알 수 없음")}
            </div>
            
            <div style="
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
                max-height: 500px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.6;
                white-space: pre-wrap;
                word-wrap: break-word;
            ">
                {doc['content']}
            </div>
        </div>
        """
    
    def _create_document_card(self, doc: dict) -> str:
        """문서 카드 HTML 생성"""
        doc_type = doc.get("document_type", "unknown")
        
        # 타입별 스타일 설정
        if doc_type == "SAMPLE":
            bg_color = "#e8f5e8"
            border_color = "#4caf50"
            icon = "📖"
        elif doc_type == "PROJECT":
            bg_color = "#e3f2fd"
            border_color = "#2196f3"
            icon = "🚀"
        elif doc_type == "QA":
            bg_color = "#fff3e0"
            border_color = "#ff9800"
            icon = "❓"
        else:
            bg_color = "#fff3e0"
            border_color = "#ff9800"
            icon = "✍️"
        
        return f"""
        <div style="
            background: linear-gradient(135deg, {bg_color} 0%, {bg_color.replace('e8', 'f0').replace('f3', 'f8')} 100%);
            border: 2px solid {border_color};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-width: 300px;
            flex: 1;
            transition: all 0.3s ease;
        " 
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
        >
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px; margin-right: 8px;">{icon}</span>
                <h4 style="margin: 0; color: #2c3e50; font-size: 14px; font-weight: 600;">
                    {doc['title']}
                </h4>
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                <strong>📁 출처:</strong> {doc['source']}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                <strong>📏 크기:</strong> {doc['content_length']:,} 문자
            </div>
            <div style="font-size: 12px; color: #666;">
                <strong>🏷️ 타입:</strong> {doc_type}
            </div>
        </div>
        """
