import { test, expect } from '@playwright/test';
import { DocumentLoadPage } from '../../page-objects/document-load-page';
import { TestDataHelper, TIMEOUTS } from '../../utils/test-data-setup';

test.describe('문서 삭제 테스트', () => {
  let documentLoadPage: DocumentLoadPage;

  test.beforeEach(async ({ page }) => {
    documentLoadPage = new DocumentLoadPage(page);
    await documentLoadPage.navigateToDocumentLoadTab();
  });

  test('문서 삭제 버튼들이 정상적으로 표시된다', async () => {
    await expect(documentLoadPage.deleteDocButton).toBeVisible();
    await expect(documentLoadPage.clearAllButton).toBeVisible();
    
    const deleteText = await documentLoadPage.deleteDocButton.textContent();
    const clearText = await documentLoadPage.clearAllButton.textContent();
    
    expect(deleteText).toContain('선택한 문서 삭제');
    expect(clearText).toContain('모든 문서 삭제');
  });

  test('초기 상태에서 삭제 안내 메시지가 표시된다', async () => {
    const deleteOutputText = await documentLoadPage.deleteOutput.textContent();
    expect(deleteOutputText).toContain('문서를 삭제하면 여기에 결과가 표시됩니다');
  });

  test('선택한 문서를 성공적으로 삭제할 수 있다', async () => {
    const testDoc = TestDataHelper.generateTestDocument('삭제테스트');
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const beforeOptions = await documentLoadPage.getDocumentOptions();
    const targetOption = beforeOptions.find(opt => opt.includes('삭제테스트'));
    
    if (targetOption) {
      await documentLoadPage.selectDocument(targetOption);
      await documentLoadPage.deleteSelectedDocument();
      await documentLoadPage.waitForDocumentDeleted();
      
      const deleteOutputText = await documentLoadPage.deleteOutput.textContent();
      expect(deleteOutputText).not.toContain('문서를 삭제하면');
      
      await documentLoadPage.refreshDocumentList();
      const afterOptions = await documentLoadPage.getDocumentOptions();
      expect(afterOptions.length).toBeLessThan(beforeOptions.length);
    }
  });

  test('문서를 선택하지 않고 삭제 버튼을 클릭하면 적절한 처리가 된다', async () => {
    await documentLoadPage.deleteSelectedDocument();
    await documentLoadPage.page.waitForTimeout(2000);
    
    const deleteOutputText = await documentLoadPage.deleteOutput.textContent();
    expect(deleteOutputText).toBeTruthy();
  });

  test('모든 문서를 성공적으로 삭제할 수 있다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    const beforeOptions = await documentLoadPage.getDocumentOptions();
    expect(beforeOptions.length).toBeGreaterThan(0);
    
    await documentLoadPage.clearAllDocuments();
    await documentLoadPage.waitForDocumentDeleted();
    
    const deleteOutputText = await documentLoadPage.deleteOutput.textContent();
    expect(deleteOutputText).not.toContain('문서를 삭제하면');
    
    await documentLoadPage.refreshDocumentList();
    const afterOptions = await documentLoadPage.getDocumentOptions();
    expect(afterOptions.length).toBe(0);
  });

  test('문서 삭제 후 미리보기가 업데이트된다', async () => {
    const testDoc = TestDataHelper.generateTestDocument('미리보기삭제테스트');
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const beforePreview = await documentLoadPage.previewOutput.textContent();
    
    const options = await documentLoadPage.getDocumentOptions();
    const targetOption = options.find(opt => opt.includes('미리보기삭제테스트'));
    
    if (targetOption) {
      await documentLoadPage.selectDocument(targetOption);
      await documentLoadPage.deleteSelectedDocument();
      await documentLoadPage.waitForDocumentDeleted();
      
      const afterPreview = await documentLoadPage.previewOutput.textContent();
      expect(afterPreview).not.toBe(beforePreview);
    }
  });

  test('여러 문서 중 하나만 삭제하면 나머지는 유지된다', async () => {
    const docs = [
      TestDataHelper.generateTestDocument('보존문서1'),
      TestDataHelper.generateTestDocument('삭제대상문서'),
      TestDataHelper.generateTestDocument('보존문서2')
    ];
    
    for (const doc of docs) {
      await documentLoadPage.addDocument(doc.content, doc.source);
      await documentLoadPage.waitForDocumentAdded();
      await documentLoadPage.page.waitForTimeout(500);
    }
    
    const beforeOptions = await documentLoadPage.getDocumentOptions();
    const targetOption = beforeOptions.find(opt => opt.includes('삭제대상문서'));
    
    if (targetOption) {
      await documentLoadPage.selectDocument(targetOption);
      await documentLoadPage.deleteSelectedDocument();
      await documentLoadPage.waitForDocumentDeleted();
      
      await documentLoadPage.refreshDocumentList();
      const afterOptions = await documentLoadPage.getDocumentOptions();
      
      expect(afterOptions.length).toBe(beforeOptions.length - 1);
      expect(afterOptions.some(opt => opt.includes('보존문서1'))).toBe(true);
      expect(afterOptions.some(opt => opt.includes('보존문서2'))).toBe(true);
      expect(afterOptions.some(opt => opt.includes('삭제대상문서'))).toBe(false);
    }
  });

  test('삭제 후 드롭다운이 초기화된다', async () => {
    const testDoc = TestDataHelper.generateTestDocument('드롭다운초기화테스트');
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const options = await documentLoadPage.getDocumentOptions();
    const targetOption = options.find(opt => opt.includes('드롭다운초기화테스트'));
    
    if (targetOption) {
      await documentLoadPage.selectDocument(targetOption);
      await documentLoadPage.deleteSelectedDocument();
      await documentLoadPage.waitForDocumentDeleted();
      
      const selectedValue = await documentLoadPage.documentSelect.inputValue();
      expect(selectedValue).toBe('');
    }
  });

  test('삭제 작업이 완료된 후 버튼이 다시 활성화된다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    await documentLoadPage.clearAllDocuments();
    await documentLoadPage.waitForDocumentDeleted();
    
    await expect(documentLoadPage.clearAllButton).toBeEnabled();
    await expect(documentLoadPage.deleteDocButton).toBeEnabled();
  });

  test('삭제 확인 없이 즉시 삭제된다', async () => {
    const testDoc = TestDataHelper.generateTestDocument('즉시삭제테스트');
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const options = await documentLoadPage.getDocumentOptions();
    const targetOption = options.find(opt => opt.includes('즉시삭제테스트'));
    
    if (targetOption) {
      await documentLoadPage.selectDocument(targetOption);
      
      const beforeCount = options.length;
      
      await documentLoadPage.deleteSelectedDocument();
      await documentLoadPage.waitForDocumentDeleted();
      
      await documentLoadPage.refreshDocumentList();
      const afterOptions = await documentLoadPage.getDocumentOptions();
      
      expect(afterOptions.length).toBe(beforeCount - 1);
    }
  });
});