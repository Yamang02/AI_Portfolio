import { test, expect } from '@playwright/test';

test.describe('AI Service Demo - Document Management', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 메인 페이지로 이동
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load sample data successfully', async ({ page }) => {
    // 샘플 데이터 로드 버튼 클릭
    await page.click('button:has-text("샘플 데이터 로드")');
    
    // 성공 메시지 확인
    await expect(page.locator('text=샘플 데이터가 성공적으로 로드되었습니다')).toBeVisible();
    
    // 문서 목록에 샘플 문서들이 표시되는지 확인
    await expect(page.locator('text=ai-portfolio.md')).toBeVisible();
    await expect(page.locator('text=qa_ai-services.md')).toBeVisible();
  });

  test('should add new document', async ({ page }) => {
    // 새 문서 추가
    const documentContent = 'This is a test document for E2E testing.';
    const documentSource = 'E2E Test Source';
    
    await page.fill('textarea[placeholder*="문서 내용"]', documentContent);
    await page.fill('input[placeholder*="문서 출처"]', documentSource);
    await page.click('button:has-text("문서 추가")');
    
    // 성공 메시지 확인
    await expect(page.locator('text=문서가 성공적으로 추가되었습니다')).toBeVisible();
    
    // 추가된 문서가 목록에 표시되는지 확인
    await expect(page.locator('text=E2E Test Source')).toBeVisible();
  });

  test('should display document list correctly', async ({ page }) => {
    // 샘플 데이터 로드
    await page.click('button:has-text("샘플 데이터 로드")');
    await page.waitForTimeout(1000);
    
    // 문서 목록이 표시되는지 확인
    const documentList = page.locator('[data-testid="document-list"]');
    await expect(documentList).toBeVisible();
    
    // 문서 항목들이 표시되는지 확인
    const documentItems = page.locator('[data-testid="document-item"]');
    await expect(documentItems).toHaveCountGreaterThan(0);
  });

  test('should handle document deletion', async ({ page }) => {
    // 샘플 데이터 로드
    await page.click('button:has-text("샘플 데이터 로드")');
    await page.waitForTimeout(1000);
    
    // 첫 번째 문서 삭제 버튼 클릭
    const deleteButton = page.locator('[data-testid="delete-document"]').first();
    await deleteButton.click();
    
    // 확인 대화상자에서 확인 클릭
    await page.click('button:has-text("확인")');
    
    // 성공 메시지 확인
    await expect(page.locator('text=문서가 성공적으로 삭제되었습니다')).toBeVisible();
  });

  test('should show document details on selection', async ({ page }) => {
    // 샘플 데이터 로드
    await page.click('button:has-text("샘플 데이터 로드")');
    await page.waitForTimeout(1000);
    
    // 첫 번째 문서 선택
    const firstDocument = page.locator('[data-testid="document-item"]').first();
    await firstDocument.click();
    
    // 문서 상세 정보가 표시되는지 확인
    const documentDetails = page.locator('[data-testid="document-details"]');
    await expect(documentDetails).toBeVisible();
    
    // 문서 내용이 표시되는지 확인
    const documentContent = page.locator('[data-testid="document-content"]');
    await expect(documentContent).toBeVisible();
  });
});
