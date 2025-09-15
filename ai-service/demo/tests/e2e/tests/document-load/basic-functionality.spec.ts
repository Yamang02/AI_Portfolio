import { test, expect } from '@playwright/test';

test.describe('DocumentLoad 기본 기능 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const documentLoadTab = page.getByRole('tab', { name: /DocumentLoad/ });
    await documentLoadTab.click();
    await page.waitForTimeout(2000);
  });

  test('DocumentLoad 탭이 활성화된다', async ({ page }) => {
    const documentLoadTab = page.getByRole('tab', { name: /DocumentLoad/ });
    await expect(documentLoadTab).toBeVisible();
    
    const heading = page.getByRole('heading', { name: /DocumentLoad/ });
    await expect(heading).toBeVisible();
  });

  test('샘플 데이터 로드 버튼을 클릭할 수 있다', async ({ page }) => {
    const loadButton = page.getByRole('button', { name: /샘플 데이터 로드/ });
    await expect(loadButton).toBeVisible();
    await expect(loadButton).toBeEnabled();
    
    await loadButton.click();
    await page.waitForTimeout(10000);
    
    await expect(loadButton).toBeEnabled();
  });

  test('문서 추가 폼이 표시된다', async ({ page }) => {
    const documentInput = page.getByLabel('문서 내용');
    const sourceInput = page.getByLabel('출처');
    const addButton = page.getByRole('button', { name: /문서 추가/ });
    
    await expect(documentInput).toBeVisible();
    await expect(sourceInput).toBeVisible();
    await expect(addButton).toBeVisible();
  });

  test('새로고침 버튼이 동작한다', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /새로고침/ });
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();
    
    await refreshButton.click();
    await page.waitForTimeout(2000);
    
    await expect(refreshButton).toBeEnabled();
  });

  test('문서 관리 버튼들이 표시된다', async ({ page }) => {
    const deleteButton = page.getByRole('button', { name: /선택한 문서 삭제/ });
    const clearAllButton = page.getByRole('button', { name: /모든 문서 삭제/ });
    
    await expect(deleteButton).toBeVisible();
    await expect(clearAllButton).toBeVisible();
  });

  test('문서 선택 드롭다운이 표시된다', async ({ page }) => {
    const documentSelect = page.getByLabel('문서 선택');
    const viewContentButton = page.getByRole('button', { name: /전체 내용 보기/ });
    
    await expect(documentSelect).toBeVisible();
    await expect(viewContentButton).toBeVisible();
  });
});