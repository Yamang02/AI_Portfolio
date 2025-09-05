"""
Get Configuration Status Use Case - Demo Application Layer
설정 상태 조회 유스케이스

시스템 설정 파일 로드 상태와 설정 정보를 제공합니다.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import os


@dataclass
class ConfigFileStatus:
    """설정 파일 상태"""
    filename: str
    path: str
    exists: bool
    loaded: bool
    size_bytes: int
    last_modified: datetime
    error_message: Optional[str] = None


@dataclass
class ConfigSection:
    """설정 섹션 정보"""
    name: str
    status: str  # loaded, missing, error
    keys_count: int
    required_keys: List[str]
    missing_keys: List[str]
    sample_values: Dict[str, str]  # 민감하지 않은 값들만


class GetConfigurationStatusUseCase:
    """설정 상태 조회 유스케이스"""
    
    def __init__(self, config_manager=None):
        self.config_manager = config_manager
        self.config_dir = Path("config")
        
    def execute(self) -> Dict[str, Any]:
        """설정 상태 조회 실행"""
        return {
            "config_files": self._get_config_files_status(),
            "config_sections": self._get_config_sections_status(),
            "environment_variables": self._get_environment_variables_status(),
            "validation_results": self._get_validation_results(),
            "recommendations": self._get_configuration_recommendations(),
            "last_updated": datetime.now().isoformat()
        }
    
    def _get_config_files_status(self) -> List[Dict[str, Any]]:
        """설정 파일들의 상태 조회 - 데모용 설정만"""
        config_files = []
        
        # 데모에서 사용하는 설정 파일들만
        demo_files = [
            "demo.yaml",  # 데모 환경 설정
            "prompts/templates",  # 프롬프트 템플릿
            "chunking"  # 청킹 설정
        ]
        
        for filename in demo_files:
            file_path = self.config_dir / filename
            
            if filename in ["prompts/templates", "chunking"]:
                # 디렉토리인 경우
                config_files.append(self._get_directory_status(filename, file_path))
            else:
                # 파일인 경우
                config_files.append(self._get_file_status(filename, file_path))
        
        
        return config_files
    
    def _get_file_status(self, filename: str, file_path: Path) -> Dict[str, Any]:
        """개별 파일 상태 조회"""
        try:
            exists = file_path.exists()
            status_info = {
                "filename": filename,
                "path": str(file_path),
                "exists": exists,
                "type": "file"
            }
            
            if exists:
                stat = file_path.stat()
                status_info.update({
                    "size_bytes": stat.st_size,
                    "last_modified": datetime.fromtimestamp(stat.st_mtime),
                    "readable": os.access(file_path, os.R_OK),
                    "loaded": self._check_if_loaded(filename)
                })
            else:
                status_info.update({
                    "size_bytes": 0,
                    "last_modified": None,
                    "readable": False,
                    "loaded": False,
                    "error_message": "파일이 존재하지 않습니다"
                })
            
            return status_info
            
        except Exception as e:
            return {
                "filename": filename,
                "path": str(file_path),
                "exists": False,
                "type": "file",
                "error_message": str(e),
                "loaded": False
            }
    
    def _get_directory_status(self, dirname: str, dir_path: Path) -> Dict[str, Any]:
        """디렉토리 상태 조회"""
        try:
            exists = dir_path.exists() and dir_path.is_dir()
            status_info = {
                "filename": dirname,
                "path": str(dir_path),
                "exists": exists,
                "type": "directory"
            }
            
            if exists:
                files = list(dir_path.glob("**/*"))
                file_count = len([f for f in files if f.is_file()])
                
                status_info.update({
                    "file_count": file_count,
                    "subdirectories": len([f for f in files if f.is_dir()]),
                    "last_modified": max(
                        (f.stat().st_mtime for f in files if f.is_file()),
                        default=dir_path.stat().st_mtime
                    ),
                    "loaded": file_count > 0
                })
                
                if hasattr(status_info["last_modified"], '__float__'):
                    status_info["last_modified"] = datetime.fromtimestamp(status_info["last_modified"])
                elif not isinstance(status_info["last_modified"], datetime):
                    status_info["last_modified"] = datetime.fromtimestamp(dir_path.stat().st_mtime)
                    
            else:
                status_info.update({
                    "file_count": 0,
                    "subdirectories": 0,
                    "last_modified": None,
                    "loaded": False,
                    "error_message": "디렉토리가 존재하지 않습니다"
                })
            
            return status_info
            
        except Exception as e:
            return {
                "filename": dirname,
                "path": str(dir_path),
                "exists": False,
                "type": "directory",
                "error_message": str(e),
                "loaded": False
            }
    
    def _check_if_loaded(self, filename: str) -> bool:
        """설정 파일이 로드되었는지 확인"""
        if not self.config_manager:
            return False
            
        try:
            if filename in ["production.yaml", "demo.yaml", "development.yaml"]:
                return self.config_manager._loaded
            elif filename == ".env":
                # 환경변수 파일은 시스템에서 확인
                return len([k for k in os.environ.keys() if k.startswith(('OPENAI_', 'DB_', 'REDIS_'))]) > 0
            return False
        except:
            return False
    
    def _get_config_sections_status(self) -> List[Dict[str, Any]]:
        """설정 섹션별 상태 조회 - 데모용 설정만"""
        sections = []
        
        if not self.config_manager:
            return [{
                "name": "ConfigManager",
                "status": "not_available",
                "keys_count": 0,
                "required_keys": [],
                "missing_keys": [],
                "sample_values": {},
                "error_message": "ConfigManager가 초기화되지 않았습니다"
            }]
        
        try:
            # 데모에서 중요한 설정들만 표시
            # 임베딩 설정 섹션
            sections.append(self._get_embedding_config_status())
            
            # RAG 설정 섹션 (청킹 포함)
            sections.append(self._get_rag_config_status())
            
            # LLM 설정 섹션 (데모용으로 간소화)
            sections.append(self._get_demo_llm_config_status())
            
        except Exception as e:
            sections.append({
                "name": "Demo Configuration",
                "status": "error",
                "error_message": str(e),
                "keys_count": 0,
                "required_keys": [],
                "missing_keys": [],
                "sample_values": {}
            })
        
        return sections
    
    def _get_llm_config_status(self) -> Dict[str, Any]:
        """LLM 설정 상태"""
        required_keys = ["openai.model_name", "openai.temperature", "openai.max_tokens"]
        sample_values = {}
        missing_keys = []
        
        try:
            openai_config = self.config_manager.get_llm_config("openai")
            if openai_config:
                sample_values = {
                    "openai.model_name": openai_config.model_name,
                    "openai.temperature": str(openai_config.temperature),
                    "openai.max_tokens": str(openai_config.max_tokens),
                    "openai.api_key": "***" if openai_config.api_key else "Not Set"
                }
            else:
                missing_keys = required_keys
                
        except Exception as e:
            missing_keys = required_keys
            
        return {
            "name": "LLM Configuration",
            "status": "loaded" if not missing_keys else "incomplete",
            "keys_count": len(sample_values),
            "required_keys": required_keys,
            "missing_keys": missing_keys,
            "sample_values": sample_values
        }
    
    def _get_database_config_status(self) -> Dict[str, Any]:
        """데이터베이스 설정 상태"""
        required_keys = ["host", "port", "database", "username", "password"]
        sample_values = {}
        missing_keys = []
        
        try:
            db_config = self.config_manager.get_database_config()
            if db_config:
                sample_values = {
                    "host": db_config.host,
                    "port": str(db_config.port),
                    "database": db_config.database,
                    "username": db_config.username,
                    "password": "***" if db_config.password else "Not Set"
                }
            else:
                missing_keys = required_keys
                
        except Exception as e:
            missing_keys = required_keys
            
        return {
            "name": "Database Configuration",
            "status": "loaded" if not missing_keys else "incomplete",
            "keys_count": len(sample_values),
            "required_keys": required_keys,
            "missing_keys": missing_keys,
            "sample_values": sample_values
        }
    
    def _get_embedding_config_status(self) -> Dict[str, Any]:
        """임베딩 설정 상태"""
        required_keys = ["provider", "model_name"]
        sample_values = {}
        missing_keys = []
        
        try:
            embedding_config = self.config_manager.get_config("embedding", {})
            if embedding_config:
                sample_values = {
                    "provider": embedding_config.get("provider", "Not Set"),
                    "model_name": embedding_config.get("model_name", "Not Set")
                }
            else:
                missing_keys = required_keys
                
        except Exception as e:
            missing_keys = required_keys
            
        return {
            "name": "Embedding Configuration",
            "status": "loaded" if not missing_keys else "incomplete",
            "keys_count": len(sample_values),
            "required_keys": required_keys,
            "missing_keys": missing_keys,
            "sample_values": sample_values
        }
    
    def _get_rag_config_status(self) -> Dict[str, Any]:
        """RAG 설정 상태"""
        required_keys = ["chunk_size", "chunk_overlap", "top_k"]
        sample_values = {}
        missing_keys = []
        
        try:
            chunking_config = self.config_manager.get_chunking_config()
            rag_config = self.config_manager.get_config("rag", {})
            
            if chunking_config or rag_config:
                sample_values = {
                    "chunk_size": str(chunking_config.get("chunk_size", "Not Set")),
                    "chunk_overlap": str(chunking_config.get("chunk_overlap", "Not Set")),
                    "top_k": str(rag_config.get("top_k", "Not Set")),
                    "similarity_threshold": str(rag_config.get("similarity_threshold", "Not Set"))
                }
            else:
                missing_keys = required_keys
                
        except Exception as e:
            missing_keys = required_keys
            
        return {
            "name": "RAG Configuration",
            "status": "loaded" if not missing_keys else "incomplete",
            "keys_count": len(sample_values),
            "required_keys": required_keys,
            "missing_keys": missing_keys,
            "sample_values": sample_values
        }
    
    def _get_cache_config_status(self) -> Dict[str, Any]:
        """캐시 설정 상태"""
        required_keys = ["host", "port", "database"]
        sample_values = {}
        missing_keys = []
        
        try:
            cache_config = self.config_manager.get_cache_config()
            if cache_config:
                sample_values = {
                    "host": cache_config.host,
                    "port": str(cache_config.port),
                    "database": str(cache_config.database),
                    "password": "***" if cache_config.password else "Not Set"
                }
            else:
                missing_keys = required_keys
                
        except Exception as e:
            missing_keys = required_keys
            
        return {
            "name": "Cache Configuration",
            "status": "loaded" if not missing_keys else "incomplete",
            "keys_count": len(sample_values),
            "required_keys": required_keys,
            "missing_keys": missing_keys,
            "sample_values": sample_values
        }
    
    def _get_logging_config_status(self) -> Dict[str, Any]:
        """로깅 설정 상태"""
        required_keys = ["level", "format"]
        sample_values = {}
        missing_keys = []
        
        try:
            logging_config = self.config_manager.get_logging_config()
            if logging_config:
                sample_values = {
                    "level": logging_config.get("level", "Not Set"),
                    "format": logging_config.get("format", "Not Set")[:50] + "..." if len(str(logging_config.get("format", ""))) > 50 else str(logging_config.get("format", "Not Set"))
                }
            else:
                missing_keys = required_keys
                
        except Exception as e:
            missing_keys = required_keys
            
        return {
            "name": "Logging Configuration",
            "status": "loaded" if not missing_keys else "incomplete",
            "keys_count": len(sample_values),
            "required_keys": required_keys,
            "missing_keys": missing_keys,
            "sample_values": sample_values
        }
    
    def _get_environment_variables_status(self) -> Dict[str, Any]:
        """환경변수 상태 조회 - 데모용"""
        # 데모에서는 환경변수 의존성을 최소화
        demo_env_vars = [
            "APP_ENV",
            "LOG_LEVEL"
        ]
        
        env_status = {
            "total_env_vars": len(os.environ),
            "demo_related_vars": {},
            "missing_demo_vars": [],
            "recommendations": []
        }
        
        # APP_ENV 확인 
        app_env = os.getenv("APP_ENV", "demo")
        env_status["demo_related_vars"]["APP_ENV"] = app_env
        
        # LOG_LEVEL 확인
        log_level = os.getenv("LOG_LEVEL", "INFO")
        env_status["demo_related_vars"]["LOG_LEVEL"] = log_level
        
        # 데모용 권장사항
        if app_env != "demo":
            env_status["recommendations"].append("데모 모드에서는 APP_ENV=demo 설정을 권장합니다")
        
        env_status["recommendations"].append("데모에서는 외부 API 키가 필요하지 않습니다 (Mock 서비스 사용)")
        env_status["recommendations"].append("모든 데이터는 메모리에서 처리되어 환경변수 설정이 간단합니다")
            
        return env_status
    
    def _get_demo_llm_config_status(self) -> Dict[str, Any]:
        """데모용 LLM 설정 상태 - ConfigManager에서 가져오기"""
        if not self.config_manager:
            return {
                "name": "LLM Configuration (Demo)",
                "status": "not_available", 
                "keys_count": 0,
                "required_keys": [],
                "missing_keys": [],
                "sample_values": {}
            }
        
        try:
            # ConfigManager에서 Mock LLM 설정 가져오기
            mock_config = self.config_manager.get_mock_llm_config()
            if mock_config:
                return {
                    "name": "LLM Configuration (Demo)",
                    "status": "loaded",
                    "keys_count": len(mock_config),
                    "required_keys": ["response_type", "delay_ms"],
                    "missing_keys": [],
                    "sample_values": {
                        "response_type": mock_config.get("response_type", "mock"),
                        "delay_ms": str(mock_config.get("delay_ms", 0)),
                        "provider": "Mock"
                    }
                }
            else:
                return {
                    "name": "LLM Configuration (Demo)",
                    "status": "incomplete",
                    "keys_count": 0,
                    "required_keys": ["response_type", "delay_ms"],
                    "missing_keys": ["response_type", "delay_ms"],
                    "sample_values": {}
                }
        except Exception as e:
            return {
                "name": "LLM Configuration (Demo)",
                "status": "error",
                "error_message": str(e),
                "keys_count": 0,
                "required_keys": [],
                "missing_keys": [],
                "sample_values": {}
            }
    
    def _get_validation_results(self) -> Dict[str, Any]:
        """설정 유효성 검증 결과"""
        validation_results = {
            "overall_status": "unknown",
            "critical_issues": [],
            "warnings": [],
            "passed_checks": [],
            "config_completeness": 0.0
        }
        
        if not self.config_manager:
            validation_results["critical_issues"].append("ConfigManager가 초기화되지 않았습니다")
            return validation_results
        
        try:
            total_checks = 0
            passed_checks = 0
            
            # 설정 파일 존재 여부 확인
            config_files = self._get_config_files_status()
            for file_info in config_files:
                total_checks += 1
                if file_info["exists"]:
                    passed_checks += 1
                    validation_results["passed_checks"].append(f"{file_info['filename']} 파일 존재")
                else:
                    validation_results["warnings"].append(f"{file_info['filename']} 파일 없음")
            
            # 필수 설정 확인
            sections = self._get_config_sections_status()
            for section in sections:
                total_checks += 1
                if section["status"] == "loaded":
                    passed_checks += 1
                    validation_results["passed_checks"].append(f"{section['name']} 설정 로드됨")
                elif section["missing_keys"]:
                    validation_results["warnings"].append(f"{section['name']}: 누락된 키 {len(section['missing_keys'])}개")
                else:
                    validation_results["critical_issues"].append(f"{section['name']} 설정 로드 실패")
            
            # 전체 완성도 계산
            if total_checks > 0:
                validation_results["config_completeness"] = (passed_checks / total_checks) * 100
            
            # 전체 상태 결정
            if len(validation_results["critical_issues"]) > 0:
                validation_results["overall_status"] = "critical"
            elif len(validation_results["warnings"]) > 0:
                validation_results["overall_status"] = "warning"
            else:
                validation_results["overall_status"] = "healthy"
                
        except Exception as e:
            validation_results["critical_issues"].append(f"검증 중 오류: {str(e)}")
            validation_results["overall_status"] = "error"
        
        return validation_results
    
    def _get_configuration_recommendations(self) -> List[Dict[str, str]]:
        """설정 관련 권장사항 - 데모용"""
        recommendations = []
        
        # 환경변수 권장사항
        env_status = self._get_environment_variables_status()
        for rec in env_status.get("recommendations", []):
            recommendations.append({
                "type": "environment",
                "message": rec,
                "priority": "low"  # 데모에서는 중요도 낮음
            })
        
        # ConfigManager에서 설정 관련 권장사항 가져오기 (실제 설정 기반)
        if self.config_manager:
            try:
                # 실제 설정 상태에 따른 권장사항
                config_files = self._get_config_files_status()
                missing_files = [f for f in config_files if not f["exists"]]
                if missing_files:
                    recommendations.append({
                        "type": "files",
                        "message": f"{len(missing_files)}개의 설정 파일이 누락되었습니다",
                        "priority": "medium"
                    })
            except:
                pass
        
        # 기본 데모 권장사항
        recommendations.append({
            "type": "demo",
            "message": "데모는 ConfigManager를 통해 중앙 집중식 설정 관리를 사용합니다",
            "priority": "info"
        })
        
        return recommendations
    
    def get_quick_config_status(self) -> str:
        """빠른 설정 상태 확인"""
        try:
            validation = self._get_validation_results()
            return validation["overall_status"]
        except:
            return "unknown"