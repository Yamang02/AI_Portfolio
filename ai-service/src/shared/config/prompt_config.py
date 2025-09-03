"""
프롬프트 설정 관리 모듈
하드코딩된 프롬프트들을 외부 설정 파일로 분리하여 관리
"""

import os
import yaml
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path
import json

logger = logging.getLogger(__name__)


class PromptManager:
    """프롬프트 설정을 중앙에서 관리하는 매니저 클래스"""

    def __init__(self, config_dir: str = "src/shared/config/prompts"):
        self.config_dir = Path(config_dir)
        self.system_prompts: Dict[str, str] = {}
        self.rag_prompts: Dict[str, Dict[str, Any]] = {}
        self.task_templates: Dict[str, Dict[str, Any]] = {}
        self._loaded = False

    def load_prompts(self) -> bool:
        """모든 프롬프트 설정 파일을 로드"""
        try:
            if not self.config_dir.exists():
                logger.error(f"프롬프트 설정 디렉토리가 존재하지 않습니다: {self.config_dir}")
                return False

            # 시스템 프롬프트 로드
            self._load_system_prompts()

            # RAG 프롬프트 로드
            self._load_rag_prompts()

            # 작업별 템플릿 로드
            self._load_task_templates()

            self._loaded = True
            logger.info("프롬프트 설정 로드 완료")
            return True

        except Exception as e:
            logger.error(f"프롬프트 설정 로드 실패: {e}")
            return False

    def _load_system_prompts(self):
        """시스템 프롬프트 설정 로드"""
        system_file = self.config_dir / "system_prompts.yaml"
        if not system_file.exists():
            logger.warning(f"시스템 프롬프트 파일이 존재하지 않습니다: {system_file}")
            return

        try:
            with open(system_file, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)

            # 시스템 프롬프트를 문자열로 변환
            for key, value in config.items():
                if isinstance(value, dict):
                    # 역할과 가이드라인을 조합하여 완전한 프롬프트 생성
                    prompt_parts = []

                    if 'role' in value:
                        prompt_parts.append(f"당신은 {value['role']}입니다.")

                    if 'description' in value:
                        prompt_parts.append(f"{value['description']}")

                    if 'characteristics' in value and value['characteristics']:
                        prompt_parts.append("\n역할과 특징:")
                        for char in value['characteristics']:
                            prompt_parts.append(f"- {char}")

                    if 'guidelines' in value and value['guidelines']:
                        prompt_parts.append("\n답변 가이드라인:")
                        for i, guideline in enumerate(value['guidelines'], 1):
                            prompt_parts.append(f"{i}. {guideline}")

                    self.system_prompts[key] = "\n".join(prompt_parts)

        except Exception as e:
            logger.error(f"시스템 프롬프트 로드 실패: {e}")

    def _load_rag_prompts(self):
        """RAG 프롬프트 설정 로드"""
        rag_file = self.config_dir / "rag_prompts.yaml"
        if not rag_file.exists():
            logger.warning(f"RAG 프롬프트 파일이 존재하지 않습니다: {rag_file}")
            return

        try:
            with open(rag_file, 'r', encoding='utf-8') as f:
                self.rag_prompts = yaml.safe_load(f)

        except Exception as e:
            logger.error(f"RAG 프롬프트 로드 실패: {e}")

    def _load_task_templates(self):
        """작업별 템플릿 로드"""
        templates_dir = self.config_dir / "templates"
        if not templates_dir.exists():
            logger.warning(f"템플릿 디렉토리가 존재하지 않습니다: {templates_dir}")
            return

        try:
            for template_file in templates_dir.glob("*.yaml"):
                template_name = template_file.stem
                with open(template_file, 'r', encoding='utf-8') as f:
                    self.task_templates[template_name] = yaml.safe_load(f)

        except Exception as e:
            logger.error(f"작업별 템플릿 로드 실패: {e}")

    def get_system_prompt(self, prompt_key: str) -> Optional[str]:
        """시스템 프롬프트 반환"""
        if not self._loaded:
            self.load_prompts()

        return self.system_prompts.get(prompt_key)

    def get_rag_prompt(self, prompt_key: str) -> Optional[Dict[str, Any]]:
        """RAG 프롬프트 반환"""
        if not self._loaded:
            self.load_prompts()

        return self.rag_prompts.get(prompt_key)

    def get_task_template(self, template_name: str,
                          template_key: str) -> Optional[Dict[str, Any]]:
        """작업별 템플릿 반환"""
        if not self._loaded:
            self.load_prompts()

        template = self.task_templates.get(template_name, {})
        return template.get(template_key)

    def build_prompt(self, template_name: str, template_key: str,
                     **kwargs) -> Optional[Dict[str, str]]:
        """템플릿을 사용하여 완전한 프롬프트 구성"""
        template = self.get_task_template(template_name, template_key)
        if not template:
            return None

        # 시스템 프롬프트 키 확인
        system_key = template.get('system')
        if not system_key:
            return None

        system_prompt = self.get_system_prompt(system_key)
        if not system_prompt:
            return None

        # 휴먼 프롬프트 템플릿 가져오기
        human_template = template.get('human_template', '')
        if not human_template:
            return None

        # 변수 치환
        try:
            human_prompt = human_template.format(**kwargs)
        except KeyError as e:
            logger.error(f"템플릿 변수 치환 실패: {e}")
            return None

        return {
            "system": system_prompt,
            "human": human_prompt
        }

    def validate_prompts(self) -> Dict[str, List[str]]:
        """프롬프트 설정 유효성 검증"""
        errors = {
            "system_prompts": [],
            "rag_prompts": [],
            "task_templates": []
        }

        # 시스템 프롬프트 검증
        for key, prompt in self.system_prompts.items():
            if not prompt or len(prompt.strip()) < 10:
                errors["system_prompts"].append(f"프롬프트가 너무 짧거나 비어있음: {key}")

        # RAG 프롬프트 검증
        for key, prompt_config in self.rag_prompts.items():
            if 'system' not in prompt_config:
                errors["rag_prompts"].append(f"시스템 프롬프트 키 누락: {key}")
            if 'human_template' not in prompt_config:
                errors["rag_prompts"].append(f"휴먼 템플릿 누락: {key}")

        # 작업별 템플릿 검증
        for template_name, templates in self.task_templates.items():
            for template_key, template in templates.items():
                if 'system' not in template:
                    errors["task_templates"].append(
                        f"시스템 프롬프트 키 누락: {template_name}.{template_key}")
                if 'human_template' not in template:
                    errors["task_templates"].append(
                        f"휴먼 템플릿 누락: {template_name}.{template_key}")

        return errors

    def reload_prompts(self) -> bool:
        """프롬프트 설정 재로드"""
        self._loaded = False
        return self.load_prompts()

    def get_prompt_info(self) -> Dict[str, Any]:
        """프롬프트 설정 정보 반환"""
        return {
            "loaded": self._loaded,
            "system_prompts_count": len(self.system_prompts),
            "rag_prompts_count": len(self.rag_prompts),
            "task_templates_count": len(self.task_templates),
            "system_prompts": list(self.system_prompts.keys()),
            "rag_prompts": list(self.rag_prompts.keys()),
            "task_templates": list(self.task_templates.keys())
        }


# 전역 프롬프트 매니저 인스턴스
prompt_manager = PromptManager()


def get_prompt_manager() -> PromptManager:
    """전역 프롬프트 매니저 반환"""
    return prompt_manager
