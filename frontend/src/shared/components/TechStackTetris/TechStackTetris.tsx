import React, { useEffect, useRef } from 'react';
import { TechStackMetadata } from '../../../entities/techstack';
import './TechStackTetris.css';

// 테트로미노 모양 정의
const TETROMINOS = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

type TetrominoType = keyof typeof TETROMINOS;

interface Block {
  pixelX: number;
  pixelY: number;
  shape: number[][];
  tech: TechStackMetadata;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  scale: number; // 블록 크기
  isLaunched: boolean; // 발사 완료 여부
  isInitialBurst: boolean; // 초기 폭발 블록 여부
  isExploding: boolean; // 폭발 중인지 여부
  explosionStartTime: number; // 폭발 시작 시간
  originalScale: number; // 원래 스케일 (폭발 시 복원용)
}

interface TechStackTetrisProps {
  techs: TechStackMetadata[];
  className?: string;
  giantBlockTrigger?: number; // 외부에서 초거대 블록 생성 트리거
  isAnimationEnabled?: boolean; // 애니메이션 활성화 여부
  onAnimationToggle?: () => void; // 애니메이션 토글 콜백
}

const GRID_SIZE = 20;
const GRAVITY = 0.25;
const FALL_SPEED = 0.8; // 떨어지는 속도
const SPAWN_INTERVAL = 800; // 새 블록 생성 간격 (ms)
const MAX_BLOCKS = 30; // 최대 블록 수 제한 (성능 최적화)

