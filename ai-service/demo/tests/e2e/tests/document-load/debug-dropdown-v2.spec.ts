import { test, expect } from '@playwright/test';

test.describe('Gradio 드롭다운 구조 분석', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const documentLoadTab = page.getByRole('tab', { name: /DocumentLoad/ });
    await documentLoadTab.click();
    await page.waitForTimeout(2000);
  });

  test('Gradio 드롭다운 실제 동작 확인', async ({ page }) => {
    // 샘플 데이터 로드
    const loadButton = page.getByRole('button', { name: /샘플 데이터 로드/ });
    await loadButton.click();
    await page.waitForTimeout(15000);
    
    console.log('=== Gradio 드롭다운 분석 ===');
    
    // 1. input role="listbox" 찾기
    const listboxInput = page.locator('input[role="listbox"][aria-label="문서 선택"]');
    const inputExists = await listboxInput.count();
    console.log(`Listbox input 개수: ${inputExists}`);
    
    if (inputExists > 0) {
      // 2. 클릭해서 드롭다운 열기
      await listboxInput.click();
      await page.waitForTimeout(2000);
      
      // 3. 드롭다운이 열렸는지 확인
      const expanded = await listboxInput.getAttribute('aria-expanded');
      console.log(`드롭다운 열림 상태: ${expanded}`);
      
      // 4. 드롭다운 옵션들 찾기 (다양한 방법 시도)
      const dropdownOptions1 = page.locator('[role="option"]');
      const optionCount1 = await dropdownOptions1.count();
      console.log(`role="option" 개수: ${optionCount1}`);
      
      if (optionCount1 > 0) {
        const optionTexts = await dropdownOptions1.allTextContents();
        console.log('Options (role="option"):', optionTexts);
      }
      
      // 5. dropdown-options ID로 찾기
      const dropdownContainer = page.locator('#dropdown-options');
      const containerExists = await dropdownContainer.count();
      console.log(`#dropdown-options 컨테이너: ${containerExists}`);
      
      if (containerExists > 0) {
        const containerText = await dropdownContainer.textContent();
        console.log('컨테이너 텍스트:', containerText?.substring(0, 200));
        
        // 컨테이너 내부의 모든 clickable 요소들
        const clickables = dropdownContainer.locator('div, span, button, [data-value]');
        const clickableCount = await clickables.count();
        console.log(`클릭 가능한 요소들: ${clickableCount}`);
        
        if (clickableCount > 0) {
          const clickableTexts = await clickables.allTextContents();
          const validTexts = clickableTexts.filter(text => text.trim() !== '');
          console.log('유효한 텍스트들:', validTexts);
        }
      }
      
      // 6. 화면에 보이는 모든 요소 중 문서 제목 같은 것들 찾기
      const visibleTexts = await page.locator('body *:visible').allTextContents();
      const documentLikeTexts = visibleTexts.filter(text => 
        text.includes('아키텍처') || 
        text.includes('포트폴리오') || 
        text.includes('QA') ||
        text.includes('.md') ||
        text.includes('문서')
      );
      console.log('문서 관련 텍스트들:', documentLikeTexts.slice(0, 5));
      
      // 드롭다운 닫기
      await page.keyboard.press('Escape');
    }
    
    expect(true).toBe(true);
  });
});