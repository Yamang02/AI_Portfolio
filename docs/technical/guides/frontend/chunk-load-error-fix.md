# 프로덕션 청크 로드 오류 (MIME type / Failed to fetch module) 해결 가이드

## 증상

프로덕션에서 **가끔** 다음 오류가 발생하고, 새로고침하면 정상 동작함:

- `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`
- `Failed to fetch dynamically imported module: https://www.yamang02.com/assets/index-xxx.js`
- `Uncaught TypeError: Failed to fetch dynamically imported module`

---

## 원인

### 1. 배포와 캐시 타이밍 (Stale chunk)

1. 사용자가 사이트 접속 → **예전 빌드**의 `index.html`을 받음 (캐시 또는 첫 로드).
2. 그 HTML에는 **예전 해시**의 청크 경로가 적혀 있음 (예: `/assets/index-Dnf-Fr2y.js`).
3. 이후 **새 배포**가 이루어지면 서버에는 **새 해시**의 파일만 있음 (예: `index-NewHash.js`).
4. 사용자가 라우트 이동 등으로 **동적 import**가 실행되면, 브라우저는 **예전 경로**로 청크 요청.
5. 서버에 해당 파일이 없음 → **404**.

### 2. SPA fallback이 HTML을 반환

서버(Nginx, Vercel, Netlify 등)가 “없는 경로는 전부 `index.html`로” 처리하도록 설정된 경우:

- 요청: `GET /assets/index-Dnf-Fr2y.js`
- 서버: 파일 없음 → **404** → fallback으로 **`index.html`** 반환
- 브라우저: **JS를 기대**했는데 **HTML**을 받음 → **MIME type 오류** 발생

즉, **“청크 404 + SPA fallback”**이 겹치면 **text/html**이 JS 자리로 가서 위 오류가 난다.

---

## 근본적인 해결 방법

### 1) 서버: `/assets/` 등 정적 리소스는 fallback 하지 않기

**원칙:** `.js`, `.css` 등 **실제 파일이 있는 경로**에 대해서는 **404일 때 `index.html`로 넘기지 않는다.**

#### Nginx 예시

```nginx
server {
    # ... 기존 설정 ...

    # 정적 에셋: 파일이 없으면 404만 반환 (index.html로 fallback 금지)
    location /assets/ {
        root /var/www/yamang02.com;
        try_files $uri =404;
    }

    # SPA 라우팅: 페이지 경로만 index.html로
    location / {
        root /var/www/yamang02.com;
        try_files $uri $uri/ /index.html;
    }
}
```

- `/assets/*` → 파일 없으면 **404** → 브라우저가 “청크 로드 실패”로 처리 가능.
- `/`, `/profile` 등 → 기존처럼 `index.html`로 fallback.

#### Vercel (`vercel.json`)

`rewrites`에서 **에셋 경로는 제외**하고, 나머지만 `index.html`로 보내도록 구성한다.  
(일반적으로 `output: 'static'` 또는 SPA 설정이면 `/assets/*`는 실제 파일로만 매칭되고, 없으면 404가 나와야 함. 만약 `rewrites`에 `{ "source": "/(.*)", "destination": "/index.html" }`만 있으면, **에셋 요청도** index.html로 갈 수 있으니, **에셋은 먼저 정적 파일로 서빙**되도록 확인.)

#### Netlify (`_redirects` 또는 `netlify.toml`)

- `/*    /index.html   200` 같은 규칙이 **에셋보다 나중**에 적용되거나,
- **파일이 있는 경로**는 그대로 두고, **나머지**만 `index.html`로 보내도록 설정.

#### AWS (S3 + CloudFront) — 이 프로젝트 배포 환경

프론트엔드는 **S3 + CloudFront**로 배포 중이다. SPA용으로 CloudFront에서 **Custom Error Response**를 403/404 → 200, 응답 페이지 `/index.html`로 두면, **존재하지 않는 `/assets/xxx.js` 요청도** 404 → index.html이 되어 MIME 오류가 난다.

**해결: CloudFront에서 `/assets/*`는 404 시 index.html로 넘기지 않기**

1. **CloudFront 콘솔** → 해당 Distribution → **Behaviors** 탭.
2. **Cache Behavior 추가** (우선순위를 기본 동작보다 **높게**):
   - **Path pattern**: `/assets/*`
   - **Origin**: 기존과 동일 (S3).
   - **Custom Error Responses**: 이 동작에는 **403/404 → index.html** 설정을 **추가하지 않음** (또는 비워 둠).  
     → `/assets/` 아래 404는 그대로 404로 반환되고, 브라우저는 “청크 로드 실패”만 받게 됨.
