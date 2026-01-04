import { chromium, type Browser, type Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOT_DIR = path.join(__dirname, '../../docs/epic/portfolio-renewal-refactor/screenshots/before');
const BASE_URL = 'http://localhost:3000';

// 스크린샷 디렉토리 생성
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface ScreenshotConfig {
  name: string;
  url: string;
  viewport?: { width: number; height: number };
  fullPage?: boolean;
  waitForSelector?: string;
  actions?: (page: Page) => Promise<void>;
}

const screenshots: ScreenshotConfig[] = [
  {
    name: 'homepage-full.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    fullPage: true,
    waitForSelector: '[id="portfolio"]',
  },
  {
    name: 'homepage-hero.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: 'section:has-text("이정준")',
  },
  {
    name: 'homepage-projects.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: '[id="project"]',
    actions: async (page) => {
      // 프로젝트 섹션으로 스크롤
      await page.evaluate(() => {
        const element = document.getElementById('project');
        if (element) {
          element.scrollIntoView({ behavior: 'instant' });
        }
      });
      await page.waitForTimeout(500);
    },
  },
  {
    name: 'history-panel-open.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: '[id="portfolio"]',
    actions: async (page) => {
      // 히스토리 패널이 열려있는지 확인
      const historyPanel = page.locator('text=프로젝트 히스토리').first();
      const isOpen = await historyPanel.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!isOpen) {
        // SpeedDialFab 메인 버튼 클릭 (aria-label="메뉴 열기")
        const speedDialMainButton = page.locator('button[aria-label="메뉴 열기"]').first();
        if (await speedDialMainButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          // 하단으로 스크롤하여 버튼이 보이도록
          await speedDialMainButton.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          await speedDialMainButton.click();
          await page.waitForTimeout(500); // SpeedDialFab이 열릴 때까지 대기
          
          // "프로젝트 히스토리" 버튼 클릭
          const historyButton = page.locator('button[aria-label="프로젝트 히스토리"]').first();
          if (await historyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await historyButton.click();
            await page.waitForTimeout(1000); // 패널이 열릴 때까지 대기
          }
        }
      }
      
      // 히스토리 패널이 열렸는지 최종 확인
      await page.waitForSelector('text=프로젝트 히스토리', { timeout: 5000, state: 'visible' }).catch(() => {
        console.warn('히스토리 패널이 열리지 않았습니다.');
      });
      await page.waitForTimeout(500);
    },
  },
  {
    name: 'chatbot-open.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: '[id="portfolio"]',
    actions: async (page) => {
      // 챗봇이 이미 열려있는지 확인
      const isOpen = await page.locator('text=AI 포트폴리오 비서').isVisible().catch(() => false);
      
      if (!isOpen) {
        // 하단 입력창 클릭으로 챗봇 열기 (가장 확실한 방법)
        const inputBar = page.locator('input[placeholder*="프로젝트"], textarea[placeholder*="프로젝트"]').first();
        if (await inputBar.isVisible({ timeout: 5000 }).catch(() => false)) {
          // 입력창이 보이도록 스크롤
          await inputBar.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await inputBar.click({ timeout: 5000 });
          await page.waitForTimeout(1000);
        } else {
          // SpeedDialFab 버튼 찾기
          const speedDialButton = page.locator('button:has-text("AI 챗봇")').first();
          if (await speedDialButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await speedDialButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await speedDialButton.click({ timeout: 5000 });
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // 챗봇이 열릴 때까지 대기
      await page.waitForSelector('text=AI 포트폴리오 비서', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
    },
  },
  {
    name: 'project-detail-full.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    fullPage: true,
    waitForSelector: '[id="portfolio"]',
    actions: async (page) => {
      // 첫 번째 프로젝트 카드 클릭
      const firstProjectCard = page.locator('[id^="project-"]').first();
      if (await firstProjectCard.isVisible().catch(() => false)) {
        await firstProjectCard.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1000);
      }
    },
  },
  {
    name: 'project-detail-sidebar.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: '[id="portfolio"]',
    actions: async (page) => {
      // 첫 번째 프로젝트 카드 클릭
      const firstProjectCard = page.locator('[id^="project-"]').first();
      if (await firstProjectCard.isVisible().catch(() => false)) {
        await firstProjectCard.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1000);
        
        // 사이드바가 열려있는지 확인하고, 없으면 열기
        const sidebar = page.locator('text=목차, text=Table of Contents').first();
        const sidebarToggle = page.locator('button[aria-label*="사이드바"], button:has-text("목차")').first();
        
        if (!(await sidebar.isVisible().catch(() => false))) {
          if (await sidebarToggle.isVisible().catch(() => false)) {
            await sidebarToggle.click();
            await page.waitForTimeout(500);
          }
        }
      }
    },
  },
  {
    name: 'responsive-mobile.png',
    url: '/',
    viewport: { width: 375, height: 667 },
    fullPage: true,
    waitForSelector: '[id="portfolio"]',
  },
  {
    name: 'responsive-tablet.png',
    url: '/',
    viewport: { width: 768, height: 1024 },
    fullPage: true,
    waitForSelector: '[id="portfolio"]',
  },
];

async function takeScreenshot(browser: Browser, config: ScreenshotConfig): Promise<void> {
  const page = await browser.newPage({
    viewport: config.viewport || { width: 1920, height: 1080 },
  });

  try {
    console.log(`📸 촬영 중: ${config.name}...`);
    
    await page.goto(`${BASE_URL}${config.url}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // 선택자 대기
    if (config.waitForSelector) {
      await page.waitForSelector(config.waitForSelector, { timeout: 10000 }).catch(() => {
        console.warn(`⚠️  선택자 "${config.waitForSelector}"를 찾을 수 없습니다. 계속 진행합니다...`);
      });
    }

    // 추가 액션 실행
    if (config.actions) {
      await config.actions(page);
    }

    // 스크린샷 촬영
    const screenshotPath = path.join(SCREENSHOT_DIR, config.name);
    await page.screenshot({
      path: screenshotPath,
      fullPage: config.fullPage ?? false,
    });

    console.log(`✅ 완료: ${config.name}`);
  } catch (error) {
    console.error(`❌ 오류 발생 (${config.name}):`, error);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🚀 스크린샷 촬영 시작...');
  console.log(`📁 저장 위치: ${SCREENSHOT_DIR}`);
  console.log(`🌐 기본 URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    for (const config of screenshots) {
      await takeScreenshot(browser, config);
      // 각 스크린샷 사이에 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✨ 모든 스크린샷 촬영 완료!');
  } catch (error) {
    console.error('❌ 스크린샷 촬영 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
