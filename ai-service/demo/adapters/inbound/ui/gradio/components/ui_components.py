"""
UI Components
그라디오 공통 UI 컴포넌트들

DocumentLoad와 TextSplitter 탭의 디자인을 기준으로 정리된 공통 컴포넌트
"""

from typing import List, Dict, Any


class UIComponents:
    """그라디오 공통 UI 컴포넌트들 - DocumentLoad/TextSplitter 탭 기준"""
    
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
            style = UIComponents.get_document_type_style(doc_type)
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
    def create_vector_content_container(vectors_html: str, total_count: int) -> str:
        """벡터 내용 컨테이너 생성"""
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
                    🔍 벡터스토어 내용
                </h3>
                <span style="
                    background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(156,39,176,0.3);
                ">
                    총 {total_count}개
                </span>
            </div>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                max-height: 500px;
                overflow-y: auto;
                padding: 8px;
            ">
                {vectors_html}
            </div>
        </div>
        """