import { test, expect } from '@playwright/test';
import { DocumentLoadPage } from '../../page-objects/document-load-page';
import { TEST_DOCUMENTS, TestDataHelper, TIMEOUTS } from '../../utils/test-data-setup';

test.describe('문서 추가 테스트', () => {
  let documentLoadPage: DocumentLoadPage;

  test.beforeEach(async ({ page }) => {
    documentLoadPage = new DocumentLoadPage(page);
    await documentLoadPage.navigateToDocumentLoadTab();
  });

  test('문서 추가 폼이 정상적으로 표시된다', async () => {
    await expect(documentLoadPage.documentInput).toBeVisible();
    await expect(documentLoadPage.sourceInput).toBeVisible();
    await expect(documentLoadPage.addDocumentButton).toBeVisible();
    
    const placeholderText = await documentLoadPage.documentInput.getAttribute('placeholder');
    expect(placeholderText).toContain('여기에 문서 내용을 입력하세요');
  });

  test('새 문서를 성공적으로 추가할 수 있다', async () => {
    const testDoc = TEST_DOCUMENTS.SAMPLE_DOCUMENT;
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const addOutputText = await documentLoadPage.addOutput.textContent();
    expect(addOutputText).not.toContain('문서를 추가하면');
  });

  test('문서 추가 후 목록이 업데이트된다', async () => {
    const testDoc = TestDataHelper.generateTestDocument('문서추가테스트');
    
    const beforeOptions = await documentLoadPage.getDocumentOptions();
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    await documentLoadPage.refreshDocumentList();
    const afterOptions = await documentLoadPage.getDocumentOptions();
    
    expect(afterOptions.length).toBeGreaterThan(beforeOptions.length);
  });

  test('빈 내용으로는 문서를 추가할 수 없다', async () => {
    await documentLoadPage.addDocument('', '테스트 소스');
    
    await documentLoadPage.page.waitForTimeout(2000);
    
    const outputText = await documentLoadPage.addOutput.textContent();
    expect(outputText).toContain('문서를 추가하면');
  });

  test('긴 문서도 성공적으로 추가할 수 있다', async () => {
    const longContent = TEST_DOCUMENTS.ARCHITECTURE_DOCUMENT.content + '\n\n' + 
                       '추가 내용: '.repeat(100) + '긴 문서 테스트';
    
    await documentLoadPage.addDocument(longContent, '긴 문서 테스트');
    await documentLoadPage.waitForDocumentAdded();
    
    const addOutputText = await documentLoadPage.addOutput.textContent();
    expect(addOutputText).not.toContain('문서를 추가하면');
  });

  test('특수 문자가 포함된 문서를 추가할 수 있다', async () => {
    const specialCharContent = `특수 문자 테스트 문서

# 마크다운 헤더
- 리스트 아이템
- 한글, English, 日本語, 中文
- 특수문자: !@#$%^&*(){}[]|\\:";'<>?,./

\`\`\`python
def test_function():
    return "코드 블록 테스트"
\`\`\`

**굵은 글씨** *기울임* \`인라인 코드\`
`;
    
    await documentLoadPage.addDocument(specialCharContent, '특수문자 테스트');
    await documentLoadPage.waitForDocumentAdded();
    
    const addOutputText = await documentLoadPage.addOutput.textContent();
    expect(addOutputText).not.toContain('문서를 추가하면');
  });

  test('여러 문서를 연속으로 추가할 수 있다', async () => {
    test.setTimeout(TIMEOUTS.DOCUMENT_OPERATION * 3);
    
    const docs = [
      TestDataHelper.generateTestDocument('첫번째'),
      TestDataHelper.generateTestDocument('두번째'),
      TestDataHelper.generateTestDocument('세번째')
    ];
    
    const initialOptions = await documentLoadPage.getDocumentOptions();
    
    for (const doc of docs) {
      await documentLoadPage.addDocument(doc.content, doc.source);
      await documentLoadPage.waitForDocumentAdded();
      await documentLoadPage.page.waitForTimeout(1000);
    }
    
    await documentLoadPage.refreshDocumentList();
    const finalOptions = await documentLoadPage.getDocumentOptions();
    
    expect(finalOptions.length).toBeGreaterThanOrEqual(initialOptions.length + 3);
  });

  test('문서 입력 필드가 추가 후 초기화되지 않는다', async () => {
    const testDoc = TEST_DOCUMENTS.SHORT_DOCUMENT;
    
    await documentLoadPage.addDocument(testDoc.content, testDoc.source);
    await documentLoadPage.waitForDocumentAdded();
    
    const contentValue = await documentLoadPage.documentInput.inputValue();
    const sourceValue = await documentLoadPage.sourceInput.inputValue();
    
    expect(contentValue).toBe(testDoc.content);
    expect(sourceValue).toBe(testDoc.source);
  });
});