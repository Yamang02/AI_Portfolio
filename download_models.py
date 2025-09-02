#!/usr/bin/env python3
"""
모델 다운로드 및 캐시 스크립트
루트 디렉토리에서 실행하여 모든 서비스가 공유하는 모델 캐시 생성
"""

import os
import sys
from pathlib import Path
import subprocess
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_models():
    """필요한 모델들을 다운로드"""
    
    # 루트 디렉토리의 캐시 디렉토리 설정
    cache_dir = Path("model_cache")
    cache_dir.mkdir(exist_ok=True)
    
    # HuggingFace 캐시 디렉토리
    hf_cache = cache_dir / "huggingface"
    hf_cache.mkdir(exist_ok=True)
    
    # KoNLPy 캐시 디렉토리
    konlpy_cache = cache_dir / "konlpy"
    konlpy_cache.mkdir(exist_ok=True)
    
    # 환경변수 설정
    os.environ["HF_HOME"] = str(hf_cache)
    os.environ["TRANSFORMERS_CACHE"] = str(hf_cache)
    os.environ["KONLPY_DATA_PATH"] = str(konlpy_cache)
    
    logger.info("🚀 모델 다운로드 시작...")
    
    try:
        # 1. Sentence Transformers 모델 다운로드
        logger.info("📥 Sentence Transformers 모델 다운로드 중...")
        subprocess.run([
            sys.executable, "-c",
            "from sentence_transformers import SentenceTransformer; "
            "model = SentenceTransformer('jhgan/ko-sroberta-multitask'); "
            "print('✅ Sentence Transformers 모델 다운로드 완료')"
        ], check=True, env=os.environ)
        
        # 2. KoNLPy 모델 다운로드
        logger.info("📥 KoNLPy 모델 다운로드 중...")
        subprocess.run([
            sys.executable, "-c",
            "import konlpy; konlpy.download('all'); "
            "print('✅ KoNLPy 모델 다운로드 완료')"
        ], check=True, env=os.environ)
        
        # 3. 추가 모델들 (필요시)
        logger.info("📥 추가 모델 다운로드 중...")
        subprocess.run([
            sys.executable, "-c",
            "from transformers import AutoTokenizer, AutoModel; "
            "tokenizer = AutoTokenizer.from_pretrained('klue/bert-base'); "
            "model = AutoModel.from_pretrained('klue/bert-base'); "
            "print('✅ BERT 모델 다운로드 완료')"
        ], check=True, env=os.environ)
        
        logger.info("🎉 모든 모델 다운로드 완료!")
        logger.info(f"📁 캐시 위치: {cache_dir.absolute()}")
        
        # 캐시 크기 확인
        total_size = sum(f.stat().st_size for f in cache_dir.rglob('*') if f.is_file())
        logger.info(f"📊 캐시 크기: {total_size / (1024*1024):.1f} MB")
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ 모델 다운로드 실패: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ 예상치 못한 오류: {e}")
        return False
    
    return True

def main():
    """메인 함수"""
    logger.info("🔧 모델 캐시 설정 시작")
    
    if download_models():
        logger.info("✅ 모델 캐시 설정 완료")
        logger.info("💡 이제 Docker Compose 실행 시 모델이 빠르게 로드됩니다!")
        logger.info("🚀 실행 명령: docker-compose up")
    else:
        logger.error("❌ 모델 캐시 설정 실패")
        sys.exit(1)

if __name__ == "__main__":
    main()
