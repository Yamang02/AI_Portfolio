"""
UI Layout Components
UI 레이아웃 컴포넌트

전체 UI 구조를 담당하는 컴포넌트들입니다.
헤더, 탭 컨테이너, 푸터 등의 레이아웃 요소들을 제공합니다.
"""

import gradio as gr
import logging
from typing import List, Any

logger = logging.getLogger(__name__)


class UILayoutComponents:
    """UI 레이아웃 컴포넌트 - 전체 UI 구조 담당"""
    
    @staticmethod
    def create_header() -> gr.Markdown:
        """헤더 생성"""
        return gr.Markdown("""
        # 🤖 AI Portfolio RAG Demo
        ## Hexagonal Architecture Implementation
        
        이 데모는 헥사고널 아키텍처를 적용한 RAG(Retrieval-Augmented Generation) 시스템입니다.
        각 기능은 단일 책임 원칙에 따라 독립적인 어댑터로 구현되었습니다.
        """)
    
    @staticmethod
    def create_footer() -> gr.Markdown:
        """푸터 생성"""
        return gr.Markdown("""
        ---
        ### 🏗️ Architecture Info
        
        **Core Services**: 비즈니스 로직과 도메인 규칙
        **Application Services**: 유스케이스 조정 및 외부 어댑터와의 상호작용
        **Adapters**: 외부 기술과의 연결 (UI, DB, LLM)
        
        각 기능은 독립적인 어댑터로 구현되어 단일 책임 원칙을 준수합니다.
        """)
    
    @staticmethod
    def create_tabs_container(tab_components: List[Any]) -> gr.Tabs:
        """탭 컨테이너 생성"""
        with gr.Tabs() as tabs:
            for tab_component in tab_components:
                tab_component.create_tab()
        return tabs
    
    @staticmethod
    def create_main_interface(tab_components: List[Any]) -> gr.Blocks:
        """전체 인터페이스 생성"""
        with gr.Blocks(
            title="AI Portfolio RAG Demo - Hexagonal Architecture",
            theme=gr.themes.Soft(),
            css="""
            .gradio-container {
                max-width: 1200px !important;
                margin: 0 auto !important;
            }
            """
        ) as interface:
            
            # 헤더
            UILayoutComponents.create_header()
            
            # 탭 구성
            UILayoutComponents.create_tabs_container(tab_components)
            
            # 푸터
            UILayoutComponents.create_footer()
        
        return interface
