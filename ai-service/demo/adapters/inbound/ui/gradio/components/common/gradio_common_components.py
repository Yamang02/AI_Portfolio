"""
Gradio Common Components
Gradio 공통 컴포넌트들

모든 Gradio 탭에서 공통으로 사용하는 UI 컴포넌트들을 포함합니다.
"""

from typing import List, Dict, Any


class GradioCommonComponents:
    """Gradio 공통 UI 컴포넌트들 - 모든 탭에서 공통 사용"""
    
    @staticmethod
    def create_step_title(title: str, step_number: int = None) -> str:
        """단계별 타이틀 생성"""
        step_text = f"{step_number}단계: " if step_number is not None else ""
        return f"""
        <div class="step-title" style="
            background: #f8f9fa;
            color: #495057;
            padding: 12px 20px;
            border-radius: 6px;
            margin: 20px 0 15px 0;
            font-weight: 600;
            font-size: 16px;
            border-left: 4px solid #4caf50;
            border-bottom: 1px solid #dee2e6;
        ">
            {step_text}{title}
        </div>
        """
    
    @staticmethod
    def create_section_title(title: str) -> str:
        """섹션별 타이틀 생성"""
        return f"""
        <div class="section-title" style="
            background: #ffffff;
            color: #495057;
            padding: 8px 16px;
            border-radius: 4px;
            margin: 15px 0 10px 0;
            font-weight: 600;
            font-size: 14px;
            border-left: 3px solid #6c757d;
        ">
            {title}
        </div>
        """
    
    @staticmethod
    def create_document_preview_container(title: str, count: int = None) -> str:
        """문서 미리보기 컨테이너 생성 (3열 그리드 레이아웃)"""
        count_text = f" (총 {count}개)" if count is not None else ""
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">{title}{count_text}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        """
    
    @staticmethod
    def close_container() -> str:
        """컨테이너 닫기"""
        return """
            </div>
        </div>
        """
    
    @staticmethod
    def create_document_card(
        title: str,
        source: str,
        content_length: int,
        doc_type: str,
        bg_color: str = None,
        border_color: str = None,
        icon: str = None
    ) -> str:
        """문서 카드 생성 (DocumentLoad/TextSplitter 탭 스타일)"""
        # 문서 타입별 스타일 자동 설정
        if not bg_color or not border_color or not icon:
            style = GradioCommonComponents.get_document_type_style(doc_type)
            bg_color = bg_color or style['bg_color']
            border_color = border_color or style['border_color']
            icon = icon or style['icon']
        
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
                    {title}
                </h4>
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                <strong>📁 출처:</strong> {source}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                <strong>📏 크기:</strong> {content_length:,} 문자
            </div>
            <div style="font-size: 12px; color: #666;">
                <strong>🏷️ 타입:</strong> {doc_type}
            </div>
        </div>
        """
    
    @staticmethod
    def get_document_type_style(doc_type: str) -> Dict[str, str]:
        """문서 타입별 스타일 반환"""
        styles = {
            'SAMPLE': {
                'bg_color': '#e8f5e8',
                'border_color': '#4caf50',
                'icon': '📖'
            },
            'PROJECT': {
                'bg_color': '#e3f2fd',
                'border_color': '#2196f3',
                'icon': '🚀'
            },
            'QA': {
                'bg_color': '#fff3e0',
                'border_color': '#ff9800',
                'icon': '❓'
            },
            'TEXT': {
                'bg_color': '#e8f5e8',
                'border_color': '#4caf50',
                'icon': '📖'
            }
        }
        return styles.get(doc_type, {
            'bg_color': '#fff3e0',
            'border_color': '#ff9800',
            'icon': '✍️'
        })
    
    @staticmethod
    def create_success_message(title: str, details: List[str] = None) -> str:
        """성공 메시지 생성"""
        details_html = ""
        if details:
            for detail in details:
                details_html += f"<div style='margin-bottom: 4px;'>• {detail}</div>"
        
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
            <strong>✅ {title}</strong><br>
            {details_html}
        </div>
        """
    
    @staticmethod
    def create_error_message(message: str) -> str:
        """에러 메시지 생성"""
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
            <strong>❌ {message}</strong>
        </div>
        """
    
    @staticmethod
    def create_empty_state(message: str, icon: str = "📭") -> str:
        """빈 상태 메시지 생성"""
        return f"""
        <div style="text-align: center; color: #666; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            {icon} {message}
        </div>
        """
    
    @staticmethod
    def create_info_message(message: str, bg_color: str = '#fff3e0', border_color: str = '#ff9800') -> str:
        """정보 메시지 생성"""
        return f"""
        <div style="
            background: {bg_color};
            color: #e65100;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid {border_color};
            margin-bottom: 16px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <strong>ℹ️ {message}</strong>
        </div>
        """
    
    @staticmethod
    def create_chunk_card(
        chunk_id: int,
        document_title: str,
        content_length: int,
        content_preview: str,
        chunk_index: int = 0,
        bg_color: str = '#e8f5e8',
        border_color: str = '#4caf50',
        icon: str = '📄'
    ) -> str:
        """청크 카드 생성"""
        # 문서 제목에서 청크 제목 생성
        chunk_title = f"{document_title}_chunk"
        
        return f"""
        <div style="
            background: linear-gradient(135deg, {bg_color} 0%, {bg_color.replace('e8', 'f0').replace('f3', 'f8')} 100%);
            border: 2px solid {border_color};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-width: 280px;
            transition: all 0.3s ease;
            cursor: pointer;
        " 
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
        title="{chunk_title}"
        >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px;">{icon}</span>
                <span style="font-size: 12px; color: #666; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px;">
                    청크 {chunk_id}
                </span>
            </div>
            
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                <div><strong>📄 문서:</strong> {document_title}</div>
                <div><strong>📏 크기:</strong> {content_length:,} 문자</div>
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
                white-space: pre-wrap;
                word-wrap: break-word;
            ">
                {content_preview}
            </div>
        </div>
        """
    
    @staticmethod
    def create_vector_search_chunk_card(
        chunk_id: str,
        document_id: str,
        similarity_score: float,
        content_preview: str,
        chunk_index: int = 0,
        content_length: int = 0,
        rank: int = 1,
        bg_color: str = '#e3f2fd',
        border_color: str = '#2196f3',
        icon: str = '🔍'
    ) -> str:
        """Vector Search용 청크 카드 생성 (유사도 표시)"""
        # 유사도에 따른 색상 조정
        if similarity_score >= 0.7:
            bg_color = '#e8f5e8'
            border_color = '#4caf50'
            icon = '✅'
        elif similarity_score >= 0.4:
            bg_color = '#fff3e0'
            border_color = '#ff9800'
            icon = '⚠️'
        else:
            bg_color = '#ffebee'
            border_color = '#f44336'
            icon = '❌'
        
        # 유사도 백분율 계산
        similarity_percentage = similarity_score * 100
        
        return f"""
        <div style="
            background: linear-gradient(135deg, {bg_color} 0%, {bg_color.replace('e8', 'f0').replace('f3', 'f8')} 100%);
            border: 2px solid {border_color};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-width: 300px;
            transition: all 0.3s ease;
            cursor: pointer;
        " 
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
        title="청크 {chunk_id} (유사도: {similarity_percentage:.1f}%)" data-chunk-id="{chunk_id}" data-rank="{rank}"
        >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px;">{icon}</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="font-size: 12px; color: #666; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px;">
                        순위 #{rank}
                    </span>
                    <span style="font-size: 14px; font-weight: bold; color: {border_color}; margin-top: 2px;">
                        {similarity_percentage:.1f}%
                    </span>
                </div>
            </div>
            
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                <div><strong>📄 문서 ID:</strong> {document_id[:12]}...</div>
                <div style="word-break: break-all;"><strong>🔗 청크 ID:</strong> {chunk_id}</div>
                <div><strong>🔢 인덱스:</strong> {chunk_index}</div>
                <div><strong>📊 크기:</strong> {content_length} 글자</div>
            </div>
            
            <div style="
                background: rgba(255,255,255,0.8);
                border-radius: 6px;
                padding: 10px;
                font-size: 13px;
                line-height: 1.4;
                color: #333;
                max-height: 120px;
                overflow-y: auto;
            ">
                {content_preview}
            </div>
        </div>
        """
    
    @staticmethod
    def create_embedding_card(
        embedding_id: str,
        chunk_id: str,
        model_name: str,
        vector_dimension: int,
        vector_norm: float,
        created_at: str,
        vector_preview: str = "",
        bg_color: str = '#e3f2fd',
        border_color: str = '#2196f3',
        icon: str = '🧠'
    ) -> str:
        """임베딩 카드 생성"""
        return f"""
        <div style="
            background: linear-gradient(135deg, {bg_color} 0%, {bg_color.replace('e3', 'f0').replace('f2', 'f8')} 100%);
            border: 2px solid {border_color};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
            transition: all 0.3s ease;
            cursor: pointer;
        " 
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
        title="임베딩 {embedding_id}"
        >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px;">{icon}</span>
                <span style="font-size: 12px; color: #666; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px;">
                    임베딩 {embedding_id[:8]}...
                </span>
            </div>
            
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                <div><strong>🔗 청크:</strong> {chunk_id}</div>
                <div><strong>🤖 모델:</strong> {model_name}</div>
                <div><strong>📐 차원:</strong> {vector_dimension}차원</div>
                <div><strong>📏 노름:</strong> {vector_norm:.4f}</div>
                <div><strong>⏰ 생성:</strong> {created_at}</div>
            </div>
            
            {f'''
            <div style="
                background: rgba(255,255,255,0.8);
                border-radius: 6px;
                padding: 10px;
                font-size: 11px;
                line-height: 1.4;
                color: #555;
                max-height: 80px;
                overflow-y: auto;
                overflow-x: hidden;
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: monospace;
                border: 1px solid rgba(0,0,0,0.1);
            ">
                <strong>벡터 미리보기:</strong><br>
                {vector_preview}
            </div>
            ''' if vector_preview else ''}
        </div>
        """
    
    @staticmethod
    def create_embedding_preview_container(embeddings_html: str, total_count: int) -> str:
        """임베딩 미리보기 컨테이너 생성"""
        return f"""
        <div style="
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px solid #6c757d;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 2px solid #dee2e6;
            ">
                <h3 style="
                    margin: 0;
                    color: #495057;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    🧠 생성된 임베딩 미리보기
                </h3>
                <span style="
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(0,123,255,0.3);
                ">
                    총 {total_count}개
                </span>
            </div>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                max-height: 400px;
                overflow-y: auto;
                padding: 8px;
            ">
                {embeddings_html}
            </div>
        </div>
        """
    
    @staticmethod
    def create_vector_card(
        embedding_id: str,
        chunk_id: str,
        model_name: str,
        vector_dimension: int,
        created_at: str,
        document_source: str,
        chunk_preview: str,
        vector_preview: str = "",
        vector_norm: float = 0.0,
        bg_color: str = '#f3e5f5',
        border_color: str = '#9c27b0',
        icon: str = '🔍'
    ) -> str:
        """벡터 카드 생성 (벡터스토어 내용용)"""
        return f"""
        <div style="
            background: linear-gradient(135deg, {bg_color} 0%, {bg_color.replace('f3', 'f8').replace('e5', 'f0')} 100%);
            border: 2px solid {border_color};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
            transition: all 0.3s ease;
            cursor: pointer;
        " 
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
        title="벡터 {embedding_id}"
        >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px;">{icon}</span>
                <span style="font-size: 12px; color: #666; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px;">
                    벡터 {embedding_id[:8]}...
                </span>
            </div>
            
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                <div><strong>🔗 청크:</strong> {chunk_id}</div>
                <div><strong>🤖 모델:</strong> {model_name}</div>
                <div><strong>📐 차원:</strong> {vector_dimension}차원</div>
                <div><strong>📄 문서 ID:</strong> {document_source}</div>
                <div><strong>⏰ 생성:</strong> {created_at}</div>
            </div>
            
            <div style="
                background: rgba(255,255,255,0.8);
                border-radius: 6px;
                padding: 10px;
                font-size: 11px;
                line-height: 1.4;
                color: #555;
                max-height: 60px;
                overflow-y: auto;
                overflow-x: hidden;
                white-space: pre-wrap;
                word-wrap: break-word;
                margin-bottom: 8px;
                border: 1px solid rgba(0,0,0,0.1);
            ">
                <strong>청크 미리보기:</strong><br>
                {chunk_preview}
            </div>
            
            {f'''
            <div style="
                background: rgba(255,255,255,0.8);
                border-radius: 6px;
                padding: 10px;
                font-size: 11px;
                line-height: 1.4;
                color: #555;
                max-height: 80px;
                overflow-y: auto;
                overflow-x: hidden;
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: monospace;
                border: 1px solid rgba(0,0,0,0.1);
            ">
                <strong>벡터 미리보기:</strong><br>
                {vector_preview}
                <br><strong>노름:</strong> {vector_norm:.4f}
            </div>
            ''' if vector_preview else ''}
        </div>
        """
    
    @staticmethod
    def create_document_preview_html(result: dict) -> str:
        """문서 미리보기 HTML 생성"""
        if not result["success"]:
            return GradioCommonComponents.create_error_message("문서 목록을 불러올 수 없습니다.")
        
        if not result.get("has_documents", False):
            return GradioCommonComponents.create_empty_state(
                "로드된 문서가 없습니다.\n샘플 데이터를 로드하거나 새 문서를 추가해주세요.",
                "📄"
            )
        
        documents = result.get("documents", [])
        html = "<div style='display: grid; gap: 12px;'>"
        
        for doc in documents:
            html += GradioCommonComponents.create_document_card(
                title=doc.get("title", "제목 없음"),
                source=doc.get("source", "출처 없음"),
                content_length=doc.get("word_count", 0),
                doc_type=doc.get("document_type", "unknown")
            )
        
        html += "</div>"
        return html
    
    @staticmethod
    def create_ai_answer_card(answer: str, title: str = "🤖 AI 답변") -> str:
        """AI 답변 카드 생성"""
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 16px;">{title}</h3>
            <div style="
                background: #e8f5e8;
                border: 2px solid #4caf50;
                border-radius: 8px;
                padding: 16px;
                line-height: 1.6;
                white-space: pre-wrap;
            ">
                {answer}
            </div>
        </div>
        """
    
    @staticmethod
    def create_info_card(content: str, title: str, bg_color: str = "#f8f9fa", border_color: str = "#dee2e6") -> str:
        """정보 카드 생성 (범용)"""
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 16px;">{title}</h3>
            <div style="
                background: {bg_color};
                border: 1px solid {border_color};
                border-radius: 6px;
                padding: 16px;
                line-height: 1.6;
                white-space: pre-wrap;
            ">
                {content}
            </div>
        </div>
        """
    
    @staticmethod
    def create_content_card(content: str, title: str, max_height: str = "400px") -> str:
        """내용 카드 생성 (문서/청크 내용용)"""
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 16px;">{title}</h3>
            <div style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 16px;
                max-height: {max_height};
                overflow-y: auto;
                white-space: pre-wrap;
                line-height: 1.6;
            ">
                {content}
            </div>
        </div>
        """
    
    @staticmethod
    def create_model_info_card(model_data: Dict[str, Any], title: str, icon: str, bg_color: str, border_color: str, text_color: str) -> str:
        """모델 정보 카드 생성"""
        model_name = model_data.get('model_name', '알 수 없음')
        status = model_data.get('status', '알 수 없음')
        model_type = model_data.get('type', model_data.get('dimension', '알 수 없음'))
        
        return f"""
        <div style="background: {bg_color}; border: 2px solid {border_color}; border-radius: 8px; padding: 16px;">
            <h4 style="color: {text_color}; margin-bottom: 12px;">{icon} {title}</h4>
            <div style="font-size: 14px; color: #666;">
                <div><strong>모델명:</strong> {model_name}</div>
                <div><strong>상태:</strong> {status}</div>
                <div><strong>{'타입' if 'type' in model_data else '차원'}:</strong> {model_type}</div>
            </div>
        </div>
        """
    
    @staticmethod
    def create_model_info_grid(llm_model: Dict[str, Any], embedding_model: Dict[str, Any]) -> str:
        """모델 정보 그리드 생성"""
        llm_card = GradioCommonComponents.create_model_info_card(
            llm_model, "LLM 모델", "💬", "#e3f2fd", "#2196f3", "#1565c0"
        )
        embedding_card = GradioCommonComponents.create_model_info_card(
            embedding_model, "임베딩 모델", "🧠", "#e8f5e8", "#4caf50", "#2e7d32"
        )
        
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 16px;">🤖 AI 모델 정보</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
                {llm_card}
                {embedding_card}
            </div>
        </div>
        """
    
    @staticmethod
    def create_vector_info_grid(total_vectors: int, vector_dimension: int, model_name: str) -> str:
        """벡터스토어 정보 그리드 생성"""
        metrics = [
            {
                "value": total_vectors,
                "label": "총 벡터 수",
                "bg_color": "#e8f5e8",
                "border_color": "#4caf50",
                "text_color": "#2e7d32"
            },
            {
                "value": vector_dimension,
                "label": "벡터 차원",
                "bg_color": "#e3f2fd",
                "border_color": "#2196f3",
                "text_color": "#1565c0"
            },
            {
                "value": model_name,
                "label": "모델명",
                "bg_color": "#fff3e0",
                "border_color": "#ff9800",
                "text_color": "#e65100"
            }
        ]
        
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 16px;">🔍 벡터스토어 정보</h3>
            {GradioCommonComponents.create_metrics_grid(metrics)}
        </div>
        """
    
    @staticmethod
    def create_chunking_statistics_grid(total_chunks: int, total_documents: int, average_chunk_size: int) -> str:
        """청킹 통계 그리드 생성"""
        metrics = [
            {
                "value": total_chunks,
                "label": "총 청크 수",
                "bg_color": "#e8f5e8",
                "border_color": "#4caf50",
                "text_color": "#2e7d32"
            },
            {
                "value": total_documents,
                "label": "총 문서 수",
                "bg_color": "#e3f2fd",
                "border_color": "#2196f3",
                "text_color": "#1565c0"
            },
            {
                "value": average_chunk_size,
                "label": "평균 청크 크기",
                "bg_color": "#fff3e0",
                "border_color": "#ff9800",
                "text_color": "#e65100"
            }
        ]
        
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 16px;">📊 청킹 통계</h3>
            {GradioCommonComponents.create_metrics_grid(metrics)}
        </div>
        """
    
    @staticmethod
    def create_document_choices(result: Dict[str, Any]) -> List[str]:
        """문서 선택 옵션 생성"""
        if not result.get("success", False):
            return []
        
        documents = result.get("data", [])  # data는 이미 리스트
        choices = []
        
        for doc in documents:
            title = doc.get("title", "제목 없음")
            doc_id = doc.get("document_id", "")
            choices.append(f"{title} ({doc_id[:8]}...)")
        
        return choices