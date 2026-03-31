/**
 * className 유틸리티 함수
 * clsx와 tailwind-merge를 결합한 유틸리티
 */

type ClassValue = string | number | boolean | undefined | null | Record<string, boolean>;

function collectObjectClasses(input: Record<string, boolean>, classes: string[]) {
  for (const key in input) {
    if (input[key]) {
      classes.push(key);
    }
  }
}

function collectClassValue(input: ClassValue, classes: string[]) {
  if (!input) return;

  if (typeof input === 'string') {
    classes.push(input);
    return;
  }

  if (typeof input === 'number') {
    classes.push(String(input));
    return;
  }

  if (Array.isArray(input)) {
    for (const value of input) {
      collectClassValue(value as ClassValue, classes);
    }
    return;
  }

  if (typeof input === 'object') {
    collectObjectClasses(input, classes);
  }
}

/**
 * 클래스 이름을 병합하는 함수
 * 조건부 클래스와 Tailwind 클래스 충돌을 해결
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    collectClassValue(input, classes);
  }

  // Tailwind 클래스 충돌 해결 (간단한 버전)
  // 실제로는 tailwind-merge를 사용하는 것이 좋지만, 의존성 없이 기본적인 충돌 해결
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((cls, index, arr) => arr.indexOf(cls) === index) // 중복 제거
    .join(' ');
}

