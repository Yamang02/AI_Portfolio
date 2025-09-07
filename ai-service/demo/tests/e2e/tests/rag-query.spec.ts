import { test, expect } from '@playwright/test';

test.describe('AI Service Demo - RAG Query', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 메인 페이지로 이동하고 샘플 데이터 로드
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 샘플 데이터 로드
    await page.click('button:has-text("샘플 데이터 로드")');
    await page.waitForTimeout(2000);
    
    // Query 탭으로 이동
    await page.click('text=💬 Query');
  });

  test('should generate sample queries from documents', async ({ page }) => {
    // 샘플 쿼리 생성 버튼 클릭
    await page.click('button:has-text("로드된 문서 기반 샘플 쿼리 생성")');
    
    // 샘플 쿼리 드롭다운이 표시되는지 확인
    const sampleQueriesDropdown = page.locator('[data-testid="sample-queries-dropdown"]');
    await expect(sampleQueriesDropdown).toBeVisible();
    
    // 샘플 쿼리 옵션들이 표시되는지 확인
    const queryOptions = page.locator('[data-testid="sample-query-option"]');
    await expect(queryOptions).toHaveCountGreaterThan(0);
  });

  test('should execute RAG query successfully', async ({ page }) => {
    // 질문 입력
    const testQuestion = 'AI 포트폴리오 프로젝트의 주요 기술 스택은 무엇인가요?';
    await page.fill('textarea[placeholder*="질문을 입력하세요"]', testQuestion);
    
    // RAG 쿼리 실행 버튼 클릭
    await page.click('button:has-text("RAG 쿼리 실행")');
    
    // 응답이 표시되는지 확인
    const responseArea = page.locator('[data-testid="rag-response"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    
    // 응답 내용이 비어있지 않은지 확인
    const responseText = await responseArea.textContent();
    expect(responseText).toBeTruthy();
    expect(responseText.length).toBeGreaterThan(0);
  });

  test('should show reference sources', async ({ page }) => {
    // 질문 입력 및 실행
    const testQuestion = 'AI 포트폴리오 프로젝트의 주요 기술 스택은 무엇인가요?';
    await page.fill('textarea[placeholder*="질문을 입력하세요"]', testQuestion);
    await page.click('button:has-text("RAG 쿼리 실행")');
    
    // 참조 출처가 표시되는지 확인
    const referenceSources = page.locator('[data-testid="reference-sources"]');
    await expect(referenceSources).toBeVisible({ timeout: 10000 });
    
    // 참조 출처 항목들이 표시되는지 확인
    const sourceItems = page.locator('[data-testid="source-item"]');
    await expect(sourceItems).toHaveCountGreaterThan(0);
  });

  test('should handle empty query gracefully', async ({ page }) => {
    // 빈 질문으로 RAG 쿼리 실행
    await page.click('button:has-text("RAG 쿼리 실행")');
    
    // 적절한 오류 메시지가 표시되는지 확인
    const errorMessage = page.locator('text=질문을 입력해주세요');
    await expect(errorMessage).toBeVisible();
  });

  test('should display query parameters correctly', async ({ page }) => {
    // 쿼리 파라미터 설정
    await page.fill('input[placeholder*="최대 소스 수"]', '5');
    await page.fill('input[placeholder*="유사도 임계값"]', '0.3');
    
    // 질문 입력 및 실행
    const testQuestion = 'AI 포트폴리오 프로젝트의 주요 기술 스택은 무엇인가요?';
    await page.fill('textarea[placeholder*="질문을 입력하세요"]', testQuestion);
    await page.click('button:has-text("RAG 쿼리 실행")');
    
    // 응답이 표시되는지 확인
    const responseArea = page.locator('[data-testid="rag-response"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
  });

  test('should show query execution time', async ({ page }) => {
    // 질문 입력 및 실행
    const testQuestion = 'AI 포트폴리오 프로젝트의 주요 기술 스택은 무엇인가요?';
    await page.fill('textarea[placeholder*="질문을 입력하세요"]', testQuestion);
    await page.click('button:has-text("RAG 쿼리 실행")');
    
    // 실행 시간이 표시되는지 확인
    const executionTime = page.locator('[data-testid="execution-time"]');
    await expect(executionTime).toBeVisible({ timeout: 10000 });
    
    // 실행 시간이 숫자로 표시되는지 확인
    const timeText = await executionTime.textContent();
    expect(timeText).toMatch(/\d+\.\d+초/);
  });
});
