# AI Portfolio Development Conversation Log

## 2025-08-27

### 🔧 RAG Service Docker 실행 문제 해결

#### 📋 **문제 현상**
- Docker 컨테이너에서 ai-service-demo 실행 시 `❌ RAG Service Not Ready` 메시지 출력
- HuggingFace 캐시 권한 오류: `Permission denied: /home/user/.cache/huggingface/hub/models--sentence-transformers--all-MiniLM-L6-v2/.no_exist/...`

#### 🔍 **문제 원인 분석**
1. **누락된 의존성**: `scikit-learn` 패키지가 requirements 파일에 누락
   - `demo/implementations/embedding_service.py:190` - `from sklearn.metrics.pairwise import cosine_similarity`
   - `demo/implementations/in_memory_store.py:8` - `from sklearn.metrics.pairwise import cosine_similarity`

2. **HuggingFace 캐시 권한 문제**: Docker 컨테이너 내에서 `/home/user/.cache/huggingface` 디렉토리에 대한 쓰기 권한 부족

#### ✅ **해결 과정**

**1단계: 의존성 추가**
- `requirements-demo.txt`에 `scikit-learn==1.5.2` 추가
- `requirements-local.txt`에 `scikit-learn==1.5.2` 추가

**2단계: Dockerfile.spaces 권한 설정 수정**
```dockerfile
# 기존
RUN chown -R user:user /app
USER user

# 수정 후
RUN chown -R user:user /app && \
    mkdir -p /home/user/.cache/huggingface && \
    chown -R user:user /home/user/.cache
USER user

# HuggingFace 환경변수 추가
ENV TRANSFORMERS_CACHE=/home/user/.cache/huggingface
ENV HF_HOME=/home/user/.cache/huggingface
```

**3단계: 오류 처리 개선**
- `embedding_service.py`에 캐시 권한 오류 시 캐시 없이 모델 로드하는 fallback 로직 추가
```python
try:
    self.model = SentenceTransformer(self.model_name, cache_folder=self.cache_dir)
except (PermissionError, OSError) as cache_error:
    self.logger.warning(f"Cache permission issue: {cache_error}")
    self.model = SentenceTransformer(self.model_name)  # 캐시 없이 로드
```

**4단계: 디버깅 및 로깅 강화**
- `main_demo.py`에 상세한 초기화 로깅 추가
- RAG 서비스 상태 확인을 위한 `/rag-status` API 엔드포인트 추가

#### 🎯 **최종 결과**
- ✅ RAG service available: `true`
- ✅ RAG service initialized: `true`
- ✅ RAG service type: `RAGService`
- ✅ Docker 컨테이너에서 정상 작동 확인

#### 💡 **학습 포인트**
1. **의존성 관리**: Python 패키지 간접 의존성도 명시적으로 requirements에 포함해야 함
2. **Docker 권한 관리**: 사용자 전환 후 필요한 디렉토리에 대한 권한 설정 필요
3. **환경변수 설정**: HuggingFace 관련 환경변수 적절한 설정 중요
4. **단계별 디버깅**: API 엔드포인트를 통한 서비스 상태 확인의 중요성

---