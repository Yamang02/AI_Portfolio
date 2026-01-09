export interface FallingCard {
  id: string;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  project: any; // 실제 프로젝트 데이터
  width: number;
  height: number;
}

export interface DemonSlayerColors {
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  imageBgStart: string;
  imageBgEnd: string;
  glowColor: string;
}

export interface MainAreaBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}
