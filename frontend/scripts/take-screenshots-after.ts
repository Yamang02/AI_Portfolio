import { chromium, type Browser, type Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOT_DIR = path.join(__dirname, '../../docs/epic/portfolio-renewal-refactor/screenshots/after');
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
  // ===== Profile Page (진입 `/`는 `/profile`로 리다이렉트) =====
  {
    name: 'profile-full.png',
    url: '/profile',
    viewport: { width: 1920, height: 1080 },
    fullPage: true,
    waitForSelector: 'h1:has-text("이정준 Profile")',
  },
  {
    name: 'profile-intro.png',
    url: '/profile',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: 'h1:has-text("이정준 Profile")',
  },
  {
    name: 'profile-timeline.png',
    url: '/profile',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: 'h1:has-text("이정준 Profile")',
    actions: async (page) => {
      await page.evaluate(() => {
        const timeline = document.querySelector('[class*="timeline"]');
        if (timeline) {
          timeline.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      });
      await page.waitForTimeout(500);
    },
  },

  // ===== Archive Page (Projects List) =====
  {
    name: 'archive-full.png',
    url: '/projects',
    viewport: { width: 1920, height: 1080 },
    fullPage: true,
    waitForSelector: 'h1:has-text("Projects")',
  },
  {
    name: 'archive-featured.png',
    url: '/projects',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: '#featured-section',
    actions: async (page) => {
      await page.evaluate(() => {
        const element = document.getElementById('featured-section');
        if (element) {
          element.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      });
      await page.waitForTimeout(500);
    },
  },
  {
    name: 'archive-timeline.png',
    url: '/projects',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: 'h1:has-text("Projects")',
    actions: async (page) => {
      // 타임라인 섹션 찾기
      await page.evaluate(() => {
        const timeline = document.querySelector('[class*="history"]');
        if (timeline) {
          timeline.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      });
      await page.waitForTimeout(500);
    },
  },
  {
    name: 'archive-build-section.png',
    url: '/projects',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: '#type-section-BUILD',
    actions: async (page) => {
      await page.evaluate(() => {
        const element = document.getElementById('type-section-BUILD');
        if (element) {
          element.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      });
      await page.waitForTimeout(500);
    },
  },

  // ===== Project Detail Page =====
  {
    name: 'project-detail-full.png',
    url: '/projects/prj-001',
    viewport: { width: 1920, height: 1080 },
    fullPage: true,
    waitForSelector: 'h1, h2',
  },
  {
    name: 'project-detail-header.png',
    url: '/projects/prj-001',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: 'h1, h2',
  },
  {
    name: 'project-detail-content.png',
    url: '/projects/prj-001',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
    waitForSelector: 'h1, h2',
    actions: async (page) => {
      await page.evaluate(() => {
        window.scrollTo({ top: 400, behavior: 'instant' });
      });
      await page.waitForTimeout(500);
    },
  },

  // ===== Chat Page =====
  {
    name: 'chat-full.png',
    url: '/chat',
    viewport: { width: 1920, height: 1080 },
    fullPage: true,
    waitForSelector: 'textarea, input[type="text"]',
  },

  // ===== Responsive Views =====
  {
    name: 'responsive-mobile-landing.png',
    url: '/',
    viewport: { width: 375, height: 667 },
    fullPage: true,
    waitForSelector: '#hero',
  },
  {
    name: 'responsive-mobile-archive.png',
    url: '/projects',
    viewport: { width: 375, height: 667 },
    fullPage: true,
    waitForSelector: 'h1:has-text("Projects")',
  },
  {
    name: 'responsive-tablet-landing.png',
    url: '/',
    viewport: { width: 768, height: 1024 },
    fullPage: true,
    waitForSelector: '#hero',
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
  console.log('🚀 리뉴얼 후 스크린샷 촬영 시작...');
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
