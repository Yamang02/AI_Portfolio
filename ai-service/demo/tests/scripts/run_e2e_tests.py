#!/usr/bin/env python3
"""
E2E Tests Runner
E2E 테스트 실행 스크립트

AI Service Demo의 Playwright 기반 E2E 테스트를 실행하는 스크립트입니다.
실제 사용자 시나리오를 시뮬레이션하여 전체 시스템의 동작을 검증합니다.
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


def check_playwright_installation():
    """Playwright 설치 상태 확인"""
    logger.info("🔍 Checking Playwright installation")
    
    try:
        # Playwright 설치 확인
        result = subprocess.run(
            [sys.executable, "-m", "playwright", "--version"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info(f"✅ Playwright installed: {result.stdout.strip()}")
            return True
        else:
            logger.error("❌ Playwright not installed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to check Playwright installation: {e}")
        return False


def install_playwright():
    """Playwright 설치"""
    logger.info("📦 Installing Playwright")
    
    try:
        # Playwright 설치
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "playwright"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("✅ Playwright installed successfully")
            
            # 브라우저 설치
            logger.info("🌐 Installing Playwright browsers")
            browser_result = subprocess.run(
                [sys.executable, "-m", "playwright", "install"],
                capture_output=True,
                text=True
            )
            
            if browser_result.returncode == 0:
                logger.info("✅ Playwright browsers installed successfully")
                return True
            else:
                logger.error(f"❌ Failed to install Playwright browsers: {browser_result.stderr}")
                return False
        else:
            logger.error(f"❌ Failed to install Playwright: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to install Playwright: {e}")
        return False


def run_e2e_tests():
    """E2E 테스트 실행"""
    logger.info("🎭 Starting E2E Tests Execution")
    
    # E2E 테스트 디렉토리로 이동
    e2e_dir = Path(__file__).parent.parent / "e2e"
    os.chdir(e2e_dir)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # Playwright 테스트 실행
        cmd = [
            sys.executable, "-m", "playwright", "test",
            "--reporter=html",
            "--workers=1",  # 순차 실행으로 안정성 확보
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        logger.info(f"Working directory: {e2e_dir}")
        
        # 테스트 실행
        result = subprocess.run(cmd, capture_output=False, text=True)
        
        # 실행 시간 계산
        execution_time = time.time() - start_time
        
        if result.returncode == 0:
            logger.info(f"✅ E2E tests completed successfully in {execution_time:.2f} seconds")
            logger.info("📊 E2E test report generated in playwright-report/ directory")
            return True
        else:
            logger.error(f"❌ E2E tests failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ E2E tests execution failed after {execution_time:.2f} seconds: {e}")
        return False


def run_e2e_tests_headless():
    """헤드리스 모드로 E2E 테스트 실행"""
    logger.info("🎭 Starting E2E Tests Execution (Headless Mode)")
    
    # E2E 테스트 디렉토리로 이동
    e2e_dir = Path(__file__).parent.parent / "e2e"
    os.chdir(e2e_dir)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # Playwright 테스트 실행 (헤드리스 모드)
        cmd = [
            sys.executable, "-m", "playwright", "test",
            "--reporter=html",
            "--workers=1",
            "--headed=false",  # 헤드리스 모드
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        logger.info(f"Working directory: {e2e_dir}")
        
        # 테스트 실행
        result = subprocess.run(cmd, capture_output=False, text=True)
        
        # 실행 시간 계산
        execution_time = time.time() - start_time
        
        if result.returncode == 0:
            logger.info(f"✅ E2E tests completed successfully in {execution_time:.2f} seconds")
            logger.info("📊 E2E test report generated in playwright-report/ directory")
            return True
        else:
            logger.error(f"❌ E2E tests failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ E2E tests execution failed after {execution_time:.2f} seconds: {e}")
        return False


def run_specific_e2e_test(test_file):
    """특정 E2E 테스트 실행"""
    logger.info(f"🎭 Running specific E2E test: {test_file}")
    
    # E2E 테스트 디렉토리로 이동
    e2e_dir = Path(__file__).parent.parent / "e2e"
    os.chdir(e2e_dir)
    
    # 테스트 실행 시작 시간 기록
    start_time = time.time()
    
    try:
        # 특정 테스트 파일 실행
        cmd = [
            sys.executable, "-m", "playwright", "test",
            test_file,
            "--reporter=html",
            "--workers=1",
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        logger.info(f"Working directory: {e2e_dir}")
        
        # 테스트 실행
        result = subprocess.run(cmd, capture_output=False, text=True)
        
        # 실행 시간 계산
        execution_time = time.time() - start_time
        
        if result.returncode == 0:
            logger.info(f"✅ Specific E2E test completed successfully in {execution_time:.2f} seconds")
            return True
        else:
            logger.error(f"❌ Specific E2E test failed after {execution_time:.2f} seconds")
            return False
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"❌ Specific E2E test execution failed after {execution_time:.2f} seconds: {e}")
        return False


def check_e2e_environment():
    """E2E 테스트 환경 확인"""
    logger.info("🔍 Checking E2E test environment")
    
    # E2E 테스트 디렉토리로 이동
    e2e_dir = Path(__file__).parent.parent / "e2e"
    os.chdir(e2e_dir)
    
    # 필요한 파일들 확인
    required_files = [
        "playwright.config.ts",
        "tests/document-management.spec.ts",
        "tests/rag-query.spec.ts",
        "tests/vector-search.spec.ts",
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        logger.error(f"❌ Missing required files: {missing_files}")
        return False
    
    # Playwright 설치 확인
    if not check_playwright_installation():
        logger.info("📦 Installing Playwright...")
        if not install_playwright():
            return False
    
    logger.info("✅ E2E test environment check passed")
    return True


def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description="AI Service Demo E2E Tests Runner")
    parser.add_argument(
        "--headless", 
        action="store_true", 
        help="Run tests in headless mode"
    )
    parser.add_argument(
        "--test", 
        type=str, 
        help="Run specific test file"
    )
    parser.add_argument(
        "--check-env", 
        action="store_true", 
        help="Check E2E test environment only"
    )
    parser.add_argument(
        "--install", 
        action="store_true", 
        help="Install Playwright and browsers"
    )
    
    args = parser.parse_args()
    
    # 설치만 하는 경우
    if args.install:
        success = install_playwright()
        sys.exit(0 if success else 1)
    
    # 환경 확인만 하는 경우
    if args.check_env:
        success = check_e2e_environment()
        sys.exit(0 if success else 1)
    
    # 환경 확인
    if not check_e2e_environment():
        logger.error("❌ E2E test environment check failed")
        sys.exit(1)
    
    # 테스트 실행
    if args.test:
        success = run_specific_e2e_test(args.test)
    elif args.headless:
        success = run_e2e_tests_headless()
    else:
        success = run_e2e_tests()
    
    # 결과에 따른 종료 코드 설정
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
