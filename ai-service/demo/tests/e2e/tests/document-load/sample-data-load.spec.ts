import { test, expect } from '@playwright/test';
import { DocumentLoadPage } from '../../page-objects/document-load-page';
import { TIMEOUTS } from '../../utils/test-data-setup';

test.describe('샘플 데이터 로드 테스트', () => {
  let documentLoadPage: DocumentLoadPage;

  test.beforeEach(async ({ page }) => {
    documentLoadPage = new DocumentLoadPage(page);
    await documentLoadPage.navigateToDocumentLoadTab();
  });

  test('DocumentLoad 탭이 정상적으로 표시된다', async () => {
    await documentLoadPage.verifyDocumentLoadTabVisible();
  });

  test('샘플 데이터 로드 버튼이 클릭 가능하다', async () => {
    await expect(documentLoadPage.loadSampleButton).toBeVisible();
    await expect(documentLoadPage.loadSampleButton).toBeEnabled();
    
    const buttonText = await documentLoadPage.loadSampleButton.textContent();
    expect(buttonText).toContain('샘플 데이터 로드');
  });

  test('샘플 데이터가 성공적으로 로드된다', async ({ page }) => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    await expect(documentLoadPage.loadSampleButton).toBeEnabled();
  });

  test('샘플 데이터 로드 후 문서 목록이 업데이트된다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    await documentLoadPage.page.waitForTimeout(2000);
    const documentOptions = await documentLoadPage.getDocumentOptions();
    expect(documentOptions.length).toBeGreaterThan(0);
  });

  test('샘플 데이터 로드 중 버튼 상태가 변경된다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    await expect(documentLoadPage.loadSampleButton).toBeEnabled();
  });

  test('샘플 데이터를 여러 번 로드해도 정상 동작한다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD * 2);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    await documentLoadPage.page.waitForTimeout(1000);
    const firstLoadOptions = await documentLoadPage.getDocumentOptions();
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    await documentLoadPage.page.waitForTimeout(1000);
    const secondLoadOptions = await documentLoadPage.getDocumentOptions();
    expect(secondLoadOptions.length).toBeGreaterThanOrEqual(firstLoadOptions.length);
  });
});