/**
 * 이미지 최적화 유틸리티
 * Cloudinary URL에 최적화 파라미터를 추가하거나
 * 로컬 이미지 경로를 최적화합니다.
 */

/**
 * Cloudinary URL인지 확인
 */
function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Cloudinary 이미지 URL에 최적화 파라미터 추가
 * 
 * @param url - 원본 이미지 URL
 * @param options - 최적화 옵션
 * @returns 최적화된 이미지 URL
 */
export function optimizeCloudinaryImage(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number; // 'auto' 또는 1-100
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'limit';
  } = {}
): string {
  if (!isCloudinaryUrl(url)) {
    return url; // Cloudinary URL이 아니면 그대로 반환
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;

  // Cloudinary URL 파싱
  const urlParts = url.split('/');
  const uploadIndex = urlParts.findIndex(part => part === 'upload');
  
  if (uploadIndex === -1) {
    return url; // upload 경로가 없으면 그대로 반환
  }

  // 변환 파라미터 생성
  const transformations: string[] = [];

  if (width || height) {
    const size = width && height ? `${width}x${height}` : width ? `w_${width}` : `h_${height}`;
    transformations.push(size);
  }

  transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  // 이미 변환이 있는 경우 확인
  const uploadPart = urlParts[uploadIndex + 1];
  if (uploadPart && uploadPart.includes('_')) {
    // 기존 변환이 있으면 추가
    const transformString = transformations.join(',');
    urlParts[uploadIndex + 1] = `${uploadPart}/${transformString}`;
  } else {
    // 새 변환 추가
    urlParts.splice(uploadIndex + 1, 0, transformations.join(','));
  }

  return urlParts.join('/');
}

/**
 * 이미지 URL 최적화 (Cloudinary 또는 로컬)
 * 
 * @param url - 원본 이미지 URL
 * @param options - 최적화 옵션
 * @returns 최적화된 이미지 URL
 */
export function optimizeImage(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string {
  if (isCloudinaryUrl(url)) {
    return optimizeCloudinaryImage(url, options);
  }

  // 로컬 이미지는 그대로 반환 (빌드 시 최적화 필요)
  // TODO: 로컬 이미지도 WebP 변환 및 압축 적용
  return url;
}

/**
 * 반응형 이미지 소스셋 생성
 * 
 * @param baseUrl - 기본 이미지 URL
 * @param sizes - 반응형 크기 배열
 * @returns srcSet 문자열
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[]
): string {
  if (isCloudinaryUrl(baseUrl)) {
    return sizes
      .map(size => {
        const optimized = optimizeCloudinaryImage(baseUrl, {
          width: size,
          quality: 'auto',
          format: 'auto',
        });
        return `${optimized} ${size}w`;
      })
      .join(', ');
  }

  // 로컬 이미지는 기본 URL만 반환
  return baseUrl;
}

/**
 * 이미지 프리로드 최적화
 * 중요한 이미지는 미리 로드
 */
export function preloadImage(url: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
}
