import { test, expect } from '@playwright/test';

test.describe('드롭다운 디버깅', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const documentLoadTab = page.getByRole('tab', { name: /DocumentLoad/ });
    await documentLoadTab.click();
    await page.waitForTimeout(2000);
  });

  test('샘플 데이터 로드 후 드롭다운 구조 분석', async ({ page }) => {
    // 샘플 데이터 로드
    const loadButton = page.getByRole('button', { name: /샘플 데이터 로드/ });
    await loadButton.click();
    await page.waitForTimeout(15000);
    
    console.log('=== 드롭다운 요소 찾기 시작 ===');
    
    // 1. 라벨로 찾기
    const documentSelect1 = page.getByLabel('문서 선택');
    const exists1 = await documentSelect1.count();
    console.log(`getByLabel('문서 선택'): ${exists1}개`);
    
    // 2. 모든 select 요소 찾기
    const allSelects = page.locator('select');
    const selectCount = await allSelects.count();
    console.log(`모든 select 요소: ${selectCount}개`);
    
    // 3. 드롭다운 클릭해보기
    if (exists1 > 0) {
      await documentSelect1.click();
      await page.waitForTimeout(2000);
      
      // option 요소들 확인
      const options = await documentSelect1.locator('option').allTextContents();
      console.log('Option 개수:', options.length);
      console.log('Options:', options);
      
      const validOptions = options.filter(option => option.trim() !== '');
      console.log('유효한 Options:', validOptions.length);
      console.log('유효한 Options 내용:', validOptions);
      
      // 드롭다운 닫기
      await page.keyboard.press('Escape');
    }
    
    // 4. Gradio 특수 드롭다운 찾기
    const gradioDropdown = page.locator('.gr-dropdown, .gradio-dropdown, [data-testid*="dropdown"]');
    const gradioCount = await gradioDropdown.count();
    console.log(`Gradio 드롭다운: ${gradioCount}개`);
    
    // 5. 페이지의 모든 텍스트 확인 (문서 제목이 있는지)
    const pageText = await page.textContent('body');
    const hasDocumentText = pageText?.includes('문서') || pageText?.includes('sample') || pageText?.includes('architecture');
    console.log(`페이지에 문서 관련 텍스트 있음: ${hasDocumentText}`);
    
    // 6. HTML 스냅샷 (선택 영역만)
    const selectArea = page.locator('text=문서 선택').locator('..').locator('..');
    const selectHTML = await selectArea.innerHTML().catch(() => 'HTML 못가져옴');
    console.log('선택 영역 HTML 일부:', selectHTML.substring(0, 500));
    
    // 테스트는 항상 통과하도록 (디버깅 목적)
    expect(true).toBe(true);
  });
});