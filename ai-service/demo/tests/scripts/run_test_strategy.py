#!/usr/bin/env python3
"""
Test Strategy Manager
테스트 전략 관리자

AI Service Demo의 테스트 실행 전략을 관리하는 스크립트입니다.
개발 단계별로 적절한 테스트 레벨을 선택하여 실행합니다.
"""

import os
import sys
import subprocess
import time
import logging
from pathlib import Path
from enum import Enum
from typing import List, Dict, Any

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TestLevel(Enum):
    """테스트 레벨 열거형"""
    UNIT = "unit"
    BASIC = "basic"
    INTEGRATION = "integration"
    E2E = "e2e"


class TestStrategy:
    """테스트 전략 클래스"""
    
    def __init__(self):
        self.test_levels = {
            TestLevel.UNIT: {
                "description": "유닛 테스트 - 개별 함수/컴포넌트 테스트",
                "execution_time": "~15초",
                "script": "tests/scripts/run_unit_tests.py",
                "coverage_target": 80
            },
            TestLevel.BASIC: {
                "description": "기본 실행 테스트 - 애플리케이션 부트스트래핑 및 기본 동작",
                "execution_time": "~1분",
                "script": "tests/scripts/run_basic_tests.py",
                "coverage_target": 70
            },
            TestLevel.INTEGRATION: {
                "description": "통합 테스트 - 서비스 간 연동 테스트",
                "execution_time": "~2분",
                "script": "tests/scripts/run_integration_tests.py",
                "coverage_target": 60
            },
            TestLevel.E2E: {
                "description": "E2E 테스트 - 사용자 시나리오 테스트",
                "execution_time": "~3분",
                "script": "tests/scripts/run_e2e_tests.py",
                "coverage_target": 50
            }
        }
    
    def get_test_levels(self) -> List[TestLevel]:
        """테스트 레벨 목록 반환"""
        return list(self.test_levels.keys())
    
    def get_test_info(self, level: TestLevel) -> Dict[str, Any]:
        """특정 테스트 레벨의 정보 반환"""
        return self.test_levels.get(level, {})
    
    def get_recommended_levels(self, development_stage: str) -> List[TestLevel]:
        """개발 단계에 따른 권장 테스트 레벨 반환"""
        recommendations = {
            "development": [TestLevel.UNIT],  # 개발 중: 유닛 테스트만
            "feature_complete": [TestLevel.UNIT, TestLevel.BASIC],  # 기능 완료: 유닛 + 기본
            "integration": [TestLevel.UNIT, TestLevel.BASIC, TestLevel.INTEGRATION],  # 통합: 유닛 + 기본 + 통합
            "deployment": [TestLevel.UNIT, TestLevel.BASIC, TestLevel.INTEGRATION, TestLevel.E2E],  # 배포: 전체
            "request": [TestLevel.E2E]  # 요청 시: E2E만
        }
        return recommendations.get(development_stage, [TestLevel.UNIT])


