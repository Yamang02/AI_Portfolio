#!/usr/bin/env python3
"""
Integration Tests Runner
통합 테스트 실행 스크립트

AI Service Demo의 서비스 간 연동 테스트를 실행하는 스크립트입니다.
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


def run_service_integration_tests():
    """서비스 통합 테스트 실행"""
    logger.info("🔗 Starting Service Integration Tests")
    
    # 프로젝트 루트 디렉토리로 이동
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # pytest 명령어 구성
        cmd = [
            sys.executable, "-m", "pytest",
            "tests/integration/",
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
            logger.info(f"✅ Service integration tests completed successfully in {execution_time:.2f} seconds")
            return True
        else:
            logger.error(f"❌ Service integration tests failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ Service integration tests execution failed after {execution_time:.2f} seconds: {e}")
        return False


def run_usecase_integration_tests():
    """유스케이스 통합 테스트 실행"""
    logger.info("🎯 Starting UseCase Integration Tests")
    
    # 프로젝트 루트 디렉토리로 이동
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # pytest 명령어 구성
        cmd = [
            sys.executable, "-m", "pytest",
            "tests/integration/test_usecase_integration.py",
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
            logger.info(f"✅ UseCase integration tests completed successfully in {execution_time:.2f} seconds")
            return True
        else:
            logger.error(f"❌ UseCase integration tests failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ UseCase integration tests execution failed after {execution_time:.2f} seconds: {e}")
        return False


def run_all_integration_tests():
    """모든 통합 테스트 실행"""
    logger.info("🔗🎯 Starting All Integration Tests")
    
    # 프로젝트 루트 디렉토리로 이동
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # pytest 명령어 구성
        cmd = [
            sys.executable, "-m", "pytest",
            "tests/integration/",
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
            logger.info(f"✅ All integration tests completed successfully in {execution_time:.2f} seconds")
            return True
        else:
            logger.error(f"❌ All integration tests failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ All integration tests execution failed after {execution_time:.2f} seconds: {e}")
        return False


def run_integration_tests_with_coverage():
    """커버리지와 함께 통합 테스트 실행"""
    logger.info("🔗🎯 Starting Integration Tests with Coverage")
    
    # 프로젝트 루트 디렉토리로 이동
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # pytest 명령어 구성 (커버리지 포함)
        cmd = [
            sys.executable, "-m", "pytest",
            "tests/integration/",
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
            logger.info(f"✅ Integration tests with coverage completed successfully in {execution_time:.2f} seconds")
            logger.info("📊 Coverage report generated in htmlcov/ directory")
            return True
        else:
            logger.error(f"❌ Integration tests with coverage failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ Integration tests with coverage execution failed after {execution_time:.2f} seconds: {e}")
        return False


def check_integration_test_environment():
    """통합 테스트 환경 확인"""
    logger.info("🔍 Checking integration test environment")
    
    # 프로젝트 루트 디렉토리로 이동
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    # 필요한 디렉토리와 파일 확인
    required_paths = [
        "tests/integration/",
        "tests/integration/test_basic_execution.py",
        "ai_service/demo/application_bootstrap.py",
        "ai_service/demo/infrastructure/inbound/service_factory.py",
        "ai_service/demo/infrastructure/inbound/usecase_factory.py",
    ]
    
    missing_paths = []
    for path in required_paths:
        if not os.path.exists(path):
            missing_paths.append(path)
    
    if missing_paths:
        logger.error(f"❌ Missing required paths: {missing_paths}")
        return False
    
    logger.info("✅ Integration test environment check passed")
    return True


def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description="AI Service Demo Integration Tests Runner")
    parser.add_argument(
        "--coverage", 
        action="store_true", 
        help="Run tests with coverage report"
    )
    parser.add_argument(
        "--service-only", 
        action="store_true", 
        help="Run only service integration tests"
    )
    parser.add_argument(
        "--usecase-only", 
        action="store_true", 
        help="Run only usecase integration tests"
    )
    parser.add_argument(
        "--check-env", 
        action="store_true", 
        help="Check integration test environment only"
    )
    
    args = parser.parse_args()
    
    # 환경 확인만 하는 경우
    if args.check_env:
        success = check_integration_test_environment()
        sys.exit(0 if success else 1)
    
    # 환경 확인
    if not check_integration_test_environment():
        logger.error("❌ Integration test environment check failed")
        sys.exit(1)
    
    # 테스트 실행
    if args.service_only:
        success = run_service_integration_tests()
    elif args.usecase_only:
        success = run_usecase_integration_tests()
    elif args.coverage:
        success = run_integration_tests_with_coverage()
    else:
        success = run_all_integration_tests()
    
    # 결과에 따른 종료 코드 설정
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
