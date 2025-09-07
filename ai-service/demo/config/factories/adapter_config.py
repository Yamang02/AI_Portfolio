"""
Demo Adapter Configuration
데모 어댑터 설정

Demo 환경에서 사용하는 모든 Adapter 설정을 포함합니다.
Gradio UI 기반의 데모 애플리케이션에 특화된 어댑터 구성
"""

adapter_config = {
    "inbound_adapters": {
        "gradio_adapter": {
            "module": "infrastructure.inbound.ui.gradio.gradio_adapter",
            "class": "GradioAdapter",
            "dependencies": {
                "usecase_factory": "direct"
            },
            "description": "Gradio UI Coordinator (기능별 어댑터들을 조정하고 UI 생성)"
        }
    },
    
    "categories": {
        "inbound_ui": ["gradio_adapter"]
    }
}
