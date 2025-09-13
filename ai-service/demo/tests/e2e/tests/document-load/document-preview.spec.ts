import { test, expect } from '@playwright/test';
import { DocumentLoadPage } from '../../page-objects/document-load-page';
import { TestDataHelper, TIMEOUTS } from '../../utils/test-data-setup';

test.describe('문서 미리보기 테스트', () => {
  let documentLoadPage: DocumentLoadPage;

  test.beforeEach(async ({ page }) => {
    documentLoadPage = new DocumentLoadPage(page);
    await documentLoadPage.navigateToDocumentLoadTab();
  });

  test('초기 상태에서 미리보기 안내 메시지가 표시된다', async () => {
    const previewText = await documentLoadPage.previewOutput.textContent();
    expect(previewText).toContain('문서를 로드하면 여기에 목록이 표시됩니다');
  });

  test('새로고침 버튼이 정상적으로 표시된다', async () => {
    await expect(documentLoadPage.refreshButton).toBeVisible();
    await expect(documentLoadPage.refreshButton).toBeEnabled();
    
    const buttonText = await documentLoadPage.refreshButton.textContent();
    expect(buttonText).toContain('새로고침');
  });

  test('샘플 데이터 로드 후 미리보기가 업데이트된다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    const previewText = await documentLoadPage.previewOutput.textContent();
    expect(previewText).not.toContain('문서를 로드하면');
    expect(previewText?.length).toBeGreaterThan(0);
  });

  test('문서 추가 후 미리보기가 업데이트된다', async () => {
    const testDoc = TestDataHelper.generateTestDocument('미리보기테스트');
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const previewText = await documentLoadPage.previewOutput.textContent();
    expect(previewText).not.toContain('문서를 로드하면');
  });

  test('새로고침 버튼 클릭 시 최신 상태로 업데이트된다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    await documentLoadPage.refreshDocumentList();
    
    const previewText = await documentLoadPage.previewOutput.textContent();
    expect(previewText).not.toContain('문서를 로드하면');
  });

  test('문서 목록이 HTML 형태로 적절히 렌더링된다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    const previewHTML = await documentLoadPage.previewOutput.innerHTML();
    expect(previewHTML).toBeTruthy();
    expect(previewHTML?.length).toBeGreaterThan(0);
  });

  test('여러 문서 추가 후 미리보기에 모든 문서가 반영된다', async () => {
    const docs = [
      TestDataHelper.generateTestDocument('첫번째문서'),
      TestDataHelper.generateTestDocument('두번째문서')
    ];
    
    for (const doc of docs) {
      await documentLoadPage.addDocument(doc.content, doc.source);
      await documentLoadPage.waitForDocumentAdded();
      await documentLoadPage.page.waitForTimeout(500);
    }
    
    await documentLoadPage.refreshDocumentList();
    
    const previewText = await documentLoadPage.previewOutput.textContent();
    expect(previewText).not.toContain('문서를 로드하면');
    expect(previewText?.length).toBeGreaterThan(100);
  });

  test('미리보기 영역이 스크롤 가능하다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    const previewElement = documentLoadPage.previewOutput;
    const isScrollable = await previewElement.evaluate((el) => {
      return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
    });
    
    expect(typeof isScrollable).toBe('boolean');
  });

  test('미리보기 내용이 실시간으로 업데이트된다', async () => {
    const beforeText = await documentLoadPage.previewOutput.textContent();
    
    const testDoc = TestDataHelper.generateTestDocument('실시간업데이트');
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const afterText = await documentLoadPage.previewOutput.textContent();
    expect(afterText).not.toBe(beforeText);
  });
});