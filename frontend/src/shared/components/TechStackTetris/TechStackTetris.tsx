import React, { useEffect, useRef } from 'react';
import './TechStackTetris.css';

interface TechStackMetadata {
  name: string;
  displayName?: string;
  colorHex?: string;
}

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
  scale: number;
  isLaunched: boolean;
  isInitialBurst: boolean;
  isExploding: boolean;
  explosionStartTime: number;
  originalScale: number;
}

interface TechStackTetrisProps {
  techs: TechStackMetadata[];
  className?: string;
  giantBlockTrigger?: number;
  isAnimationEnabled?: boolean;
  onAnimationToggle?: () => void;
}

const GRID_SIZE = 20;
const GRAVITY = 0.25;
const FALL_SPEED = 0.8;
const SPAWN_INTERVAL = 800;
const MAX_BLOCKS = 30;

export const TechStackTetris: React.FC<TechStackTetrisProps> = ({ 
  techs, 
  className = '', 
  giantBlockTrigger = 0,
  isAnimationEnabled = true,
  onAnimationToggle
}) => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const blocksRef = useRef<Block[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const hasLaunchedRef = useRef<boolean>(false);
  const lastSpawnTimeRef = useRef<number>(0);
  const techIndexRef = useRef<number>(0);
  const spawnGiantBlockRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const foregroundCanvas = foregroundCanvasRef.current;
    if (!backgroundCanvas || !foregroundCanvas || techs.length === 0) return;

    const bgCtx = backgroundCanvas.getContext('2d');
    const fgCtx = foregroundCanvas.getContext('2d');
    if (!bgCtx || !fgCtx) return;

    const resizeCanvas = () => {
      backgroundCanvas.width = backgroundCanvas.offsetWidth;
      backgroundCanvas.height = backgroundCanvas.offsetHeight;
      foregroundCanvas.width = foregroundCanvas.offsetWidth;
      foregroundCanvas.height = foregroundCanvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getRandomTetromino = (): number[][] => {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      return TETROMINOS[randomType];
    };

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

    const launchBlocks = () => {
      const centerX = backgroundCanvas.width / 2;
      const centerY = backgroundCanvas.height * 0.75;

      techs.forEach((tech, index) => {
        let shape = getRandomTetromino();

        const rotations = Math.floor(Math.random() * 4);
        for (let i = 0; i < rotations; i++) {
          shape = rotateShape90(shape);
        }

        let scale;
        const random = Math.random();
        if (random < 0.55) {
          scale = 0.3 + Math.random() * 0.5;
        } else if (random < 0.95) {
          scale = 1.2 + Math.random() * 0.8;
        } else {
          scale = 3.0 + Math.random() * 1.0;
        }

        const angle = (index / techs.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = 10 + Math.random() * 8;

        let initialRotationSpeed;
        if (scale > 6.0) {
          initialRotationSpeed = (Math.random() - 0.5) * 0.01;
        } else if (scale > 3.0) {
          initialRotationSpeed = (Math.random() - 0.5) * 0.02;
        } else {
          initialRotationSpeed = (Math.random() - 0.5) * 0.08;
        }

        blocksRef.current.push({
          pixelX: centerX,
          pixelY: centerY,
          shape,
          tech,
          velocityX: Math.cos(angle) * speed * 0.8,
          velocityY: Math.sin(angle) * speed - 12,
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

    const spawnGiantBlock = () => {
      if (techs.length === 0) return;
      
      if (blocksRef.current.length >= MAX_BLOCKS) {
        return;
      }
      const tech = techs[Math.floor(Math.random() * techs.length)];
      let shape = getRandomTetromino();
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) {
        shape = rotateShape90(shape);
      }

      const scale = 6.0 + Math.random() * 2.0;
      const spawnX = backgroundCanvas.width / 2;
      const blockSize = GRID_SIZE * scale;
      const spawnY = -blockSize;

      blocksRef.current.push({
        pixelX: spawnX,
        pixelY: spawnY,
        shape,
        tech,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
        scale,
        isLaunched: true,
        isInitialBurst: false,
        isExploding: false,
        explosionStartTime: 0,
        originalScale: scale
      });
    };

    spawnGiantBlockRef.current = spawnGiantBlock;

    const spawnBlock = () => {
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

      let scale;
      const random = Math.random();
      if (random < 0.63) {
        scale = 0.3 + Math.random() * 0.5;
      } else if (random < 0.93) {
        scale = 1.2 + Math.random() * 0.8;
      } else if (random < 0.98) {
        scale = 3.0 + Math.random() * 1.0;
      } else {
        scale = 6.0 + Math.random() * 2.0;
      }
      const spawnX = Math.random() * backgroundCanvas.width * 0.6 + backgroundCanvas.width * 0.2;

      let initialRotationSpeed;
      if (scale > 6.0) {
        initialRotationSpeed = (Math.random() - 0.5) * 0.005;
      } else if (scale > 3.0) {
        initialRotationSpeed = (Math.random() - 0.5) * 0.01;
      } else {
        initialRotationSpeed = (Math.random() - 0.5) * 0.05;
      }

      blocksRef.current.push({
        pixelX: spawnX,
        pixelY: -50,
        shape,
        tech,
        velocityX: (Math.random() - 0.5) * 2.0,
        velocityY: FALL_SPEED,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: initialRotationSpeed,
        scale,
        isLaunched: true,
        isInitialBurst: false,
        isExploding: false,
        explosionStartTime: 0,
        originalScale: scale
      });
    }

    const adjustColorByScale = (hexColor: string, scale: number): string => {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

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

      let saturationMultiplier = 0.3 + (scale / 1.5) * 0.7;
      let lightnessAdjust = (1.5 - scale) * 0.15;
      
      if (scale > 3.0) {
        saturationMultiplier *= 0.3;
        lightnessAdjust += 0.25;
      }
      
      if (scale > 6.0) {
        saturationMultiplier *= 0.1;
        lightnessAdjust += 0.4;
      }

      s = Math.min(1, s * saturationMultiplier);
      l = Math.min(1, l + lightnessAdjust);

      return `hsl(${h * 360}, ${s * 100}%, ${l * 100}%)`;
    };

    const drawBlock = (ctx: CanvasRenderingContext2D, block: Block) => {
      ctx.save();

      if (block.scale > 6.0) {
        ctx.filter = 'blur(2px)';
      }

      ctx.translate(block.pixelX, block.pixelY);
      ctx.rotate(block.rotation);

      const size = GRID_SIZE * block.scale;
      const baseColor = block.tech.colorHex || '#6366f1';
      const color = adjustColorByScale(baseColor, block.scale);

      let opacity = 1.0;

      if (block.scale > 6.0) {
        opacity = 0.4;
      }

      if (block.isExploding && block.scale > 3.0) {
        const currentTime = performance.now();
        const elapsed = currentTime - block.explosionStartTime;
        const progress = Math.min(elapsed / 2000, 1);
        
        if (progress < 0.3) {
          const scaleProgress = progress / 0.3;
          opacity = 0.3 + 0.7 * scaleProgress;
        } else if (progress < 0.7) {
          opacity = 1.0;
        } else {
          const fadeProgress = (progress - 0.7) / 0.3;
          opacity = 1.0 * (1 - fadeProgress);
        }
      }

      for (let row = 0; row < block.shape.length; row++) {
        for (let col = 0; col < block.shape[row].length; col++) {
          if (block.shape[row][col]) {
            const x = (col - block.shape[0].length / 2) * size;
            const y = (row - block.shape.length / 2) * size;

            if (block.scale > 6.0) {
              ctx.fillStyle = color;
              ctx.globalAlpha = opacity;
              ctx.fillRect(x, y, size, size);
            } else {
              ctx.fillStyle = color;
              ctx.globalAlpha = opacity;
              ctx.fillRect(x, y, size, size);

              ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
              ctx.fillRect(x + 2, y + 2, size - 4, 2);
              ctx.fillRect(x + 2, y + 2, 2, size - 4);

              ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
              ctx.fillRect(x + size - 3, y + 3, 2, size - 6);
              ctx.fillRect(x + 3, y + size - 3, size - 6, 2);
            }

             if (block.scale > 6.0) {
             } else if (block.scale > 3.0) {
               ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
               ctx.lineWidth = 2;
               ctx.strokeRect(x, y, size, size);
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

      ctx.rotate(-block.rotation);
      
      if (block.scale > 6.0) {
      } else if (block.scale > 3.0) {
        const fontSize = Math.max(8, 10 * block.scale);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 3;
        ctx.fillText(block.tech.displayName || block.tech.name, 0, 0);
        ctx.shadowBlur = 0;
      } else {
        const fontSize = Math.max(8, 10 * block.scale);
        
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

    const animate = (timestamp: number) => {
      if (!isAnimationEnabled) {
        return;
      }

      if (!hasLaunchedRef.current) {
        launchBlocks();
      }

      if (hasLaunchedRef.current && timestamp - lastSpawnTimeRef.current > SPAWN_INTERVAL) {
        spawnBlock();
        lastSpawnTimeRef.current = timestamp;
      }

      const currentBlocks = blocksRef.current;
      for (let i = 0; i < currentBlocks.length; i++) {
        const block = currentBlocks[i];
        if (!block.isLaunched && block.isInitialBurst) {
          block.velocityY += GRAVITY;
          block.pixelX += block.velocityX;
          block.pixelY += block.velocityY;
          block.velocityX *= 0.98;

          if (block.scale > 3.0 && !block.isExploding) {
            block.isExploding = true;
            block.explosionStartTime = timestamp;
            block.originalScale = block.scale;
            block.scale = 0.1;
          }

          if (block.isExploding && block.scale > 3.0) {
            const explosionDuration = 2000;
            const elapsed = timestamp - block.explosionStartTime;
            const progress = Math.min(elapsed / explosionDuration, 1);
            
            if (progress < 0.3) {
              const scaleProgress = progress / 0.3;
              block.scale = 0.1 + (block.originalScale - 0.1) * scaleProgress;
            } else if (progress < 0.7) {
              const scaleProgress = (progress - 0.3) / 0.4;
              block.scale = block.originalScale + (block.originalScale * 0.5) * scaleProgress;
            } else {
              const fadeProgress = (progress - 0.7) / 0.3;
              block.scale = block.originalScale * 1.5 * (1 - fadeProgress * 0.3);
            }
            
            if (progress >= 1) {
              block.isLaunched = true;
              block.isExploding = false;
            }
          }

          if (block.velocityY > 0 && block.pixelY > 0 && !block.isExploding) {
            block.isLaunched = true;
          }
        } else {
          const fallSpeed = block.scale > 3.0 ? FALL_SPEED * 3.0 : FALL_SPEED;
          block.pixelY += fallSpeed;
          block.pixelX += block.velocityX;

          if (block.scale > 0.8) {
            block.rotation += block.rotationSpeed;
            if (block.scale > 6.0) {
              block.rotationSpeed *= 0.999;
            } else if (block.scale > 3.0) {
              block.rotationSpeed *= 0.9995;
            } else {
              block.rotationSpeed *= 0.998;
            }
          }

          block.velocityX *= 0.995;
        }
      }

      blocksRef.current = blocksRef.current.filter((block) => {
        if (block.isExploding && block.scale > 3.0) {
          return true;
        }
        
        const blockSize = GRID_SIZE * block.scale;
        return block.pixelY < backgroundCanvas.height + 200 &&
               block.pixelX > -blockSize * 2 &&
               block.pixelX < backgroundCanvas.width + blockSize * 2;
      });

      bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
      fgCtx.clearRect(0, 0, foregroundCanvas.width, foregroundCanvas.height);

      const normalBlocks = blocksRef.current.filter(b => b.scale <= 3.0);
      const giantBlocks = blocksRef.current.filter(b => b.scale > 3.0);

      normalBlocks.forEach((block) => {
        drawBlock(bgCtx, block);
      });

      giantBlocks.forEach((block) => {
        drawBlock(fgCtx, block);
      });

      if (isAnimationEnabled) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

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

  useEffect(() => {
    if (giantBlockTrigger > 0 && spawnGiantBlockRef.current && isAnimationEnabled) {
      spawnGiantBlockRef.current();
    }
  }, [giantBlockTrigger, isAnimationEnabled]);


  return (
    <>
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
      {onAnimationToggle && (
        <button
          onClick={onAnimationToggle}
          className="absolute top-3 right-3 z-20 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-md border border-white/30 transition-all duration-200 text-gray-500 hover:text-gray-700"
          title={isAnimationEnabled ? "애니메이션 끄기" : "애니메이션 켜기"}
        >
          {isAnimationEnabled ? (
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      )}
    </>
  );
};
