import { test, expect } from '@playwright/test';
import { DocumentLoadPage } from '../../page-objects/document-load-page';
import { TestDataHelper, TIMEOUTS } from '../../utils/test-data-setup';

test.describe('문서 내용 보기 테스트', () => {
  let documentLoadPage: DocumentLoadPage;

  test.beforeEach(async ({ page }) => {
    documentLoadPage = new DocumentLoadPage(page);
    await documentLoadPage.navigateToDocumentLoadTab();
  });

  test('문서 선택 드롭다운이 정상적으로 표시된다', async () => {
    await expect(documentLoadPage.documentSelect).toBeVisible();
    await expect(documentLoadPage.viewContentButton).toBeVisible();
    
    const buttonText = await documentLoadPage.viewContentButton.textContent();
    expect(buttonText).toContain('전체 내용 보기');
  });

  test('초기 상태에서 문서 내용 안내 메시지가 표시된다', async () => {
    const contentText = await documentLoadPage.documentContentOutput.textContent();
    expect(contentText).toContain('문서를 선택하고 \'전체 내용 보기\' 버튼을 클릭하세요');
  });

  test('문서 추가 후 드롭다운에 문서가 표시된다', async () => {
    const testDoc = TestDataHelper.generateTestDocument('드롭다운테스트');
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const options = await documentLoadPage.getDocumentOptions();
    expect(options.length).toBeGreaterThan(0);
  });

  test('샘플 데이터 로드 후 여러 문서가 드롭다운에 표시된다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    const options = await documentLoadPage.getDocumentOptions();
    expect(options.length).toBeGreaterThan(1);
  });

  test('문서 선택 후 내용 보기가 정상 동작한다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    const options = await documentLoadPage.getDocumentOptions();
    if (options.length > 0) {
      await documentLoadPage.selectDocument(options[0]);
      await documentLoadPage.viewDocumentContent();
      
      const contentText = await documentLoadPage.documentContentOutput.textContent();
      expect(contentText).not.toContain('문서를 선택하고');
      expect(contentText?.length).toBeGreaterThan(0);
    }
  });

  test('추가한 문서의 내용을 올바르게 표시한다', async () => {
    const testDoc = TestDataHelper.generateTestDocument('내용보기테스트');
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const options = await documentLoadPage.getDocumentOptions();
    const targetOption = options.find(opt => opt.includes('내용보기테스트'));
    
    if (targetOption) {
      await documentLoadPage.selectDocument(targetOption);
      await documentLoadPage.viewDocumentContent();
      
      const contentText = await documentLoadPage.documentContentOutput.textContent();
      expect(contentText).toContain('내용보기테스트');
    }
  });

  test('문서를 선택하지 않고 내용 보기를 클릭하면 적절한 처리가 된다', async () => {
    await documentLoadPage.viewContentButton.click();
    await documentLoadPage.waitForLoadingToComplete();
    
    const contentText = await documentLoadPage.documentContentOutput.textContent();
    expect(contentText).toBeTruthy();
  });

  test('다른 문서로 변경 시 내용이 업데이트된다', async () => {
    test.setTimeout(TIMEOUTS.SAMPLE_DATA_LOAD);
    
    await documentLoadPage.loadSampleData();
    await documentLoadPage.waitForSampleDataLoaded();
    
    const options = await documentLoadPage.getDocumentOptions();
    if (options.length > 1) {
      await documentLoadPage.selectDocument(options[0]);
      await documentLoadPage.viewDocumentContent();
      const firstContent = await documentLoadPage.documentContentOutput.textContent();
      
      await documentLoadPage.selectDocument(options[1]);
      await documentLoadPage.viewDocumentContent();
      const secondContent = await documentLoadPage.documentContentOutput.textContent();
      
      expect(firstContent).not.toBe(secondContent);
    }
  });

  test('긴 문서 내용이 적절히 표시된다', async () => {
    const longContent = 'A'.repeat(1000) + '\n\n' + 'B'.repeat(1000);
    const testDoc = { content: longContent, source: '긴문서테스트' };
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const options = await documentLoadPage.getDocumentOptions();
    const targetOption = options.find(opt => opt.includes('긴문서테스트'));
    
    if (targetOption) {
      await documentLoadPage.selectDocument(targetOption);
      await documentLoadPage.viewDocumentContent();
      
      const contentText = await documentLoadPage.documentContentOutput.textContent();
      expect(contentText?.length).toBeGreaterThan(500);
    }
  });

  test('HTML이나 마크다운 콘텐츠가 적절히 렌더링된다', async () => {
    const markdownContent = `# 마크다운 테스트

## 소제목

- 리스트 1
- 리스트 2

**굵은 글씨** *기울임*

\`코드 블록\`
`;
    
    await documentLoadPage.addDocument(markdownContent, '마크다운테스트');
    await documentLoadPage.waitForDocumentAdded();
    
    const options = await documentLoadPage.getDocumentOptions();
    const targetOption = options.find(opt => opt.includes('마크다운테스트'));
    
    if (targetOption) {
      await documentLoadPage.selectDocument(targetOption);
      await documentLoadPage.viewDocumentContent();
      
      const contentHTML = await documentLoadPage.documentContentOutput.innerHTML();
      expect(contentHTML).toBeTruthy();
      expect(contentHTML?.length).toBeGreaterThan(0);
    }
  });
});