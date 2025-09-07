#!/usr/bin/env python3
"""
Unit Tests Runner
유닛 테스트 실행 스크립트

AI Service Demo의 유닛 테스트를 실행하는 스크립트입니다.
"""

import os
import sys
import subprocess
import time
import logging
from pathlib import Path

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def run_unit_tests():
    """유닛 테스트 실행"""
    logger.info("🧪 Starting Unit Tests Execution")
    
    # 프로젝트 루트 디렉토리로 이동
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # pytest 명령어 구성
        cmd = [
            sys.executable, "-m", "pytest",
            "tests/unit/",
            "-v",  # 상세 출력
            "--tb=short",  # 짧은 트레이스백
            "--color=yes",  # 컬러 출력
            "--durations=10",  # 가장 느린 10개 테스트 표시
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        
        # 테스트 실행
        result = subprocess.run(cmd, capture_output=False, text=True)
        
        # 실행 시간 계산
        execution_time = time.time() - start_time
        
        if result.returncode == 0:
            logger.info(f"✅ Unit tests completed successfully in {execution_time:.2f} seconds")
            return True
        else:
            logger.error(f"❌ Unit tests failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ Unit tests execution failed after {execution_time:.2f} seconds: {e}")
        return False


def run_unit_tests_with_coverage():
    """커버리지와 함께 유닛 테스트 실행"""
    logger.info("🧪 Starting Unit Tests with Coverage")
    
    # 프로젝트 루트 디렉토리로 이동
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # pytest 명령어 구성 (커버리지 포함)
        cmd = [
            sys.executable, "-m", "pytest",
            "tests/unit/",
            "--cov=ai_service.demo",  # 커버리지 대상
            "--cov-report=term-missing",  # 터미널에 누락된 라인 표시
            "--cov-report=html",  # HTML 리포트 생성
            "--cov-report=xml",  # XML 리포트 생성
            "-v",
            "--tb=short",
            "--color=yes",
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        
        # 테스트 실행
        result = subprocess.run(cmd, capture_output=False, text=True)
        
        # 실행 시간 계산
        execution_time = time.time() - start_time
        
        if result.returncode == 0:
            logger.info(f"✅ Unit tests with coverage completed successfully in {execution_time:.2f} seconds")
            logger.info("📊 Coverage report generated in htmlcov/ directory")
            return True
        else:
            logger.error(f"❌ Unit tests with coverage failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ Unit tests with coverage execution failed after {execution_time:.2f} seconds: {e}")
        return False


def run_specific_test(test_path):
    """특정 테스트 실행"""
    logger.info(f"🧪 Running specific test: {test_path}")
    
    # 프로젝트 루트 디렉토리로 이동
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # pytest 명령어 구성
        cmd = [
            sys.executable, "-m", "pytest",
            test_path,
            "-v",
            "--tb=short",
            "--color=yes",
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        
        # 테스트 실행
        result = subprocess.run(cmd, capture_output=False, text=True)
        
        # 실행 시간 계산
        execution_time = time.time() - start_time
        
        if result.returncode == 0:
            logger.info(f"✅ Specific test completed successfully in {execution_time:.2f} seconds")
            return True
        else:
            logger.error(f"❌ Specific test failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ Specific test execution failed after {execution_time:.2f} seconds: {e}")
        return False


def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description="AI Service Demo Unit Tests Runner")
    parser.add_argument(
        "--coverage", 
        action="store_true", 
        help="Run tests with coverage report"
    )
    parser.add_argument(
        "--test", 
        type=str, 
        help="Run specific test file or test function"
    )
    
    args = parser.parse_args()
    
    # 테스트 실행
    if args.test:
        success = run_specific_test(args.test)
    elif args.coverage:
        success = run_unit_tests_with_coverage()
    else:
        success = run_unit_tests()
    
    # 결과에 따른 종료 코드 설정
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
