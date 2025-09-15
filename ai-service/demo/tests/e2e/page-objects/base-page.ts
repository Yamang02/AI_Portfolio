import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `reports/screenshots/${name}.png` });
  }

  async waitForElement(selector: string, timeout: number = 30000): Promise<Locator> {
    return this.page.waitForSelector(selector, { timeout });
  }

  async clickButton(buttonText: string) {
    const button = this.page.getByRole('button', { name: buttonText });
    await button.waitFor({ state: 'visible' });
    await button.click();
  }

  async fillTextbox(label: string, text: string) {
    const textbox = this.page.getByLabel(label);
    await textbox.waitFor({ state: 'visible' });
    await textbox.fill(text);
  }

  async selectFromDropdown(label: string, value: string) {
    const dropdown = this.page.getByLabel(label);
    await dropdown.waitFor({ state: 'visible' });
    await dropdown.selectOption(value);
  }

  async waitForLoadingToComplete() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }
}