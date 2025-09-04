"""
UI Components
그라디오 공통 UI 컴포넌트들
"""

from typing import List, Dict, Any


class UIComponents:
    """그라디오 공통 UI 컴포넌트들"""
    
    @staticmethod
    def create_step_title(title: str, step_number: int = None) -> str:
        """단계별 타이틀 생성 (재사용 가능한 스타일)"""
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
        """섹션별 타이틀 생성 (재사용 가능한 스타일)"""
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
    def create_card_container(title: str, count: int = None, container_id: str = None) -> str:
        """카드 컨테이너 생성 (가로 스크롤, 고정 너비)"""
        count_text = f" (총 {count}개)" if count is not None else ""
        container_attr = f' id="{container_id}"' if container_id else ""
        
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; width: 100%; max-width: 1400px;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">{title}{count_text}</h3>
            <div style="display: flex; overflow-x: auto; gap: 20px; padding-bottom: 10px; width: 100%; max-width: 1400px;"{container_attr}>
        """
    
    @staticmethod
    def create_scrollable_card_container(title: str, count: int = None, container_id: str = None, max_height: str = "400px") -> str:
        """스크롤 가능한 카드 컨테이너 생성 (고정 높이, 스크롤바)"""
        count_text = f" (총 {count}개)" if count is not None else ""
        container_attr = f' id="{container_id}"' if container_id else ""
        
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; width: 100%; max-width: 1400px;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">{title}{count_text}</h3>
            <div style="display: flex; overflow-x: auto; gap: 20px; padding-bottom: 10px; width: 100%; max-width: 1400px; max-height: {max_height}; overflow-y: auto;"{container_attr}>
        """
    
    @staticmethod
    def create_simple_document_card(
        title: str,
        source: str,
        content_length: int,
        doc_type: str,
        bg_color: str = '#e8f5e8',
        border_color: str = '#4caf50',
        icon: str = '📖'
    ) -> str:
        """간단한 문서 카드 생성 (Document 탭 스타일 적용)"""
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
    def get_document_card_style(doc_type: str) -> dict:
        """문서 타입별 카드 스타일 반환"""
        styles = {
            'sample_data': {
                'bg_color': '#e8f5e8',
                'border_color': '#4caf50',
                'icon': '📖'
            },
            'manual': {
                'bg_color': '#fff3e0',
                'border_color': '#ff9800',
                'icon': '✍️'
            },
            'api': {
                'bg_color': '#e3f2fd',
                'border_color': '#2196f3',
                'icon': '🔗'
            }
        }
        return styles.get(doc_type, styles['manual'])

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
            <strong>❌ 오류:</strong> {message}
        </div>
        """

    @staticmethod
    def create_success_message(title: str, details: List[str], bg_color: str = '#d4edda', border_color: str = '#c3e6cb') -> str:
        """성공 메시지 생성"""
        details_html = ""
        for detail in details:
            details_html += f"<div style='margin-bottom: 4px;'>{detail}</div>"
        
        return f"""
        <div style="
            background: {bg_color};
            color: #155724;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid {border_color};
            margin-bottom: 16px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <strong>✅ {title}</strong><br>
            {details_html}
        </div>
        """
    
    @staticmethod
    def create_chunk_card(
        chunk_id: int,
        document_title: str,
        content_length: int,
        content_preview: str,
        chunk_type: str,
        bg_color: str = '#e8f5e8',
        border_color: str = '#4caf50',
        icon: str = '📖',
        min_width: int = 380,
        clickable: bool = True,
        chunk_index: int = 0
    ) -> str:
        """청크 카드 생성 (Document 탭 스타일 적용)"""
        click_attr = f' onclick="showChunkContent({chunk_index})"' if clickable else ""
        
        return f"""
        <div style="
            background: linear-gradient(135deg, {bg_color} 0%, {bg_color.replace('e8', 'f0').replace('f3', 'f8')} 100%);
            border: 2px solid {border_color};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-width: {min_width}px;
            flex: 1;
            transition: all 0.3s ease;
            cursor: {'pointer' if clickable else 'default'};
        "{click_attr}
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
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
    def create_info_message(message: str, bg_color: str = '#d1ecf1', border_color: str = '#17a2b8') -> str:
        """정보 메시지 생성"""
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="background: {bg_color}; border: 2px solid {border_color}; border-radius: 12px; padding: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #0c5460;">ℹ️ {message}</h4>
            </div>
        </div>
        """
    
    @staticmethod
    def create_settings_box(title: str, settings: List[str], bg_color: str = '#f8f9fa', border_color: str = '#007bff') -> str:
        """설정 표시 박스 생성"""
        settings_html = ""
        for setting in settings:
            settings_html += f"• {setting}<br>"
        
        return f"""
        <div style="padding: 10px; background: {bg_color}; border-radius: 5px; border-left: 4px solid {border_color};">
            <strong>{title}:</strong><br>
            {settings_html}
        </div>
        """
    
    @staticmethod
    def create_empty_state(message: str, icon: str = "📭") -> str:
        """빈 상태 메시지 생성"""
        return f"""
        <div style="text-align: center; color: #6c757d; padding: 40px; font-weight: 600;">
            {icon} {message}
        </div>
        """
    
    @staticmethod
    def create_loading_spinner(message: str = "로딩 중...") -> str:
        """로딩 스피너 생성"""
        return f"""
        <div style="text-align: center; padding: 40px;">
            <div style="
                display: inline-block;
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            "></div>
            <div style="color: #666; font-weight: 600;">{message}</div>
            <style>
            @keyframes spin {{
                0% {{ transform: rotate(0deg); }}
                100% {{ transform: rotate(360deg); }}
            }}
            </style>
        </div>
        """
    
    @staticmethod
    def close_card_container() -> str:
        """카드 컨테이너 닫기"""
        return """
            </div>
        </div>
        """
    
    @staticmethod
    def get_document_card_style(doc_type: str) -> Dict[str, str]:
        """문서 타입에 따른 카드 스타일 반환"""
        if doc_type == 'sample_data':
            return {
                'bg_color': '#e8f5e8',
                'border_color': '#4caf50',
                'icon': '📖'
            }
        elif doc_type == 'manual_input':
            return {
                'bg_color': '#fff3e0',
                'border_color': '#ff9800',
                'icon': '✍️'
            }
        else:
            return {
                'bg_color': '#f8f9fa',
                'border_color': '#6c757d',
                'icon': '📄'
            }
    
    @staticmethod
    def create_content_preview(content: str, max_length: int = 200) -> str:
        """내용 미리보기 생성 (줄바꿈 처리 포함)"""
        if len(content) > max_length:
            # 긴 내용을 줄바꿈과 함께 자르기
            truncated = content[:max_length]
            # 마지막 완전한 단어에서 자르기
            last_space = truncated.rfind(' ')
            if last_space > max_length * 0.8:  # 80% 이상에서 공백이 있으면 거기서 자르기
                truncated = truncated[:last_space]
            return truncated + "..."
        return content