3. **Default (*) Behavior**에는 기존처럼 403/404 → 200, Response Page Path `/index.html` 유지 (SPA 라우팅용).

정리: **`/assets/*` 전용 Behavior**를 두고, 그 Behavior에는 SPA fallback(404→index.html)을 적용하지 않는다.

**캐시 (AWS)**  
- **index.html**: S3 업로드 시 `Cache-Control: no-cache` 또는 `max-age=0` 지정(아래 워크플로우 참고). CloudFront에서도 해당 객체는 짧은 캐시 유지.  
- **`/assets/*`**: 해시된 파일명이므로 `max-age=31536000, immutable` 등 긴 캐시 유지.

정리하면, **`/assets/*` 요청이 404일 때 index.html이 반환되지 않게** 하면 된다.

### 2) 캐시: `index.html`은 캐시하지 않거나 짧게

- **`index.html`**:  
  - `Cache-Control: no-cache` 또는 `max-age=0` (또는 매우 짧은 max-age).  
  - 배포할 때마다 사용자가 최신 HTML(최신 청크 경로)을 받도록.
- **`/assets/*`**:  
  - 해시가 파일명에 있으므로 `Cache-Control: max-age=31536000, immutable` 등 **긴 캐시** 유지.

이렇게 하면 배포 후에도 사용자가 빨리 새 `index.html`을 받아서, 새 청크 경로를 쓰게 된다.

### 3) 클라이언트: 청크 로드 실패 시 자동 새로고침 (권장)

서버 설정만으로도 404 시 HTML이 안 오면 MIME 오류는 사라지지만, **이미 예전 HTML을 가진 사용자**는 여전히 **예전 청크 URL**을 요청해 **404**를 받을 수 있다.  
이 경우 **“청크 로드 실패 → 한 번만 전체 새로고침”** 하면 최신 `index.html` + 새 청크를 받아서 해결된다.

이를 위해 다음을 적용했다:

- **전역 에러 리스너**: `import()` 실패(ChunkLoadError) 또는 `type="module"` 스크립트 로드 실패 시,  
  - **한 번만** `window.location.reload(true)` (또는 `window.location.reload()`).
- **중복 새로고침 방지**: `sessionStorage` 등으로 “이번 세션에서 이미 청크 오류로 새로고침했는지” 플래그를 두고, 한 번만 재시도.

구체적인 구현: `frontend/src/shared/lib/chunkLoadErrorRecovery.ts`에서 전역 `unhandledrejection` / `error` 리스너로 청크 로드 실패 메시지를 감지하고, `sessionStorage`로 세션당 1회만 `location.reload()` 호출. `main.tsx` 최상단에서 `registerChunkLoadErrorRecovery()` 호출됨.

배포 시 서버/캐시 설정은 위 "근본적인 해결 방법" 참고. **체크리스트 (AWS)**  
- [ ] CloudFront에 **Path pattern `/assets/*`** 전용 Behavior 추가, 해당 Behavior에는 **Custom Error Response(403/404→index.html) 미적용**.  
- [ ] `index.html`은 S3 업로드 시 `Cache-Control: max-age=0, must-revalidate` (워크플로우에 반영됨).  
- [ ] 클라이언트 `chunkLoadErrorRecovery` 적용 확인 (`main.tsx`).

---

## 요약

| 구분 | 내용 |
|------|------|
| **원인** | 배포 후 예전 HTML이 참조하는 **예전 청크 URL** 요청 → 404 → 서버가 **index.html**을 돌려줌 → JS 대신 HTML 수신 → MIME type 오류 |
| **서버** | `/assets/` 등 정적 리소스는 **404 시 index.html로 fallback 하지 않기** (Nginx 등에서 `try_files $uri =404` 사용). |
| **캐시** | `index.html`은 no-cache 또는 짧은 max-age, `/assets/*`는 긴 캐시. |
| **클라이언트** | 청크 로드 실패 시 **한 번만** 자동 새로고침하여 최신 HTML/청크를 받기. |

이렇게 하면 **근본 원인(서버 fallback)**과 **이미 캐시된 사용자에 대한 복구(자동 새로고침)**를 함께 잡을 수 있다.
