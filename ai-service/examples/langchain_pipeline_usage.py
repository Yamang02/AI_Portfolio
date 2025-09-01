"""
LangChain 파이프라인 사용 예시
LangChain 파이프 연산자의 진정한 장점을 보여주는 예시
"""

import asyncio
from src.adapters.inbound.web.langchain_dependencies import (
    get_langchain_integrated_rag_pipeline,
    get_langchain_document_processing_pipeline
)


async def demonstrate_rag_pipeline():
    """RAG 파이프라인 데모"""
    print("=== LangChain 통합 RAG 파이프라인 데모 ===")
    
    # 파이프라인 가져오기
    rag_pipeline = get_langchain_integrated_rag_pipeline()
    
    # 사용자 질문들
    questions = [
        "어떤 프로젝트를 개발했나요?",
        "Python과 JavaScript 중 어느 것을 더 잘 사용하나요?",
        "업무 경험에 대해 알려주세요",
        "포트폴리오에 대해 간단히 소개해주세요"
    ]
    
    for question in questions:
        print(f"\n질문: {question}")
        
        # 파이프라인 실행 (LangChain 파이프 연산자로 모든 단계가 연결됨)
        result = await rag_pipeline.process_message(question)
        
        print(f"답변: {result['response']}")
        print(f"신뢰도: {result['confidence']}")
        print(f"소스 수: {result['sources_count']}")
        print(f"쿼리 분석: {result['metadata']['query_analysis']}")


async def demonstrate_document_processing_pipeline():
    """문서 처리 파이프라인 데모"""
    print("\n=== LangChain 문서 처리 파이프라인 데모 ===")
    
    # 파이프라인 가져오기
    doc_pipeline = get_langchain_document_processing_pipeline()
    
    # 문서 처리
    result = await doc_pipeline.process_document(
        file_path="path/to/document.pdf",
        source="portfolio_docs",
        metadata={"category": "project", "language": "korean"}
    )
    
    print(f"처리 결과: {result['success']}")
    print(f"문서 수: {result['documents_loaded']}")
    print(f"청크 수: {result['chunks_created']}")
    print(f"임베딩 수: {result['embeddings_generated']}")


async def demonstrate_streaming():
    """스트리밍 데모"""
    print("\n=== 스트리밍 RAG 파이프라인 데모 ===")
    
    rag_pipeline = get_langchain_integrated_rag_pipeline()
    
    print("질문: AI 포트폴리오에 대해 자세히 설명해주세요")
    print("답변 (스트리밍): ", end="", flush=True)
    
    # 스트리밍 응답
    async for chunk in rag_pipeline.process_message_streaming(
        "AI 포트폴리오에 대해 자세히 설명해주세요"
    ):
        print(chunk, end="", flush=True)
    
    print("\n")


def compare_approaches():
    """기존 방식 vs LangChain 파이프라인 방식 비교"""
    print("\n=== 접근 방식 비교 ===")
    
    print("""
    🔴 기존 방식 (개별 어댑터):
    - 각 기능이 독립적으로 구현
    - 수동으로 단계별 호출 필요
    - 에러 처리와 로깅이 분산됨
    - 병렬 처리 구현이 복잡함
    
    🟢 LangChain 파이프라인 방식:
    - 파이프 연산자(|)로 모든 단계 연결
    - 자동 에러 처리 및 재시도
    - 병렬 처리 (RunnableParallel) 내장
    - 스트리밍 지원 내장
    - 체인 구성이 선언적이고 읽기 쉬움
    """)


if __name__ == "__main__":
    # 데모 실행
    asyncio.run(demonstrate_rag_pipeline())
    asyncio.run(demonstrate_document_processing_pipeline())
    asyncio.run(demonstrate_streaming())
    compare_approaches()
