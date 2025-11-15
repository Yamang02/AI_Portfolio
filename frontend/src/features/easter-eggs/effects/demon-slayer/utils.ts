import type { FallingCard, DemonSlayerColors, MainAreaBounds } from './types';
import { CARD_WIDTH, CARD_HEIGHT } from './constants';

/**
 * main 엘리먼트의 경계를 가져오는 유틸리티 함수
 */
export const getMainElementBounds = (): MainAreaBounds => {
  const mainElement = document.querySelector('main');
  if (mainElement) {
    const rect = mainElement.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }
  return {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * 카드 생성 함수
 */
export const createFallingCard = (
  project: any,
  headerBottom: number,
  mainBounds: MainAreaBounds
): FallingCard => {
  return {
    id: `card-${Date.now()}-${Math.random()}`,
    x: mainBounds.left + Math.random() * Math.max(0, mainBounds.width - CARD_WIDTH),
    y: headerBottom,
    speed: 4 + Math.random() * 4,
    rotation: (Math.random() - 0.5) * 0.15,
    rotationSpeed: (Math.random() - 0.5) * 0.015,
    project,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  };
};

/**
 * 카드 HTML 생성 함수
 */
export const createCardHTML = (project: any, colors: DemonSlayerColors): string => {
  const hasValidImage =
    project.imageUrl && project.imageUrl !== '#' && project.imageUrl !== '';
  const title = (project.title || '프로젝트').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const description = (project.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const startYear = project.startDate ? new Date(project.startDate).getFullYear() : '';
  const endYear = project.endDate ? ` - ${new Date(project.endDate).getFullYear()}` : '';

  return `
    <div style="
      width: 100%;
      height: 100%;
      background: ${colors.surface};
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px ${colors.glowColor};
      border: 1px solid ${colors.border};
      display: flex;
      flex-direction: column;
    ">
      <div style="
        height: 144px;
        width: 100%;
        background: linear-gradient(to bottom right, ${colors.imageBgStart}, ${colors.imageBgEnd});
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${
          hasValidImage
            ? `
          <img
            src="${project.imageUrl}"
            alt="${title.replace(/"/g, '&quot;')}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            "
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
        `
            : ''
        }
        <div style="
          ${hasValidImage ? 'display: none;' : 'display: flex;'}
          position: absolute;
          inset: 0;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to bottom right, ${colors.imageBgStart}, ${colors.imageBgEnd});
        ">
          <span style="
            font-size: 36px;
            opacity: 0.5;
          ">📁</span>
        </div>
      </div>
      <div style="
        padding: 16px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        background: ${colors.surface};
        gap: 8px;
      ">
        <h3 style="
          font-size: 16px;
          font-weight: 800;
          color: ${colors.textPrimary};
          margin: 0;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        ">${title}</h3>
        <div style="
          border-bottom: 1px solid ${colors.border};
          margin: 4px 0;
        "></div>
        <p style="
          color: ${colors.textSecondary};
          font-size: 12px;
          margin: 0;
          flex-grow: 1;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        ">${description}</p>
        <div style="
          padding-top: 8px;
          border-top: 1px solid ${colors.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        ">
          <span style="
            font-size: 11px;
            color: ${colors.textMuted};
          ">${startYear}${endYear}</span>
        </div>
      </div>
    </div>
  `;
};

/**
 * 프로젝트 선택 함수 (중복 방지)
 */
export const selectRandomProject = (
  projects: any[],
  usedProjectIds: Set<string>
): any | null => {
  if (projects.length === 0) return null;

  const availableProjects = projects.filter((p) => !usedProjectIds.has(p.id));

  if (availableProjects.length === 0) {
    usedProjectIds.clear();
    availableProjects.push(...projects);
  }

  const randomIndex = Math.floor(Math.random() * availableProjects.length);
  const selectedProject = availableProjects[randomIndex];
  usedProjectIds.add(selectedProject.id);

  return selectedProject;
};
