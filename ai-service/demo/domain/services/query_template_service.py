"""
Query Template Service - Demo Domain Layer
쿼리 템플릿 로딩 도메인 서비스

지능형 쿼리 분류를 위한 템플릿들을 로드하고 관리하는 도메인 서비스입니다.
"""

import logging
import json
from typing import List, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class QueryTemplateService:
    """쿼리 템플릿 도메인 서비스"""
    
    def __init__(self):
        self._templates = None
        logger.info("✅ Query Template Service initialized")
    
    def load_query_templates(self) -> Dict[str, Any]:
        """쿼리 템플릿 파일 로드"""
        try:
            if self._templates is not None:
                return self._templates
            
            template_path = Path("sampledata") / "query_templates.json"
            
            if not template_path.exists():
                logger.warning("Query templates file not found, using default templates")
                return self._get_default_templates()
            
            with open(template_path, 'r', encoding='utf-8') as f:
                self._templates = json.load(f)
            
            logger.info("✅ Query templates loaded successfully")
            return self._templates
            
        except Exception as e:
            logger.error(f"Error loading query templates: {e}")
            return self._get_default_templates()
    
    def generate_queries_for_document(self, doc_type: str, doc_title: str) -> List[Dict[str, Any]]:
        """문서 타입에 따른 쿼리 생성"""
        try:
            templates = self.load_query_templates()
            template_groups = templates.get("templates", {})
            
            queries = []
            
            # 문서 타입에 따른 템플릿 그룹 선택
            template_key = self._get_template_key(doc_type, doc_title)
            
            if template_key in template_groups:
                for template_info in template_groups[template_key]:
                    query_text = template_info["template"].format(doc_title=doc_title)
                    
                    query = {
                        "query": query_text,
                        "expected_type": template_info["expected_type"],
                        "confidence": template_info["confidence"],
                        "reasoning": template_info["reasoning"],
                        "source_document": doc_title,
                        "template_source": template_key
                    }
                    queries.append(query)
            
            # 일반 템플릿도 추가 (모든 문서에 적용 가능)
            if template_key != "GENERAL":
                for template_info in template_groups.get("GENERAL", []):
                    query_text = template_info["template"].format(doc_title=doc_title)
                    
                    query = {
                        "query": query_text,
                        "expected_type": template_info["expected_type"],
                        "confidence": template_info["confidence"],
                        "reasoning": template_info["reasoning"],
                        "source_document": doc_title,
                        "template_source": "GENERAL"
                    }
                    queries.append(query)
            
            return queries
            
        except Exception as e:
            logger.error(f"Error generating queries for document: {e}")
            return []
    
    def _get_template_key(self, doc_type: str, doc_title: str) -> str:
        """문서 타입과 제목에 따른 템플릿 키 결정"""
        if doc_type == "PROJECT":
            return "PROJECT"
        elif doc_type == "QA":
            if "아키텍처" in doc_title:
                return "QA_ARCHITECTURE"
            elif "AI" in doc_title or "RAG" in doc_title:
                return "QA_AI_SERVICES"
            else:
                return "GENERAL"
        elif doc_type == "TEXT":
            return "TEXT"
        else:
            return "GENERAL"
    
    def _get_default_templates(self) -> Dict[str, Any]:
        """기본 템플릿 (파일이 없을 경우)"""
        return {
            "description": "기본 쿼리 템플릿",
            "templates": {
                "GENERAL": [
                    {
                        "template": "{doc_title}의 주요 내용은 무엇인가요?",
                        "expected_type": "GENERAL",
                        "confidence": 0.80,
                        "reasoning": "일반적인 내용 질문 (Mock LLM 분류)"
                    }
                ]
            }
        }
    
    def get_available_query_types(self) -> List[str]:
        """사용 가능한 쿼리 타입 목록 반환"""
        templates = self.load_query_templates()
        return list(templates.get("query_types", {}).keys())