export const TechStackTetris: React.FC<TechStackTetrisProps> = ({ 
  techs, 
  className = '', 
  giantBlockTrigger = 0,
  isAnimationEnabled = true,
  onAnimationToggle
}) => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null); // 일반 블록용
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null); // 초거대 블록용
  const blocksRef = useRef<Block[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const hasLaunchedRef = useRef<boolean>(false);
  const lastSpawnTimeRef = useRef<number>(0);
  const techIndexRef = useRef<number>(0);
  const spawnGiantBlockRef = useRef<(() => void) | null>(null); // 초거대 블록 생성 함수 참조

  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const foregroundCanvas = foregroundCanvasRef.current;
    if (!backgroundCanvas || !foregroundCanvas || techs.length === 0) return;

    const bgCtx = backgroundCanvas.getContext('2d');
    const fgCtx = foregroundCanvas.getContext('2d');
    if (!bgCtx || !fgCtx) return;

    // Canvas 크기 설정
    const resizeCanvas = () => {
      backgroundCanvas.width = backgroundCanvas.offsetWidth;
      backgroundCanvas.height = backgroundCanvas.offsetHeight;
      foregroundCanvas.width = foregroundCanvas.offsetWidth;
      foregroundCanvas.height = foregroundCanvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 랜덤 테트로미노 선택
    const getRandomTetromino = (): number[][] => {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      return TETROMINOS[randomType];
    };

    // 테트로미노 90도 회전
    const rotateShape90 = (shape: number[][]): number[][] => {
      const rows = shape.length;
      const cols = shape[0].length;
      const rotated: number[][] = [];
      for (let i = 0; i < cols; i++) {
        rotated[i] = [];
        for (let j = 0; j < rows; j++) {
          rotated[i][j] = shape[rows - 1 - j][i];
        }
      }
      return rotated;
    };

    // 초기 발사 블록 생성
    const launchBlocks = () => {
      const centerX = backgroundCanvas.width / 2;
      const centerY = backgroundCanvas.height * 0.75; // 하단 중앙

      techs.forEach((tech, index) => {
        let shape = getRandomTetromino();

        // 랜덤 회전
        const rotations = Math.floor(Math.random() * 4);
        for (let i = 0; i < rotations; i++) {
          shape = rotateShape90(shape);
        }

        // 극단적인 스케일 (0.3 ~ 4.0) - 거대 블록 추가
        let scale;
        const random = Math.random();
        if (random < 0.55) {
          // 55% 확률로 작은 블록 (0.3~0.8)
          scale = 0.3 + Math.random() * 0.5;
        } else if (random < 0.95) {
          // 40% 확률로 큰 블록 (1.2~2.0)
          scale = 1.2 + Math.random() * 0.8;
        } else {
          // 5% 확률로 거대 블록 (3.0~4.0) - 매우 드물게!
          scale = 3.0 + Math.random() * 1.0;
        }

        // 방사형 각도
        const angle = (index / techs.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = 10 + Math.random() * 8;

        // 초기 회전 속도 조정 (스케일에 따라)
        let initialRotationSpeed;
        if (scale > 6.0) {
          initialRotationSpeed = (Math.random() - 0.5) * 0.01; // 이스터에그 블록: 매우 느림
        } else if (scale > 3.0) {
          initialRotationSpeed = (Math.random() - 0.5) * 0.02; // 일반 초거대 블록: 느림
        } else {
          initialRotationSpeed = (Math.random() - 0.5) * 0.08; // 일반 블록: 원래 속도
        }

        blocksRef.current.push({
          pixelX: centerX,
          pixelY: centerY,
          shape,
          tech,
          velocityX: Math.cos(angle) * speed * 0.8, // 수평 움직임 강화
          velocityY: Math.sin(angle) * speed - 12, // 위로 강하게 솟구침
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: initialRotationSpeed,
          scale,
          isLaunched: false,
          isInitialBurst: true,
          isExploding: false,
          explosionStartTime: 0,
          originalScale: scale
        });
      });

      hasLaunchedRef.current = true;
    };

    // 이스터에그: 초거대 블록 생성
    const spawnGiantBlock = () => {
      if (techs.length === 0) return;
      
      // 최대 블록 수 제한 (성능 최적화)
      if (blocksRef.current.length >= MAX_BLOCKS) {
        return;
      }
      const tech = techs[Math.floor(Math.random() * techs.length)];
      let shape = getRandomTetromino();
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) {
        shape = rotateShape90(shape);
      }

      // 초거대 스케일 (6.0 ~ 8.0) - 더 임팩트 있게
      const scale = 6.0 + Math.random() * 2.0;
      const spawnX = backgroundCanvas.width / 2; // 중앙에서 시작
      const blockSize = GRID_SIZE * scale;
      const spawnY = -blockSize; // 화면 상단에서 블록의 하단부부터 보이도록

      blocksRef.current.push({
        pixelX: spawnX,
        pixelY: spawnY,
        shape,
        tech,
        velocityX: (Math.random() - 0.5) * 0.5, // 매우 느린 수평 움직임
        velocityY: 1.0, // 아래로 천천히 이동
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005, // 극도로 느린 회전 (0.01 → 0.005)
        scale,
        isLaunched: true,
        isInitialBurst: false,
        isExploding: false,
        explosionStartTime: 0,
        originalScale: scale
      });
    };

    // spawnGiantBlock 함수를 ref에 저장
    spawnGiantBlockRef.current = spawnGiantBlock;

    // 상단에서 새 블록 생성
    const spawnBlock = () => {
      // 최대 블록 수 제한 (성능 최적화)
      if (blocksRef.current.length >= MAX_BLOCKS) {
        return;
      }
      
      const tech = techs[techIndexRef.current % techs.length];
      techIndexRef.current++;

      let shape = getRandomTetromino();
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) {
        shape = rotateShape90(shape);
      }

      // 극단적인 스케일 (0.3 ~ 8.0) - 이스터에그 블록 추가
      let scale;
      const random = Math.random();
      if (random < 0.63) {
        // 63% 확률로 작은 블록 (0.3~0.8)
        scale = 0.3 + Math.random() * 0.5;
      } else if (random < 0.93) {
        // 30% 확률로 큰 블록 (1.2~2.0)
        scale = 1.2 + Math.random() * 0.8;
      } else if (random < 0.98) {
        // 5% 확률로 거대 블록 (3.0~4.0) - 드물게!
        scale = 3.0 + Math.random() * 1.0;
      } else {
        // 2% 확률로 이스터에그 블록 (6.0~8.0) - 극히 드물게!
        scale = 6.0 + Math.random() * 2.0;
      }
      const spawnX = Math.random() * backgroundCanvas.width * 0.6 + backgroundCanvas.width * 0.2; // 중앙 60% 영역

      // 초기 회전 속도 조정 (스케일에 따라)
      let initialRotationSpeed;
      if (scale > 6.0) {
        initialRotationSpeed = (Math.random() - 0.5) * 0.005; // 이스터에그 블록: 극도로 느림
      } else if (scale > 3.0) {
        initialRotationSpeed = (Math.random() - 0.5) * 0.01; // 일반 초거대 블록: 매우 느림
      } else {
        initialRotationSpeed = (Math.random() - 0.5) * 0.05; // 일반 블록: 원래 속도
      }

      blocksRef.current.push({
        pixelX: spawnX,
        pixelY: -50, // 화면 위쪽에서 시작
        shape,
        tech,
        velocityX: (Math.random() - 0.5) * 2.0, // 수평 움직임 강화
        velocityY: FALL_SPEED,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: initialRotationSpeed,
        scale,
        isLaunched: true, // 이미 테트리스 모드
        isInitialBurst: false,
        isExploding: false,
        explosionStartTime: 0,
        originalScale: scale
      });
    }

    // HSL 색상 조정 (스케일에 따라 채도와 명도 조정)
    const adjustColorByScale = (hexColor: string, scale: number): string => {
      // hex to rgb
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      // rgb to hsl
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
          case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
          case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
        }
      }

      // 스케일에 따라 채도와 명도 조정 (작을수록 흐릿하게)
      let saturationMultiplier = 0.3 + (scale / 1.5) * 0.7; // 0.3 ~ 1.0
      let lightnessAdjust = (1.5 - scale) * 0.15; // 작을수록 밝게
      
      // 초거대 블록의 채도를 낮춤 (카메라 효과)
      if (scale > 3.0) {
        saturationMultiplier *= 0.3; // 초거대 블록은 채도를 30%로 감소 (더 흐릿하게)
        lightnessAdjust += 0.25; // 더 밝게 (배경과 유사한 색상)
      }
      
      // 이스터에그 초거대 블록 (6.0 이상) 특별 처리 - 카메라 효과
      if (scale > 6.0) {
        saturationMultiplier *= 0.1; // 이스터에그 블록은 채도를 10%로 대폭 감소 (흐릿하게)
        lightnessAdjust += 0.4; // 더 밝게 (배경과 유사한 색상)
      }

      s = Math.min(1, s * saturationMultiplier);
      l = Math.min(1, l + lightnessAdjust);

      return `hsl(${h * 360}, ${s * 100}%, ${l * 100}%)`;
    };

    // 블록 겹침 체크 로직 제거 (성능 최적화)

    // 블록 그리기
    const drawBlock = (ctx: CanvasRenderingContext2D, block: Block) => {
      ctx.save();

      // blur 효과 최소화 (성능 최적화)
      if (block.scale > 6.0) {
        ctx.filter = 'blur(2px)'; // 이스터에그 블록만 blur 적용
      }
      // 다른 모든 블록은 blur 없음 (성능 최적화)

      ctx.translate(block.pixelX, block.pixelY);
      ctx.rotate(block.rotation);

      const size = GRID_SIZE * block.scale;
      const baseColor = block.tech.colorHex || '#6366f1';
      const color = adjustColorByScale(baseColor, block.scale);

      // 기본 투명도 설정
      let opacity = 1.0;

      // 이스터에그 블록에만 투명도 적용
      if (block.scale > 6.0) {
        opacity = 0.4; // 이스터에그 블록은 40% 투명도
      }

      // 폭발 중인 초거대 블록의 투명도 처리 (폭발 효과만)
      if (block.isExploding && block.scale > 3.0) {
        const currentTime = performance.now();
        const elapsed = currentTime - block.explosionStartTime;
        const progress = Math.min(elapsed / 2000, 1); // 2초 폭발
        
        if (progress < 0.3) {
          // 0-30%: 작은 스케일에서 원래 스케일로 - 점점 불투명해짐
          const scaleProgress = progress / 0.3;
          opacity = 0.3 + 0.7 * scaleProgress; // 0.3에서 1.0으로
        } else if (progress < 0.7) {
          // 30-70%: 원래 스케일에서 더 큰 스케일로 - 완전 불투명
          opacity = 1.0; // 완전 불투명
        } else {
          // 70-100%: 큰 스케일에서 사라짐 - 점점 투명해짐
          const fadeProgress = (progress - 0.7) / 0.3;
          opacity = 1.0 * (1 - fadeProgress); // 1.0에서 0.0으로
        }
      }

      // 블록 겹침 투명도 로직 제거 (성능 최적화)

      // 각 셀 그리기
      for (let row = 0; row < block.shape.length; row++) {
        for (let col = 0; col < block.shape[row].length; col++) {
          if (block.shape[row][col]) {
            const x = (col - block.shape[0].length / 2) * size;
            const y = (row - block.shape.length / 2) * size;

            // 메인 블록
            if (block.scale > 6.0) {
              // 이스터에그 초거대 블록 - 순수한 그림자 효과 (하이라이트/그림자 없음)
              ctx.fillStyle = color;
              ctx.globalAlpha = opacity;
              ctx.fillRect(x, y, size, size);
            } else {
              // 일반 블록 - 하이라이트와 그림자 포함
              ctx.fillStyle = color;
              ctx.globalAlpha = opacity;
              ctx.fillRect(x, y, size, size);

              // 하이라이트
              ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
              ctx.fillRect(x + 2, y + 2, size - 4, 2);
              ctx.fillRect(x + 2, y + 2, 2, size - 4);

              // 내부 그림자
              ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
              ctx.fillRect(x + size - 3, y + 3, 2, size - 6);
              ctx.fillRect(x + 3, y + size - 3, size - 6, 2);
            }

             // 외곽선
             if (block.scale > 6.0) {
               // 이스터에그 초거대 블록 - 그림자 효과 (경계선 없음)
               // 경계선을 그리지 않음 (순수한 그림자 효과)
             } else if (block.scale > 3.0) {
               // 일반 초거대 블록 - 카메라 효과용 부드러운 외곽선
               ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)'; // 회색 외곽선 (흐릿하게)
               ctx.lineWidth = 2;
               ctx.strokeRect(x, y, size, size);
               // 내부 외곽선 (더 흐릿하게)
               ctx.strokeStyle = 'rgba(180, 180, 180, 0.3)';
               ctx.lineWidth = 1;
               ctx.strokeRect(x, y, size, size);
             } else {
               ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
               ctx.lineWidth = 1;
               ctx.strokeRect(x, y, size, size);
             }
          }
        }
      }

      // 기술명 (회전 리셋)
      ctx.rotate(-block.rotation);
      
      // 초거대 블록들의 텍스트는 흐릿하게 (카메라 효과)
      if (block.scale > 6.0) {
        // 이스터에그 초거대 블록 - 텍스트 없음 (비밀스러운 성격)
        // 텍스트를 그리지 않음
      } else if (block.scale > 3.0) {
        // 일반 초거대 블록 - 가독성 개선된 텍스트
        const fontSize = Math.max(8, 10 * block.scale);
        
        // 텍스트 (배경 제거로 성능 최적화)
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 3;
        ctx.fillText(block.tech.displayName || block.tech.name, 0, 0);
        ctx.shadowBlur = 0;
      } else {
        // 일반 블록 - 가독성 개선된 텍스트 렌더링
        const fontSize = Math.max(8, 10 * block.scale);
        
        // 텍스트 (배경 제거로 성능 최적화)
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 2;
        ctx.fillText(block.tech.displayName || block.tech.name, 0, 0);
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1.0;
      ctx.restore();
    };

    // 애니메이션 루프
    const animate = (timestamp: number) => {
      // 애니메이션이 비활성화된 경우 정적 상태 유지
      if (!isAnimationEnabled) {
        // 정적 상태에서는 애니메이션 프레임 요청 중단
        return;
      }

      // 초기 발사 (한 번만) - 애니메이션 활성화 시에만
      if (!hasLaunchedRef.current) {
        launchBlocks();
      }

      // 새 블록 생성 (일정 간격으로) - 애니메이션 활성화 시에만
      if (hasLaunchedRef.current && timestamp - lastSpawnTimeRef.current > SPAWN_INTERVAL) {
        spawnBlock();
        lastSpawnTimeRef.current = timestamp;
      }

      // 모든 블록 업데이트 (성능 최적화)
      const currentBlocks = blocksRef.current;
      for (let i = 0; i < currentBlocks.length; i++) {
        const block = currentBlocks[i];
        if (!block.isLaunched && block.isInitialBurst) {
          // 초기 폭발 블록 - 포물선 운동
          block.velocityY += GRAVITY;
          block.pixelX += block.velocityX;
          block.pixelY += block.velocityY;
          block.velocityX *= 0.98;

          // 초거대 블록 폭발 로직 (페이지 로드 시)
          if (block.scale > 3.0 && !block.isExploding) {
            block.isExploding = true;
            block.explosionStartTime = timestamp;
            block.originalScale = block.scale;
            block.scale = 0.1; // 작은 스케일에서 시작
          }

          // 폭발 중인 초거대 블록 처리
          if (block.isExploding && block.scale > 3.0) {
            const explosionDuration = 2000; // 2초 동안 폭발
            const elapsed = timestamp - block.explosionStartTime;
            const progress = Math.min(elapsed / explosionDuration, 1);
            
            if (progress < 0.3) {
              // 0-30%: 작은 스케일에서 원래 스케일로 확대
              const scaleProgress = progress / 0.3;
              block.scale = 0.1 + (block.originalScale - 0.1) * scaleProgress;
            } else if (progress < 0.7) {
              // 30-70%: 원래 스케일에서 더 큰 스케일로 확대
              const scaleProgress = (progress - 0.3) / 0.4;
              block.scale = block.originalScale + (block.originalScale * 0.5) * scaleProgress;
            } else {
              // 70-100%: 큰 스케일에서 사라짐 (투명도 감소)
              const fadeProgress = (progress - 0.7) / 0.3;
              block.scale = block.originalScale * 1.5 * (1 - fadeProgress * 0.3);
            }
            
            // 폭발 완료 시 블록 제거
            if (progress >= 1) {
              block.isLaunched = true; // 제거를 위해 상태 변경
              block.isExploding = false; // 폭발 상태 해제
            }
          }

          // 정점 찍고 떨어지기 시작하면 테트리스 모드로 전환 (초거대 블록 제외)
          if (block.velocityY > 0 && block.pixelY > 0 && !block.isExploding) {
            block.isLaunched = true;
          }
        } else {
          // 테트리스 모드 - 자연스럽게 떨어짐
          // 초거대 블록은 훨씬 빠르게 떨어짐 (화면을 오래 가리지 않도록)
          const fallSpeed = block.scale > 3.0 ? FALL_SPEED * 3.0 : FALL_SPEED;
          block.pixelY += fallSpeed;
          block.pixelX += block.velocityX; // 수평 움직임 강화

          // 회전 (일부 블록만 회전하도록 제한)
          if (block.scale > 0.8) { // 큰 블록만 회전
            block.rotation += block.rotationSpeed;
            // 초거대 블록은 매우 느리게 회전
            if (block.scale > 6.0) {
              block.rotationSpeed *= 0.999; // 이스터에그 블록은 매우 느리게 감속
            } else if (block.scale > 3.0) {
              block.rotationSpeed *= 0.9995; // 일반 초거대 블록은 느리게 감속
            } else {
              // 마찰로 회전 속도 감소
              block.rotationSpeed *= 0.998;
            }
          }

          // 마찰 (수평 움직임을 더 오래 유지)
          block.velocityX *= 0.995;
        }
      }

      // 화면 밖으로 나간 블록 제거 (하단, 좌우 경계 모두 고려 - 자연스럽게 사라지도록)
      // 단, 폭발 중인 초거대 블록은 제거하지 않음
      blocksRef.current = blocksRef.current.filter((block) => {
        // 폭발 중인 초거대 블록은 제거하지 않음
        if (block.isExploding && block.scale > 3.0) {
          return true;
        }
        
        const blockSize = GRID_SIZE * block.scale;
        return block.pixelY < backgroundCanvas.height + 200 &&
               block.pixelX > -blockSize * 2 &&
               block.pixelX < backgroundCanvas.width + blockSize * 2;
      });

      // 배경과 전경 캔버스 지우기
      bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
      fgCtx.clearRect(0, 0, foregroundCanvas.width, foregroundCanvas.height);

      // 블록을 일반/초거대로 분리
      const normalBlocks = blocksRef.current.filter(b => b.scale <= 3.0);
      const giantBlocks = blocksRef.current.filter(b => b.scale > 3.0);

      // 일반 블록 그리기 (배경 캔버스)
      normalBlocks.forEach((block) => {
        drawBlock(bgCtx, block);
      });

      // 초거대 블록 그리기 (전경 캔버스)
      giantBlocks.forEach((block) => {
        drawBlock(fgCtx, block);
      });

      // 애니메이션이 활성화된 경우에만 다음 프레임 요청
      if (isAnimationEnabled) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // 애니메이션이 활성화된 경우에만 애니메이션 시작
    if (isAnimationEnabled) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [techs, isAnimationEnabled]);

  // 외부에서 초거대 블록 생성 요청 처리
  useEffect(() => {
    if (giantBlockTrigger > 0 && spawnGiantBlockRef.current && isAnimationEnabled) {
      spawnGiantBlockRef.current();
    }
  }, [giantBlockTrigger, isAnimationEnabled]);


  return (
    <>
      {/* 애니메이션이 활성화된 경우에만 캔버스 표시 */}
      {isAnimationEnabled && (
        <>
          <canvas
            ref={backgroundCanvasRef}
            className={`tech-stack-tetris tech-stack-tetris-background ${className}`}
          />
          <canvas
            ref={foregroundCanvasRef}
            className={`tech-stack-tetris tech-stack-tetris-foreground ${className}`}
          />
        </>
      )}
      {/* 애니메이션 토글 버튼 - 글라스모피즘 레이어 우측상단 */}
      {onAnimationToggle && (
        <button
          onClick={onAnimationToggle}
          className="absolute top-3 right-3 z-20 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-md border border-white/30 transition-all duration-200 text-gray-500 hover:text-gray-700"
          title={isAnimationEnabled ? "애니메이션 끄기" : "애니메이션 켜기"}
        >
          {isAnimationEnabled ? (
            // 애니메이션 켜진 상태 (일시정지 아이콘)
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            // 애니메이션 꺼진 상태 (재생 아이콘)
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      )}
    </>
  );
};
