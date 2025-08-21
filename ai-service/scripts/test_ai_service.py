#!/usr/bin/env python3
"""
AI 서비스 핵심 기능 테스트 스크립트
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

class AIServiceTester:
    """AI 서비스 테스터 클래스"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """테스트 결과 로깅"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def test_root_endpoint(self) -> bool:
        """루트 엔드포인트 테스트"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["service", "version", "status"]
                if all(field in data for field in expected_fields):
                    self.log_test("루트 엔드포인트", True, f"응답: {data}")
                    return True
                else:
                    self.log_test("루트 엔드포인트", False, f"필수 필드 누락: {data}")
                    return False
            else:
                self.log_test("루트 엔드포인트", False, f"상태 코드: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("루트 엔드포인트", False, f"에러: {str(e)}")
            return False
    
    def test_health_check(self) -> bool:
        """헬스체크 엔드포인트 테스트"""
        try:
            response = self.session.get(f"{self.base_url}/api/v1/health")
            if response.status_code == 200:
                data = response.json()
                if "status" in data and "services" in data:
                    self.log_test("헬스체크", True, f"상태: {data['status']}")
                    return True
                else:
                    self.log_test("헬스체크", False, f"응답 형식 오류: {data}")
                    return False
            else:
                self.log_test("헬스체크", False, f"상태 코드: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("헬스체크", False, f"에러: {str(e)}")
            return False
    
    def test_service_info(self) -> bool:
        """서비스 정보 엔드포인트 테스트"""
        try:
            response = self.session.get(f"{self.base_url}/api/v1/info")
            if response.status_code == 200:
                data = response.json()
                if "service" in data and "features" in data:
                    self.log_test("서비스 정보", True, f"서비스: {data['service']}")
                    return True
                else:
                    self.log_test("서비스 정보", False, f"응답 형식 오류: {data}")
                    return False
            else:
                self.log_test("서비스 정보", False, f"상태 코드: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("서비스 정보", False, f"에러: {str(e)}")
            return False
    
    def test_chat_api(self) -> bool:
        """채팅 API 테스트"""
        try:
            test_messages = [
                "안녕하세요!",
                "당신은 누구인가요?",
                "프로젝트에 대해 알려주세요"
            ]
            
            for message in test_messages:
                payload = {"message": message}
                response = self.session.post(
                    f"{self.base_url}/api/v1/chat",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "answer" in data and "query_type" in data:
                        self.log_test(f"채팅 API - '{message[:20]}...'", True, 
                                    f"응답 타입: {data['query_type']}")
                    else:
                        self.log_test(f"채팅 API - '{message[:20]}...'", False, 
                                    f"응답 형식 오류: {data}")
                        return False
                else:
                    self.log_test(f"채팅 API - '{message[:20]}...'", False, 
                                f"상태 코드: {response.status_code}")
                    return False
                    
            return True
            
        except Exception as e:
            self.log_test("채팅 API", False, f"에러: {str(e)}")
            return False
    
    def test_error_handling(self) -> bool:
        """에러 처리 테스트"""
        try:
            # 빈 메시지로 테스트
            payload = {"message": ""}
            response = self.session.post(
                f"{self.base_url}/api/v1/chat",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code in [400, 422]:  # Validation error
                self.log_test("에러 처리 - 빈 메시지", True, f"상태 코드: {response.status_code}")
            else:
                self.log_test("에러 처리 - 빈 메시지", False, f"예상 에러가 발생하지 않음: {response.status_code}")
                return False
            
            # 잘못된 JSON으로 테스트
            response = self.session.post(
                f"{self.base_url}/api/v1/chat",
                data="invalid json",
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code in [400, 422]:  # JSON parsing error
                self.log_test("에러 처리 - 잘못된 JSON", True, f"상태 코드: {response.status_code}")
            else:
                self.log_test("에러 처리 - 잘못된 JSON", False, f"예상 에러가 발생하지 않음: {response.status_code}")
                return False
                
            return True
            
        except Exception as e:
            self.log_test("에러 처리", False, f"에러: {str(e)}")
            return False
    
    def test_qdrant_connection(self) -> bool:
        """Qdrant 연결 테스트"""
        try:
            response = self.session.get("http://localhost:6333/collections")
            if response.status_code == 200:
                self.log_test("Qdrant 연결", True, "Qdrant 서비스 응답 성공")
                return True
            else:
                self.log_test("Qdrant 연결", False, f"상태 코드: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Qdrant 연결", False, f"연결 실패: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """모든 테스트 실행"""
        print("🚀 AI 서비스 핵심 기능 테스트 시작\n")
        
        tests = [
            ("루트 엔드포인트", self.test_root_endpoint),
            ("헬스체크", self.test_health_check),
            ("서비스 정보", self.test_service_info),
            ("채팅 API", self.test_chat_api),
            ("에러 처리", self.test_error_handling),
            ("Qdrant 연결", self.test_qdrant_connection),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log_test(test_name, False, f"테스트 실행 중 예외: {str(e)}")
        
        # 결과 요약
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"\n📊 테스트 결과 요약:")
        print(f"총 테스트: {total_tests}")
        print(f"성공: {passed_tests} ✅")
        print(f"실패: {failed_tests} ❌")
        
        if failed_tests == 0:
            print("\n🎉 모든 테스트가 통과했습니다!")
        else:
            print(f"\n⚠️  {failed_tests}개 테스트가 실패했습니다.")
            
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "results": self.test_results
        }

def main():
    """메인 함수"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:8000"
    
    print(f"🎯 AI 서비스 테스트 시작: {base_url}")
    print("=" * 50)
    
    tester = AIServiceTester(base_url)
    results = tester.run_all_tests()
    
    # 실패한 테스트가 있으면 종료 코드 1 반환
    sys.exit(1 if results["failed"] > 0 else 0)

if __name__ == "__main__":
    main()
