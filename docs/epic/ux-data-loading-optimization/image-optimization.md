# 이미지 최적화 가이드

## 현재 상태

홈페이지에서 사용되는 이미지들:
- `/landing/cursor_logo.png`
- `/landing/claude_code_logo.png`
- `/landing/codex_logo.png`
- `/landing/cursor_usage.jpg`
- `/landing/top_5.png`
- `/images/projects/prj-001-skkufac.png`
- `/images/projects/prj-003-ai-chatbot.png`
- `/images/projects/prj-011-genpresso.png`

## 최적화 방법

### 1. 이미지 압축 (권장)

**온라인 도구 사용:**
- [TinyPNG](https://tinypng.com/) - PNG/JPG 압축
- [Squoosh](https://squoosh.app/) - 다양한 포맷 변환 및 압축
- [ImageOptim](https://imageoptim.com/) - Mac 앱

**CLI 도구 사용:**
```bash
# imagemin-cli 설치
npm install -g imagemin-cli imagemin-webp imagemin-mozjpeg imagemin-pngquant

# 이미지 압축
imagemin public/landing/*.{jpg,png} --out-dir=public/landing/optimized --plugin=webp --plugin=mozjpeg --plugin=pngquant
```

### 2. WebP 포맷 변환

WebP는 PNG/JPG보다 25-35% 작은 파일 크기를 제공합니다.

```bash
# cwebp 설치 (macOS)
brew install webp

# PNG를 WebP로 변환
cwebp -q 80 input.png -o output.webp

# JPG를 WebP로 변환
cwebp -q 80 input.jpg -o output.webp
```

### 3. 반응형 이미지 생성

다양한 화면 크기에 맞는 이미지 생성:

```bash
# 1x, 2x, 3x 해상도 생성
convert input.png -resize 420x output-1x.png
convert input.png -resize 840x output-2x.png
convert input.png -resize 1260x output-3x.png
```

### 4. Vite 플러그인 사용 (자동화)

`vite-imagetools` 플러그인을 사용하면 빌드 시 자동으로 최적화됩니다:

```bash
npm install -D vite-imagetools
```

`vite.config.ts`에 추가:
```typescript
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    imagetools({
      defaultDirectives: (url) => {
        if (url.searchParams.has('webp')) {
          return new URLSearchParams('format=webp;quality=80');
        }
        return new URLSearchParams('format=webp;quality=80');
      }
    })
  ]
});
```

사용 예시:
```tsx
import logo from '/landing/cursor_logo.png?w=420&webp';
<img src={logo} alt="Cursor" />
```

### 5. Cloudinary로 마이그레이션 (장기적)

로컬 이미지를 Cloudinary로 업로드하고 최적화 파라미터를 사용:

```typescript
// 현재: /landing/cursor_logo.png
// 변경: Cloudinary URL + 최적화 파라미터
const logoUrl = optimizeImage('https://res.cloudinary.com/.../cursor_logo.png', {
  width: 420,
  quality: 'auto',
  format: 'auto',
});
```

## 권장 작업 순서

1. **즉시 적용 가능**: 온라인 도구로 이미지 압축
   - TinyPNG 또는 Squoosh 사용
   - 압축된 이미지로 교체

2. **단기 개선**: WebP 포맷 변환
   - 기존 PNG/JPG를 WebP로 변환
   - `<picture>` 태그로 fallback 제공

3. **장기 개선**: Vite 플러그인 또는 Cloudinary 마이그레이션
   - 빌드 시 자동 최적화
   - 반응형 이미지 자동 생성

## 예상 효과

- **이미지 크기**: 50-70% 감소
- **로딩 시간**: 1-2초 단축
- **Lighthouse 점수**: +10-15점 향상
