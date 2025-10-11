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
}

interface TechStackTetrisProps {
  techs: TechStackMetadata[];
  className?: string;
}

const GRID_SIZE = 20;
const GRAVITY = 0.25;
const FALL_SPEED = 0.8; // 떨어지는 속도
const SPAWN_INTERVAL = 800; // 새 블록 생성 간격 (ms)

export const TechStackTetris: React.FC<TechStackTetrisProps> = ({ techs, className = '' }) => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null); // 일반 블록용
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null); // 초거대 블록용
  const blocksRef = useRef<Block[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const hasLaunchedRef = useRef<boolean>(false);
  const lastSpawnTimeRef = useRef<number>(0);
  const techIndexRef = useRef<number>(0);

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

        blocksRef.current.push({
          pixelX: centerX,
          pixelY: centerY,
          shape,
          tech,
          velocityX: Math.cos(angle) * speed * 0.8, // 수평 움직임 강화
          velocityY: Math.sin(angle) * speed - 12, // 위로 강하게 솟구침
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
          scale,
          isLaunched: false,
          isInitialBurst: true
        });
      });

      hasLaunchedRef.current = true;
    };

    // 상단에서 새 블록 생성
    const spawnBlock = () => {
      const tech = techs[techIndexRef.current % techs.length];
      techIndexRef.current++;

      let shape = getRandomTetromino();
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) {
        shape = rotateShape90(shape);
      }

      // 극단적인 스케일 (0.3 ~ 4.0) - 거대 블록 추가
      let scale;
      const random = Math.random();
      if (random < 0.65) {
        // 65% 확률로 작은 블록 (0.3~0.8)
        scale = 0.3 + Math.random() * 0.5;
      } else if (random < 0.98) {
        // 33% 확률로 큰 블록 (1.2~2.0)
        scale = 1.2 + Math.random() * 0.8;
      } else {
        // 2% 확률로 거대 블록 (3.0~4.0) - 매우 드물게!
        scale = 3.0 + Math.random() * 1.0;
      }
      const spawnX = Math.random() * backgroundCanvas.width * 0.6 + backgroundCanvas.width * 0.2; // 중앙 60% 영역

      blocksRef.current.push({
        pixelX: spawnX,
        pixelY: -50, // 화면 위쪽에서 시작
        shape,
        tech,
        velocityX: (Math.random() - 0.5) * 2.0, // 수평 움직임 강화
        velocityY: FALL_SPEED,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        scale,
        isLaunched: true, // 이미 테트리스 모드
        isInitialBurst: false
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
      const saturationMultiplier = 0.3 + (scale / 1.5) * 0.7; // 0.3 ~ 1.0
      const lightnessAdjust = (1.5 - scale) * 0.15; // 작을수록 밝게

      s = Math.min(1, s * saturationMultiplier);
      l = Math.min(1, l + lightnessAdjust);

      return `hsl(${h * 360}, ${s * 100}%, ${l * 100}%)`;
    };

    // 블록이 다른 큰 블록에 가려지는지 체크
    const checkOcclusion = (block: Block, allBlocks: Block[]): boolean => {
      const blockSize = GRID_SIZE * block.scale;
      
      for (const otherBlock of allBlocks) {
        if (otherBlock === block) continue;
        if (otherBlock.scale <= block.scale) continue; // 더 큰 블록만 체크
        
        const distance = Math.sqrt(
          Math.pow(block.pixelX - otherBlock.pixelX, 2) + 
          Math.pow(block.pixelY - otherBlock.pixelY, 2)
        );
        
        const otherSize = GRID_SIZE * otherBlock.scale;
        const occlusionThreshold = (blockSize + otherSize) * 0.5; // 임계값 증가
        
        // 거리가 가까우면 가려짐
        if (distance < occlusionThreshold) {
          return true;
        }
      }
      
      return false;
    };

    // 블록 그리기
    const drawBlock = (ctx: CanvasRenderingContext2D, block: Block, isOccluded: boolean = false) => {
      ctx.save();

      ctx.translate(block.pixelX, block.pixelY);
      ctx.rotate(block.rotation);

      const size = GRID_SIZE * block.scale;
      const baseColor = block.tech.colorHex || '#6366f1';
      const color = adjustColorByScale(baseColor, block.scale);

      // 스케일에 따른 투명도 (작을수록 희미하게)
      let opacity = 0.5 + (block.scale / 1.5) * 0.5; // 0.5 ~ 1.0

      // 거대한 블록은 완전 불투명
      if (block.scale > 3.0) {
        opacity = 1.0; // 초거대 블록은 완전 불투명
      }

      // 가려진 블록은 더 투명하게
      if (isOccluded) {
        opacity *= 0.1; // 가려진 블록은 10% 투명도로 (거의 안 보이게)
      }

      // 각 셀 그리기
      for (let row = 0; row < block.shape.length; row++) {
        for (let col = 0; col < block.shape[row].length; col++) {
          if (block.shape[row][col]) {
            const x = (col - block.shape[0].length / 2) * size;
            const y = (row - block.shape.length / 2) * size;

            // 메인 블록
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

            // 외곽선
            if (block.scale > 3.0) {
              // 거대한 블록은 더 두꺼운 외곽선
              ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'; // 노란색 외곽선
              ctx.lineWidth = 3;
              ctx.strokeRect(x, y, size, size);
              // 이중 외곽선
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
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
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = opacity;
      ctx.font = `bold ${Math.max(8, 10 * block.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 4;
      ctx.fillText(block.tech.displayName || block.tech.name, 0, 0);
      ctx.shadowBlur = 0;

      ctx.globalAlpha = 1.0;
      ctx.restore();
    };

    // 애니메이션 루프
    const animate = (timestamp: number) => {
      // 초기 발사 (한 번만)
      if (!hasLaunchedRef.current) {
        launchBlocks();
      }

      // 새 블록 생성 (일정 간격으로)
      if (hasLaunchedRef.current && timestamp - lastSpawnTimeRef.current > SPAWN_INTERVAL) {
        spawnBlock();
        lastSpawnTimeRef.current = timestamp;
      }

      // 모든 블록 업데이트
      blocksRef.current.forEach((block) => {
        if (!block.isLaunched && block.isInitialBurst) {
          // 초기 폭발 블록 - 포물선 운동
          block.velocityY += GRAVITY;
          block.pixelX += block.velocityX;
          block.pixelY += block.velocityY;
          block.velocityX *= 0.98;

          // 정점 찍고 떨어지기 시작하면 테트리스 모드로 전환
          if (block.velocityY > 0 && block.pixelY > 0) {
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
            // 거대한 블록은 더 빠르게 회전
            if (block.scale > 3.0) {
              block.rotationSpeed *= 1.002; // 거대 블록은 회전이 가속됨
            } else {
              // 마찰로 회전 속도 감소
              block.rotationSpeed *= 0.998;
            }
          }

          // 마찰 (수평 움직임을 더 오래 유지)
          block.velocityX *= 0.995;
        }
      });

      // 화면 밖으로 나간 블록 제거 (하단, 좌우 경계 모두 고려 - 자연스럽게 사라지도록)
      blocksRef.current = blocksRef.current.filter((block) => {
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
      const sortedNormalBlocks = [...normalBlocks].sort((a, b) => a.scale - b.scale);
      sortedNormalBlocks.forEach((block) => {
        const isOccluded = checkOcclusion(block, sortedNormalBlocks);
        drawBlock(bgCtx, block, isOccluded);
      });

      // 초거대 블록 그리기 (전경 캔버스)
      const sortedGiantBlocks = [...giantBlocks].sort((a, b) => a.scale - b.scale);
      sortedGiantBlocks.forEach((block) => {
        const isOccluded = checkOcclusion(block, sortedGiantBlocks);
        drawBlock(fgCtx, block, isOccluded);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [techs]);

  return (
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
  );
};
