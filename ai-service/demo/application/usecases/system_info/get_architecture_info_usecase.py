"""
Get Architecture Info Use Case - Demo Application Layer
아키텍처 정보 조회 유스케이스

헥사고널 아키텍처 구조와 데이터 흐름 정보를 제공합니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

from typing import Dict, Any, List
from dataclasses import dataclass
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)


@dataclass
class ArchitectureComponent:
    """아키텍처 컴포넌트 정보"""
    name: str
    layer: str  # UI, Application, Domain, Infrastructure
    type: str   # UseCase, Entity, Service, Adapter
    description: str
    dependencies: List[str]


@dataclass
class DataFlow:
    """데이터 흐름 정보"""
    name: str
    steps: List[str]
    components: List[str]
    description: str


class GetArchitectureInfoUseCase:
    """아키텍처 정보 조회 유스케이스"""
    
    def __init__(self):
        self._architecture_components = self._initialize_components()
        self._data_flows = self._initialize_data_flows()
    
    @handle_usecase_errors(
        default_error_message="아키텍처 정보 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetArchitectureInfoUseCase")
    def execute(self) -> Dict[str, Any]:
        """아키텍처 정보 조회 실행"""
        return ResponseFormatter.success(
            data={
                "hexagonal_architecture": self._get_hexagonal_structure(),
                "components": self._get_components_by_layer(),
                "data_flows": self._get_data_flows(),
                "technology_stack": self._get_technology_stack(),
                "layer_dependencies": self._get_layer_dependencies()
            },
            message="🏗️ 아키텍처 정보를 성공적으로 조회했습니다"
        )
    
    def _get_hexagonal_structure(self) -> Dict[str, Any]:
        """헥사고널 아키텍처 구조 정보"""
        return {
            "core": {
                "name": "Domain Core",
                "description": "비즈니스 로직과 엔티티",
                "components": ["Entity", "Domain Service", "Value Object"]
            },
            "application": {
                "name": "Application Layer", 
                "description": "유스케이스와 애플리케이션 서비스",
                "components": ["Use Case", "Application Service", "DTO"]
            },
            "adapters": {
                "inbound": {
                    "name": "Inbound Adapters",
                    "description": "외부에서 도메인으로의 진입점",
                    "components": ["Gradio UI", "REST API", "CLI"]
                },
                "outbound": {
                    "name": "Outbound Adapters", 
                    "description": "도메인에서 외부로의 연결점",
                    "components": ["File Repository", "Vector Store", "LLM API"]
                }
            }
        }
    
    def _get_components_by_layer(self) -> Dict[str, List[Dict[str, Any]]]:
        """레이어별 컴포넌트 정보"""
        components_by_layer = {}
        
        for component in self._architecture_components:
            if component.layer not in components_by_layer:
                components_by_layer[component.layer] = []
            
            components_by_layer[component.layer].append({
                "name": component.name,
                "type": component.type,
                "description": component.description,
                "dependencies": component.dependencies
            })
        
        return components_by_layer
    
    def _get_data_flows(self) -> List[Dict[str, Any]]:
        """데이터 흐름 정보"""
        return [
            {
                "name": flow.name,
                "steps": flow.steps,
                "components": flow.components,
                "description": flow.description
            }
            for flow in self._data_flows
        ]
    
    def _get_technology_stack(self) -> Dict[str, List[str]]:
        """기술 스택 정보"""
        return {
            "ui_framework": ["Gradio", "Python"],
            "application": ["Python 3.11+", "Pydantic", "Dataclasses"],
            "domain": ["Clean Architecture", "DDD", "Hexagonal Architecture"],
            "ai_models": ["sentence-transformers", "OpenAI API", "Anthropic Claude"],
            "storage": ["JSON Files", "Vector Store (Memory)", "File System"],
            "testing": ["pytest", "unittest", "Mock"]
        }
    
    def _get_layer_dependencies(self) -> Dict[str, List[str]]:
        """레이어 의존성 정보"""
        return {
            "UI": ["Application"],
            "Application": ["Domain"],
            "Domain": [],  # 다른 레이어에 의존하지 않음
            "Infrastructure": ["Domain", "Application"]  # 구현체는 인터페이스에 의존
        }
    
    def _initialize_components(self) -> List[ArchitectureComponent]:
        """아키텍처 컴포넌트 초기화"""
        return [
            # UI Layer
            ArchitectureComponent(
                name="Gradio UI",
                layer="UI",
                type="Adapter",
                description="사용자 인터페이스 (문서 업로드, 청킹, 임베딩, RAG)",
                dependencies=["Use Cases"]
            ),
            
            # Application Layer
            ArchitectureComponent(
                name="Document Use Cases",
                layer="Application",
                type="UseCase", 
                description="문서 관련 유스케이스들",
                dependencies=["Document Service", "Document Entity"]
            ),
            ArchitectureComponent(
                name="Chunking Use Cases",
                layer="Application",
                type="UseCase",
                description="청킹 관련 유스케이스들", 
                dependencies=["Chunking Service", "Chunk Entity"]
            ),
            ArchitectureComponent(
                name="Embedding Use Cases",
                layer="Application", 
                type="UseCase",
                description="임베딩 관련 유스케이스들",
                dependencies=["Embedding Service", "Embedding Entity"]
            ),
            
            # Domain Layer - Entities
            ArchitectureComponent(
                name="Document Entity",
                layer="Domain",
                type="Entity",
                description="문서 도메인 엔티티",
                dependencies=[]
            ),
            ArchitectureComponent(
                name="Chunk Entity", 
                layer="Domain",
                type="Entity",
                description="청크 도메인 엔티티",
                dependencies=["Document Entity"]
            ),
            ArchitectureComponent(
                name="Embedding Entity",
                layer="Domain", 
                type="Entity",
                description="임베딩 도메인 엔티티",
                dependencies=["Chunk Entity"]
            ),
            ArchitectureComponent(
                name="VectorStore Entity",
                layer="Domain",
                type="Entity", 
                description="벡터스토어 도메인 엔티티",
                dependencies=["Embedding Entity"]
            ),
            
            # Domain Layer - Services  
            ArchitectureComponent(
                name="Document Management Service",
                layer="Domain",
                type="Service",
                description="문서 관리 도메인 서비스",
                dependencies=["Document Entity"]
            ),
            ArchitectureComponent(
                name="Chunking Service",
                layer="Domain",
                type="Service", 
                description="청킹 도메인 서비스",
                dependencies=["Chunk Entity", "Chunking Strategy"]
            ),
            ArchitectureComponent(
                name="Embedding Service",
                layer="Domain",
                type="Service",
                description="임베딩 도메인 서비스", 
                dependencies=["Embedding Entity", "VectorStore Entity"]
            ),
            
            # Infrastructure Layer
            ArchitectureComponent(
                name="File Repository",
                layer="Infrastructure",
                type="Adapter",
                description="파일 시스템 저장소",
                dependencies=[]
            ),
            ArchitectureComponent(
                name="Vector Store Adapter",
                layer="Infrastructure", 
                type="Adapter",
                description="벡터 저장소 어댑터",
                dependencies=[]
            ),
            ArchitectureComponent(
                name="LLM API Adapter",
                layer="Infrastructure",
                type="Adapter",
                description="외부 LLM API 연결",
                dependencies=[]
            )
        ]
    
    def _initialize_data_flows(self) -> List[DataFlow]:
        """데이터 흐름 초기화"""
        return [
            DataFlow(
                name="문서 처리 흐름",
                steps=[
                    "1. 사용자가 문서 업로드 (Gradio UI)",
                    "2. Add Document Use Case 실행",
                    "3. Document Management Service에서 문서 검증",
                    "4. Document Entity 생성",
                    "5. File Repository에 저장"
                ],
                components=["Gradio UI", "Add Document Use Case", "Document Service", "File Repository"],
                description="문서 업로드부터 저장까지의 전체 흐름"
            ),
            DataFlow(
                name="청킹 처리 흐름", 
                steps=[
                    "1. 청킹 전략 선택 (UI)",
                    "2. Chunk Document Use Case 실행",
                    "3. Chunking Service에서 전략별 청킹",
                    "4. Chunk Entity 생성",
                    "5. 처리 상태 추적 업데이트"
                ],
                components=["Gradio UI", "Chunk Document Use Case", "Chunking Service", "Processing Status"],
                description="문서를 청크로 분할하는 처리 흐름"
            ),
            DataFlow(
                name="임베딩 생성 흐름",
                steps=[
                    "1. 청크 목록 조회",
                    "2. Create Embedding Use Case 실행", 
                    "3. Embedding Service에서 벡터 변환",
                    "4. Embedding Entity 생성",
                    "5. VectorStore에 저장"
                ],
                components=["Embedding Use Case", "Embedding Service", "VectorStore", "Vector Store Adapter"],
                description="청크를 임베딩 벡터로 변환하는 흐름"
            ),
            DataFlow(
                name="RAG 질의응답 흐름",
                steps=[
                    "1. 사용자 질문 입력 (UI)",
                    "2. Retrieval Service에서 유사 청크 검색",
                    "3. Generation Service에서 컨텍스트 기반 답변 생성", 
                    "4. LLM API를 통한 응답 생성",
                    "5. 결과 반환 및 표시"
                ],
                components=["Gradio UI", "Retrieval Service", "Generation Service", "LLM API Adapter"],
                description="질문에 대한 RAG 기반 답변 생성 흐름"
            ),
            DataFlow(
                name="시스템 모니터링 흐름",
                steps=[
                    "1. 시스템 정보 탭 접근",
                    "2. Get Architecture Info Use Case 실행",
                    "3. 각 서비스에서 상태 정보 수집",
                    "4. 통계 및 메트릭 집계",
                    "5. 시각화 및 표시"
                ],
                components=["System Info UI", "Architecture Use Case", "Various Services", "Statistics"],
                description="시스템 상태 모니터링 및 시각화 흐름"
            )
        ]
