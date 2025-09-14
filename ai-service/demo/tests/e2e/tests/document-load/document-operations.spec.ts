import { test, expect } from '@playwright/test';

test.describe('DocumentLoad 문서 작업 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const documentLoadTab = page.getByRole('tab', { name: /DocumentLoad/ });
    await documentLoadTab.click();
    await page.waitForTimeout(2000);
  });

  test('문서를 추가할 수 있다', async ({ page }) => {
    const documentInput = page.getByLabel('문서 내용');
    const sourceInput = page.getByLabel('출처');
    const addButton = page.getByRole('button', { name: /문서 추가/ });
    
    const testContent = '테스트 문서 내용입니다.\n이것은 E2E 테스트에서 생성한 문서입니다.';
    const testSource = 'E2E 테스트';
    
    await documentInput.fill(testContent);
    await sourceInput.fill(testSource);
    await addButton.click();
    
    await page.waitForTimeout(5000);
    
    // 성공 메시지 확인
    const successMessage = page.locator('text=문서가 성공적으로 추가되었습니다');
    await expect(successMessage).toBeVisible();
    
    // 입력 필드가 초기화되었는지 확인
    expect(await documentInput.inputValue()).toBe('');
    expect(await sourceInput.inputValue()).toBe('');
  });

  test('샘플 데이터를 로드할 수 있다', async ({ page }) => {
    const loadButton = page.getByRole('button', { name: /샘플 데이터 로드/ });
    
    await loadButton.click();
    await page.waitForTimeout(15000);
    
    // 성공 메시지 확인
    const successMessage = page.locator('text=샘플 문서 로드 완료');
    await expect(successMessage).toBeVisible();
    
    await expect(loadButton).toBeEnabled();
    
    const documentSelect = page.getByLabel('문서 선택');
    await documentSelect.click();
    await page.waitForTimeout(2000);
    
    const options = await page.locator('[role="option"]').allTextContents();
    const validOptions = options.filter(option => option.trim() !== '');
    expect(validOptions.length).toBeGreaterThan(0);
    
    await page.keyboard.press('Escape');
  });

  test('문서 내용을 볼 수 있다', async ({ page }) => {
    const loadButton = page.getByRole('button', { name: /샘플 데이터 로드/ });
    await loadButton.click();
    await page.waitForTimeout(15000);
    
    const documentSelect = page.getByLabel('문서 선택');
    await documentSelect.click();
    await page.waitForTimeout(2000);
    
    const options = await page.locator('[role="option"]').allTextContents();
    const validOptions = options.filter(option => option.trim() !== '');
    
    if (validOptions.length > 0) {
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(1000);
      
      const viewButton = page.getByRole('button', { name: /전체 내용 보기/ });
      await viewButton.click();
      await page.waitForTimeout(3000);
      
      // 성공 메시지 확인
      const successMessage = page.locator('text=문서 내용을 성공적으로 조회했습니다');
      await expect(successMessage).toBeVisible();
      
      await expect(viewButton).toBeEnabled();
    }
  });

  test('개별 문서를 삭제할 수 있다', async ({ page }) => {
    const loadButton = page.getByRole('button', { name: /샘플 데이터 로드/ });
    await loadButton.click();
    await page.waitForTimeout(15000);
    
    const documentSelect = page.getByLabel('문서 선택');
    await documentSelect.click();
    await page.waitForTimeout(2000);
    
    const options = await page.locator('[role="option"]').allTextContents();
    const validOptions = options.filter(option => option.trim() !== '');
    
    if (validOptions.length > 0) {
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(1000);
      
      const deleteButton = page.getByRole('button', { name: /개별 문서 삭제/ });
      await deleteButton.click();
      await page.waitForTimeout(5000);
      
      // 성공 메시지 확인
      const successMessage = page.locator('text=문서가 성공적으로 삭제되었습니다');
      await expect(successMessage).toBeVisible();
      
      await expect(deleteButton).toBeEnabled();
    }
  });

  test('모든 문서를 삭제할 수 있다', async ({ page }) => {
    const loadButton = page.getByRole('button', { name: /샘플 데이터 로드/ });
    await loadButton.click();
    await page.waitForTimeout(15000);
    
    const clearAllButton = page.getByRole('button', { name: /모든 문서 삭제/ });
    await clearAllButton.click();
    await page.waitForTimeout(5000);
    
    // 성공 메시지 확인
    const successMessage = page.locator('text=모든 문서가 성공적으로 삭제되었습니다');
    await expect(successMessage).toBeVisible();
    
    await expect(clearAllButton).toBeEnabled();
  });

  test('문서 목록을 새로고침할 수 있다', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /새로고침/ });
    
    await refreshButton.click();
    await page.waitForTimeout(3000);
    
    await expect(refreshButton).toBeEnabled();
    
    const documentSelect = page.getByLabel('문서 선택');
    await expect(documentSelect).toBeVisible();
  });

  test('여러 문서를 연속으로 추가할 수 있다', async ({ page }) => {
    const documentInput = page.getByLabel('문서 내용');
    const sourceInput = page.getByLabel('출처');
    const addButton = page.getByRole('button', { name: /문서 추가/ });
    
    const testDocs = [
      { content: '첫 번째 테스트 문서', source: '테스트 1' },
      { content: '두 번째 테스트 문서', source: '테스트 2' },
      { content: '세 번째 테스트 문서', source: '테스트 3' }
    ];
    
    for (const doc of testDocs) {
      await documentInput.fill(doc.content);
      await sourceInput.fill(doc.source);
      await addButton.click();
      await page.waitForTimeout(3000);
      
      // 각 문서 추가 후 성공 메시지 확인
      const successMessage = page.locator('text=문서가 성공적으로 추가되었습니다');
      await expect(successMessage).toBeVisible();
    }
    
    await expect(addButton).toBeEnabled();
  });

  test('빈 내용으로 문서 추가 시 오류 메시지 표시', async ({ page }) => {
    const documentInput = page.getByLabel('문서 내용');
    const sourceInput = page.getByLabel('출처');
    const addButton = page.getByRole('button', { name: /문서 추가/ });
    
    // 빈 내용으로 시도
    await documentInput.fill('');
    await sourceInput.fill('테스트 출처');
    await addButton.click();
    await page.waitForTimeout(3000);
    
    // 오류 메시지 확인
    const errorMessage = page.locator('text=문서 내용이 비어있습니다');
    await expect(errorMessage).toBeVisible();
  });

  test('빈 출처로 문서 추가 시 오류 메시지 표시', async ({ page }) => {
    const documentInput = page.getByLabel('문서 내용');
    const sourceInput = page.getByLabel('출처');
    const addButton = page.getByRole('button', { name: /문서 추가/ });
    
    // 빈 출처로 시도
    await documentInput.fill('테스트 내용');
    await sourceInput.fill('');
    await addButton.click();
    await page.waitForTimeout(3000);
    
    // 오류 메시지 확인
    const errorMessage = page.locator('text=출처가 비어있습니다');
    await expect(errorMessage).toBeVisible();
  });
});