"""RAG 데모 인터페이스 테스트 스크립트"""

import gradio as gr

# 간단한 RAG 데모 인터페이스 테스트
def test_demo_interface():
    with gr.Blocks(title="RAG Demo Test") as demo:
        gr.Markdown("# 🤖 RAG Pipeline Demonstration Test")
        gr.Markdown("RAG 데모 인터페이스 테스트입니다.")
        
        with gr.Tabs():
            with gr.Tab("📄 Document Loading Test"):
                with gr.Row():
                    file_dropdown = gr.Dropdown(
                        choices=["test1.md", "test2.md", "test3.md"],
                        label="테스트 파일 선택",
                        value="test1.md"
                    )
                    load_btn = gr.Button("테스트 로딩", variant="primary")
                
                output_text = gr.Textbox(
                    label="출력 결과",
                    lines=10,
                    placeholder="테스트 결과가 여기에 표시됩니다."
                )
                
                def test_loading(selected_file):
                    return f"테스트: {selected_file} 로딩 성공!\n\nGradio 인터페이스가 정상적으로 작동합니다."
                
                load_btn.click(
                    fn=test_loading,
                    inputs=[file_dropdown],
                    outputs=[output_text]
                )
            
            with gr.Tab("✂️ Text Splitting Test"):
                gr.Markdown("## 텍스트 분할 테스트")
                test_text = gr.Textbox(
                    label="테스트 텍스트 입력",
                    lines=5,
                    placeholder="분할할 텍스트를 입력하세요..."
                )
                split_output = gr.Textbox(
                    label="분할 결과",
                    lines=8,
                    placeholder="분할 결과가 여기에 표시됩니다."
                )
                
                def test_splitting(text):
                    if not text.strip():
                        return "텍스트를 입력해주세요."
                    
                    # 간단한 문장 단위 분할 테스트
                    sentences = text.split('.')
                    result = []
                    for i, sentence in enumerate(sentences):
                        if sentence.strip():
                            result.append(f"=== 청크 {i+1} ===\n{sentence.strip()}.")
                    
                    return "\n\n".join(result)
                
                test_text.change(
                    fn=test_splitting,
                    inputs=[test_text],
                    outputs=[split_output]
                )
        
        gr.Markdown("""
        ---
        **✅ 테스트 성공**: Gradio 인터페이스가 정상적으로 작동합니다!
        
        실제 RAG 파이프라인 연동을 위해서는 다음이 필요합니다:
        - LangChain 문서 처리 모듈
        - ContextBuilder 서비스
        - 포트폴리오 데이터 연동
        """)
    
    return demo

if __name__ == "__main__":
    print("RAG Demo Interface Test Starting...")
    demo = test_demo_interface()
    demo.launch(
        server_name="0.0.0.0",
        server_port=8000,
        share=False,
        debug=True
    )