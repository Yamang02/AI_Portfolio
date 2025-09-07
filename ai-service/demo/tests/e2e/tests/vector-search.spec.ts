import { test, expect } from '@playwright/test';

test.describe('AI Service Demo - Vector Search', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 메인 페이지로 이동하고 샘플 데이터 로드
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 샘플 데이터 로드
    await page.click('button:has-text("샘플 데이터 로드")');
    await page.waitForTimeout(2000);
    
    // Vector Search 탭으로 이동
    await page.click('text=🔍 Vector Search');
  });

  test('should execute vector search successfully', async ({ page }) => {
    // 검색 쿼리 입력
    const searchQuery = 'AI 포트폴리오 RAG 챗봇';
    await page.fill('textarea[placeholder*="검색 쿼리를 입력하세요"]', searchQuery);
    
    // 벡터 검색 실행 버튼 클릭
    await page.click('button:has-text("벡터 검색 실행")');
    
    // 검색 결과가 표시되는지 확인
    const searchResults = page.locator('[data-testid="vector-search-results"]');
    await expect(searchResults).toBeVisible({ timeout: 10000 });
    
    // 검색 결과 항목들이 표시되는지 확인
    const resultItems = page.locator('[data-testid="search-result-item"]');
    await expect(resultItems).toHaveCountGreaterThan(0);
  });

  test('should display similarity scores', async ({ page }) => {
    // 검색 쿼리 입력 및 실행
    const searchQuery = 'AI 포트폴리오 RAG 챗봇';
    await page.fill('textarea[placeholder*="검색 쿼리를 입력하세요"]', searchQuery);
    await page.click('button:has-text("벡터 검색 실행")');
    
    // 유사도 점수가 표시되는지 확인
    const similarityScores = page.locator('[data-testid="similarity-score"]');
    await expect(similarityScores).toHaveCountGreaterThan(0);
    
    // 유사도 점수가 숫자로 표시되는지 확인
    const firstScore = similarityScores.first();
    const scoreText = await firstScore.textContent();
    expect(scoreText).toMatch(/\d+\.\d+/);
  });

  test('should show chunk content preview', async ({ page }) => {
    // 검색 쿼리 입력 및 실행
    const searchQuery = 'AI 포트폴리오 RAG 챗봇';
    await page.fill('textarea[placeholder*="검색 쿼리를 입력하세요"]', searchQuery);
    await page.click('button:has-text("벡터 검색 실행")');
    
    // 청크 내용 미리보기가 표시되는지 확인
    const chunkPreviews = page.locator('[data-testid="chunk-preview"]');
    await expect(chunkPreviews).toHaveCountGreaterThan(0);
    
    // 청크 내용이 비어있지 않은지 확인
    const firstPreview = chunkPreviews.first();
    const previewText = await firstPreview.textContent();
    expect(previewText).toBeTruthy();
    expect(previewText.length).toBeGreaterThan(0);
  });

  test('should handle search parameters correctly', async ({ page }) => {
    // 검색 파라미터 설정
    await page.fill('input[placeholder*="상위 K개"]', '3');
    await page.fill('input[placeholder*="유사도 임계값"]', '0.4');
    
    // 검색 쿼리 입력 및 실행
    const searchQuery = 'AI 포트폴리오 RAG 챗봇';
    await page.fill('textarea[placeholder*="검색 쿼리를 입력하세요"]', searchQuery);
    await page.click('button:has-text("벡터 검색 실행")');
    
    // 검색 결과가 표시되는지 확인
    const searchResults = page.locator('[data-testid="vector-search-results"]');
    await expect(searchResults).toBeVisible({ timeout: 10000 });
    
    // 결과 개수가 설정된 K값 이하인지 확인
    const resultItems = page.locator('[data-testid="search-result-item"]');
    const resultCount = await resultItems.count();
    expect(resultCount).toBeLessThanOrEqual(3);
  });

  test('should handle empty search query gracefully', async ({ page }) => {
    // 빈 검색 쿼리로 벡터 검색 실행
    await page.click('button:has-text("벡터 검색 실행")');
    
    // 적절한 오류 메시지가 표시되는지 확인
    const errorMessage = page.locator('text=검색 쿼리를 입력해주세요');
    await expect(errorMessage).toBeVisible();
  });

  test('should show search execution time', async ({ page }) => {
    // 검색 쿼리 입력 및 실행
    const searchQuery = 'AI 포트폴리오 RAG 챗봇';
    await page.fill('textarea[placeholder*="검색 쿼리를 입력하세요"]', searchQuery);
    await page.click('button:has-text("벡터 검색 실행")');
    
    // 실행 시간이 표시되는지 확인
    const executionTime = page.locator('[data-testid="search-execution-time"]');
    await expect(executionTime).toBeVisible({ timeout: 10000 });
    
    // 실행 시간이 숫자로 표시되는지 확인
    const timeText = await executionTime.textContent();
    expect(timeText).toMatch(/\d+\.\d+초/);
  });

  test('should display document source information', async ({ page }) => {
    // 검색 쿼리 입력 및 실행
    const searchQuery = 'AI 포트폴리오 RAG 챗봇';
    await page.fill('textarea[placeholder*="검색 쿼리를 입력하세요"]', searchQuery);
    await page.click('button:has-text("벡터 검색 실행")');
    
    // 문서 출처 정보가 표시되는지 확인
    const documentSources = page.locator('[data-testid="document-source"]');
    await expect(documentSources).toHaveCountGreaterThan(0);
    
    // 문서 출처가 비어있지 않은지 확인
    const firstSource = documentSources.first();
    const sourceText = await firstSource.textContent();
    expect(sourceText).toBeTruthy();
    expect(sourceText.length).toBeGreaterThan(0);
  });

  test('should sort results by similarity score', async ({ page }) => {
    // 검색 쿼리 입력 및 실행
    const searchQuery = 'AI 포트폴리오 RAG 챗봇';
    await page.fill('textarea[placeholder*="검색 쿼리를 입력하세요"]', searchQuery);
    await page.click('button:has-text("벡터 검색 실행")');
    
    // 검색 결과가 표시되는지 확인
    const searchResults = page.locator('[data-testid="vector-search-results"]');
    await expect(searchResults).toBeVisible({ timeout: 10000 });
    
    // 유사도 점수들이 내림차순으로 정렬되어 있는지 확인
    const similarityScores = page.locator('[data-testid="similarity-score"]');
    const scoreCount = await similarityScores.count();
    
    if (scoreCount > 1) {
      const firstScore = parseFloat(await similarityScores.nth(0).textContent() || '0');
      const secondScore = parseFloat(await similarityScores.nth(1).textContent() || '0');
      expect(firstScore).toBeGreaterThanOrEqual(secondScore);
    }
  });
});
