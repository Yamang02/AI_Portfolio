import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class DocumentLoadPage extends BasePage {
  readonly documentLoadTab: Locator;
  readonly loadSampleButton: Locator;
  readonly sampleStatus: Locator;
  readonly documentInput: Locator;
  readonly sourceInput: Locator;
  readonly addDocumentButton: Locator;
  readonly addOutput: Locator;
  readonly refreshButton: Locator;
  readonly previewOutput: Locator;
  readonly documentSelect: Locator;
  readonly viewContentButton: Locator;
  readonly documentContentOutput: Locator;
  readonly deleteDocButton: Locator;
  readonly clearAllButton: Locator;
  readonly deleteOutput: Locator;

  constructor(page: Page) {
    super(page);
    
    this.documentLoadTab = page.getByRole('tab', { name: '📄 DocumentLoad' });
    this.loadSampleButton = page.getByRole('button', { name: /샘플 데이터 로드/ });
    this.sampleStatus = page.locator('.gr-html').filter({ hasText: /샘플 데이터를 로드하면|성공|로드|완료/ }).first();
    this.documentInput = page.getByLabel('문서 내용');
    this.sourceInput = page.getByLabel('출처');
    this.addDocumentButton = page.getByRole('button', { name: /문서 추가/ });
    this.addOutput = page.locator('.gr-html').filter({ hasText: /문서를 추가하면|추가|성공|완료/ }).first();
    this.refreshButton = page.getByRole('button', { name: /새로고침/ });
    this.previewOutput = page.locator('.gr-html').filter({ hasText: /문서를 로드하면|문서|목록/ }).first();
    this.documentSelect = page.getByLabel('문서 선택');
    this.viewContentButton = page.getByRole('button', { name: /전체 내용 보기/ });
    this.documentContentOutput = page.locator('.gr-html').filter({ hasText: /문서를 선택하고|내용/ }).first();
    this.deleteDocButton = page.getByRole('button', { name: /선택한 문서 삭제/ });
    this.clearAllButton = page.getByRole('button', { name: /모든 문서 삭제/ });
    this.deleteOutput = page.locator('.gr-html').filter({ hasText: /문서를 삭제하면|삭제|성공|완료/ }).first();
  }

  async navigateToDocumentLoadTab() {
    await this.goto();
    await this.waitForPageLoad();
    await this.documentLoadTab.click();
    await this.waitForLoadingToComplete();
  }

  async loadSampleData() {
    await this.loadSampleButton.click();
    await this.waitForLoadingToComplete();
  }

  async addDocument(content: string, source: string = '사용자 입력') {
    await this.documentInput.fill(content);
    await this.sourceInput.fill(source);
    await this.addDocumentButton.click();
    await this.waitForLoadingToComplete();
  }

  async refreshDocumentList() {
    await this.refreshButton.click();
    await this.waitForLoadingToComplete();
  }

  async selectDocument(documentTitle: string) {
    await this.documentSelect.selectOption(documentTitle);
    await this.waitForLoadingToComplete();
  }

  async viewDocumentContent() {
    await this.viewContentButton.click();
    await this.waitForLoadingToComplete();
  }

  async deleteSelectedDocument() {
    await this.deleteDocButton.click();
    await this.waitForLoadingToComplete();
  }

  async clearAllDocuments() {
    await this.clearAllButton.click();
    await this.waitForLoadingToComplete();
  }

  async waitForSampleDataLoaded() {
    await this.page.waitForTimeout(5000);
    await this.waitForLoadingToComplete();
  }

  async waitForDocumentAdded() {
    await this.page.waitForTimeout(2000);
    await this.waitForLoadingToComplete();
  }

  async waitForDocumentDeleted() {
    await this.page.waitForTimeout(2000);
    await this.waitForLoadingToComplete();
  }

  async getDocumentOptions() {
    await this.documentSelect.click();
    const options = await this.documentSelect.locator('option').allTextContents();
    await this.page.keyboard.press('Escape');
    return options.filter(option => option.trim() !== '');
  }

  async verifyDocumentLoadTabVisible() {
    await expect(this.documentLoadTab).toBeVisible();
    await expect(this.page.getByRole('heading', { name: '📄 DocumentLoad' })).toBeVisible();
    await expect(this.page.getByText('문서를 로드하고 준비합니다')).toBeVisible();
  }
}