class TestExecutor:
    """테스트 실행자 클래스"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.strategy = TestStrategy()
        self.results = {}
    
    def execute_test_level(self, level: TestLevel, with_coverage: bool = False) -> bool:
        """특정 테스트 레벨 실행"""
        logger.info(f"🧪 Executing {level.value} tests")
        
        # 프로젝트 루트 디렉토리로 이동
        os.chdir(self.project_root)
        
        # 테스트 실행 시작 시간 기록
        start_time = time.time()
        
        try:
            # 테스트 스크립트 경로
            script_path = self.strategy.get_test_info(level)["script"]
            
            # 명령어 구성
            cmd = [sys.executable, script_path]
            if with_coverage:
                cmd.append("--coverage")
            
            logger.info(f"Running command: {' '.join(cmd)}")
            
            # 테스트 실행
            result = subprocess.run(cmd, capture_output=False, text=True)
            
            # 실행 시간 계산
            execution_time = time.time() - start_time
            
            # 결과 저장
            self.results[level] = {
                "success": result.returncode == 0,
                "execution_time": execution_time,
                "return_code": result.returncode
            }
            
            if result.returncode == 0:
                logger.info(f"✅ {level.value} tests completed successfully in {execution_time:.2f} seconds")
                return True
            else:
                logger.error(f"❌ {level.value} tests failed after {execution_time:.2f} seconds")
                return False
                
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"❌ {level.value} tests execution failed after {execution_time:.2f} seconds: {e}")
            
            # 결과 저장
            self.results[level] = {
                "success": False,
                "execution_time": execution_time,
                "error": str(e)
            }
            return False
    
    def execute_test_levels(self, levels: List[TestLevel], with_coverage: bool = False) -> bool:
        """여러 테스트 레벨 실행"""
        logger.info(f"🧪 Executing multiple test levels: {[level.value for level in levels]}")
        
        all_success = True
        total_start_time = time.time()
        
        for level in levels:
            success = self.execute_test_level(level, with_coverage)
            if not success:
                all_success = False
                # 실패 시 중단할지 결정 (현재는 계속 진행)
                logger.warning(f"⚠️ {level.value} tests failed, but continuing with remaining tests")
        
        total_execution_time = time.time() - total_start_time
        
        if all_success:
            logger.info(f"✅ All test levels completed successfully in {total_execution_time:.2f} seconds")
        else:
            logger.error(f"❌ Some test levels failed after {total_execution_time:.2f} seconds")
        
        return all_success
    
    def get_test_results(self) -> Dict[str, Any]:
        """테스트 결과 반환"""
        return self.results
    
    def print_test_summary(self):
        """테스트 결과 요약 출력"""
        logger.info("📊 Test Execution Summary")
        logger.info("=" * 50)
        
        for level, result in self.results.items():
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            execution_time = result.get("execution_time", 0)
            logger.info(f"{level.value.upper():12} | {status} | {execution_time:.2f}s")
        
        logger.info("=" * 50)


def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description="AI Service Demo Test Strategy Manager")
    parser.add_argument(
        "--stage", 
        type=str, 
        choices=["development", "feature_complete", "integration", "deployment", "request"],
        default="development",
        help="Development stage (default: development)"
    )
    parser.add_argument(
        "--level", 
        type=str, 
        choices=["unit", "basic", "integration", "e2e"],
        help="Specific test level to run"
    )
    parser.add_argument(
        "--coverage", 
        action="store_true", 
        help="Run tests with coverage report"
    )
    parser.add_argument(
        "--list-levels", 
        action="store_true", 
        help="List available test levels"
    )
    parser.add_argument(
        "--recommend", 
        type=str, 
        choices=["development", "feature_complete", "integration", "deployment", "request"],
        help="Show recommended test levels for a development stage"
    )
    
    args = parser.parse_args()
    
    # 프로젝트 루트 디렉토리 설정
    project_root = Path(__file__).parent.parent.parent
    executor = TestExecutor(project_root)
    
    # 테스트 레벨 목록 출력
    if args.list_levels:
        logger.info("📋 Available Test Levels:")
        for level in executor.strategy.get_test_levels():
            info = executor.strategy.get_test_info(level)
            logger.info(f"  {level.value}: {info['description']} ({info['execution_time']})")
        return
    
    # 권장 테스트 레벨 출력
    if args.recommend:
        recommended_levels = executor.strategy.get_recommended_levels(args.recommend)
        logger.info(f"🎯 Recommended test levels for '{args.recommend}' stage:")
        for level in recommended_levels:
            info = executor.strategy.get_test_info(level)
            logger.info(f"  {level.value}: {info['description']} ({info['execution_time']})")
        return
    
    # 특정 테스트 레벨 실행
    if args.level:
        level = TestLevel(args.level)
        success = executor.execute_test_level(level, args.coverage)
        executor.print_test_summary()
        sys.exit(0 if success else 1)
    
    # 개발 단계에 따른 테스트 실행
    recommended_levels = executor.strategy.get_recommended_levels(args.stage)
    logger.info(f"🚀 Running tests for '{args.stage}' stage")
    logger.info(f"📋 Recommended levels: {[level.value for level in recommended_levels]}")
    
    success = executor.execute_test_levels(recommended_levels, args.coverage)
    executor.print_test_summary()
    
    # 결과에 따른 종료 코드 설정
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
