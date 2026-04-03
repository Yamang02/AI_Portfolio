# AEO (Answer Engine Optimization) 전략

**에픽**: [SEO/AEO 최적화](./README.md)
**작성일**: 2026-03-09

---

## AEO란?

AEO(Answer Engine Optimization)는 ChatGPT, Perplexity, Google SGE(Search Generative Experience), Claude 등의 **AI 기반 답변 엔진**이 콘텐츠를 정확하게 이해하고, 사용자 질문에 대한 답변으로 인용할 수 있도록 최적화하는 기법입니다.

전통적인 SEO가 "검색 결과 페이지에서 클릭"을 목표로 한다면, AEO는 **AI 답변 자체에 포함**되는 것을 목표로 합니다.

---

## 포트폴리오에서 AEO가 중요한 이유

### 면접관/채용 담당자 시나리오
```
채용 담당자: "YamangSolution 개발자에 대해 알려줘"
ChatGPT → 포트폴리오 사이트 크롤링 결과 인용 → 프로필 정보 제공
```

### 기술 검색 시나리오
```
개발자: "Spring Boot와 AI 통합 포트폴리오 예시"
Perplexity → 아티클/프로젝트 직접 인용 → 사이트 방문 유도
```

---

## AEO 최적화 전략

### 전략 1: llms.txt 표준 준수

`llms.txt`는 AI 크롤러에게 사이트 콘텐츠의 구조와 허용 범위를 알리는 표준 파일입니다.
(참고: [llmstxt.org](https://llmstxt.org))

**파일 구성**:
```
/llms.txt        → 요약본 (마크다운, ~200줄)
/llms-full.txt   → 전체 콘텐츠 (마크다운, 제한 없음)
```

**`/llms.txt` 내용 원칙**:
1. 개발자 소개 (2-3문단)
2. 주요 프로젝트 목록 (링크 포함)
3. 기술 스택 요약
4. 연락처 정보
5. 콘텐츠 사용 정책

---

### 전략 2: 구조화 데이터로 사실 정확성 보장

AI 답변 엔진은 구조화 데이터(JSON-LD)를 비구조화 텍스트보다 더 신뢰합니다.

**핵심 schema 우선순위**:

| schema 타입 | 효과 |
|-------------|------|
| `Person` | 개인 정보 정확한 인용 (이름, 직함, 기술) |
| `BlogPosting` | 아티클 내용 요약·인용 |
| `FAQPage` | 직접 Q&A 형태로 답변에 삽입 |
| `SoftwareApplication` | 프로젝트 기술 스택 정확 인용 |
| `BreadcrumbList` | 콘텐츠 계층 구조 이해 |

---

### 전략 3: FAQ 콘텐츠 전략

AI 답변 엔진은 명확한 Q&A 형태의 콘텐츠를 가장 잘 인용합니다.

**포트폴리오 핵심 FAQ (예시)**:

```markdown
Q: YamangSolution은 어떤 개발자인가요?
A: AI와 함께 꿈을 실현하는 풀스택 개발자입니다.
   백엔드는 Java/Spring Boot, 프론트엔드는 TypeScript/React를 사용하며,
   Claude API, OpenAI API 등 AI 서비스를 실제 프로젝트에 통합한 경험이 있습니다.

Q: 어떤 프로젝트를 개발했나요?
A: AI 포트폴리오 사이트 (Claude API 챗봇 통합),
   [기타 프로젝트 목록] 등을 개발했습니다.
   전체 프로젝트 목록: https://www.yamang02.com/projects

Q: 협업이나 채용 문의는 어떻게 하나요?
A: ljj0210@gmail.com 으로 이메일 주세요

Q: 이 포트폴리오 사이트는 어떤 기술로 만들어졌나요?
A: 프론트엔드: React 19 + TypeScript + Vite (AWS S3/CloudFront 배포)
   백엔드: Spring Boot 3 + PostgreSQL (GCP Cloud Run 배포)
   AI: Claude API (Anthropic)를 활용한 자연어 챗봇
   아키텍처: 프론트엔드 FSD, 백엔드 Hexagonal Architecture
```

---

### 전략 4: 콘텐츠 명확성 원칙

AI 답변 엔진이 잘 인용하는 콘텐츠의 특징:

1. **첫 문단에 핵심 정보** - 길게 읽지 않아도 요약 가능
2. **구체적인 수치와 사실** - "여러 프로젝트" → "5개 AI 통합 프로젝트"
3. **명확한 기술 스택 나열** - 쉼표로 구분된 기술 목록
4. **능동형 문장** - "담당했습니다" → "설계하고 개발했습니다"
5. **날짜와 버전 정보** - `Spring Boot 3.2`, `React 19` 등 구체적으로

---

### 전략 5: robots.txt AI 크롤러 정책

주요 AI 크롤러 User-Agent 허용 명시:

```
# OpenAI (ChatGPT)
User-agent: GPTBot
Allow: /

# Anthropic (Claude)
User-agent: Claude-Web
Allow: /
User-agent: ClaudeBot
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

# Google (Bard/Gemini)
User-agent: Google-Extended
Allow: /

# Common Crawl (AI 학습 데이터셋)
User-agent: CCBot
Allow: /
```

---

## AEO 측정 방법

### 현재 측정 가능한 지표
- Schema Markup Validator 오류 수
- Rich Results 적격성 수
- `llms.txt` 200 응답 확인

### 향후 측정 지표 (3-6개월 후)
- ChatGPT, Perplexity 등에서 개발자 이름 검색 시 인용 여부 수동 확인
- Google Search Console의 "AI Overview" 출현 여부
- 구조화 데이터 클릭률 (Search Console)

---

## 참고 자료

- [llmstxt.org - LLMs.txt 표준](https://llmstxt.org)
- [Google - 구조화 데이터 가이드](https://developers.google.com/search/docs/appearance/structured-data)
- [Schema.org - FAQ Page](https://schema.org/FAQPage)
- [Anthropic - ClaudeBot 크롤링 정책](https://www.anthropic.com/claude-privacy-policy)
- [OpenAI - GPTBot](https://platform.openai.com/docs/gptbot)

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2026-03-09
