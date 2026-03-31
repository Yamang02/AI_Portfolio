import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { EasterEggContext } from '../../model/easter-egg.types';
import { useTheme } from '@/shared/providers/ThemeProvider';

interface MatrixEffectProps {
  context: EasterEggContext;
  onClose: () => void;
  config?: Record<string, unknown>;
}

interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
  startDelay: number;
}

interface GridCell {
  char: string;
  colorIndex: number;
}

const getRandomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
const getRandomColorIndex = (colors: string[]) => Math.floor(Math.random() * colors.length);

const MatrixEffect: React.FC<MatrixEffectProps> = ({ context: _context, onClose, config }) => {
  // JSON config에서 값 가져오기 (기본값은 하드코딩)
  const MATRIX_CHARS = (config?.matrixChars as string) ?? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const MATRIX_COLORS = (config?.matrixColors as string[]) ?? ['#00ff00', '#00ff41', '#00ff82', '#00ffc3', '#39ff00', '#39ff41'];
  const GRID_SIZE = (config?.gridSize as number) ?? 30;
  const FONT_SIZE = (config?.fontSize as number) ?? 18;
  const TOTAL_DURATION = (config?.totalDuration as number) ?? 16500;
  const RAIN_START_TIME = (config?.rainStartTime as number) ?? 3500;
  const FADEOUT_START_TIME = (config?.fadeoutStartTime as number) ?? 13500;
  const FADEOUT_DURATION = (config?.fadeoutDuration as number) ?? 2000;
  const RECOVERY_START_TIME = (config?.recoveryStartTime as number) ?? 16000;
  const RECOVERY_DURATION = (config?.recoveryDuration as number) ?? 500;
  const effectTheme = (config?.theme as string) ?? 'matrix';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [phase, setPhase] = useState<'color' | 'rain'>('color');
  const startTimeRef = useRef<number>(Date.now());
  const columnsRef = useRef<MatrixColumn[]>([]);
  const { theme, setTheme } = useTheme();
  const previousThemeRef = useRef<'light' | 'dark'>(
    theme === 'matrix' ? 'light' : (theme as 'light' | 'dark')
  );
  const gridCellsRef = useRef<Map<string, GridCell[][]>>(new Map());

  useEffect(() => {
    const currentTheme = theme;
    if (currentTheme !== effectTheme) {
      previousThemeRef.current = currentTheme as 'light' | 'dark';
      setTheme(effectTheme as 'matrix');
    }

    return () => {
      setTheme(previousThemeRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getGridCells = useCallback((width: number, height: number): GridCell[][] => {
    const key = `${width}x${height}`;
    if (gridCellsRef.current.has(key)) {
      return gridCellsRef.current.get(key)!;
    }

    const cols = Math.ceil(width / GRID_SIZE);
    const rows = Math.ceil(height / GRID_SIZE);
    const cells: GridCell[][] = [];

    for (let i = 0; i < cols; i++) {
      cells[i] = [];
      for (let j = 0; j < rows; j++) {
        cells[i][j] = {
          char: getRandomChar(MATRIX_CHARS),
          colorIndex: getRandomColorIndex(MATRIX_COLORS),
        };
      }
    }

    gridCellsRef.current.set(key, cells);
    return cells;
  }, []);

  const renderGrid = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    gridCells: GridCell[][],
    progress: number,
    isFadeout: boolean
  ) => {
    const cols = Math.ceil(width / GRID_SIZE);
    const rows = Math.ceil(height / GRID_SIZE);

    for (let i = 0; i < cols; i++) {
      const x = i * GRID_SIZE;
      for (let j = 0; j < rows; j++) {
        const y = j * GRID_SIZE;
        const normalizedY = y / height;

        let cellOpacity: number;
        if (isFadeout) {
          const cellFadeoutStart = normalizedY;
          const cellFadeoutProgress = Math.max(0, Math.min(1, (progress - cellFadeoutStart) / 0.3));
          cellOpacity = 1 - cellFadeoutProgress;
        } else {
          const cellAppearStart = normalizedY * 0.8;
          const cellAppearProgress = Math.max(0, Math.min(1, (progress - cellAppearStart) / 0.2));
          cellOpacity = cellAppearProgress;
        }

        if (cellOpacity > 0) {
          const cell = gridCells[i][j];
          ctx.fillStyle = MATRIX_COLORS[cell.colorIndex];
          ctx.globalAlpha = cellOpacity * 0.15;
          ctx.fillText(cell.char, x + GRID_SIZE / 2, y + GRID_SIZE / 2);
        }
      }
    }
  }, []);

  const initColumns = useCallback((width: number) => {
    const totalColumns = Math.floor(width / GRID_SIZE);
    const activeColumnCount = Math.floor(totalColumns * 0.6);
    const newColumns: MatrixColumn[] = [];
    const selectedIndices = new Set<number>();
    while (selectedIndices.size < activeColumnCount) {
      selectedIndices.add(Math.floor(Math.random() * totalColumns));
    }

    const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);

    sortedIndices.forEach((i, index) => {
      const rainCount = Math.floor(Math.random() * 2) + 2;

      for (let rainIndex = 0; rainIndex < rainCount; rainIndex++) {
        const length = Math.floor(Math.random() * 25) + 15;
        const chars: string[] = [];
        for (let k = 0; k < length; k++) {
          chars.push(getRandomChar(MATRIX_CHARS));
        }

        newColumns.push({
          x: i * GRID_SIZE + GRID_SIZE / 2,
          y: -length * FONT_SIZE - rainIndex * (length * FONT_SIZE + 100),
          speed: Math.random() * 4 + 4,
          length,
          startDelay: index * 20 + rainIndex * 50,
          chars,
        });
      }
    });

    columnsRef.current = newColumns;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.font = `${FONT_SIZE}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initColumns(canvas.width);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gridCells = getGridCells(canvas.width, canvas.height);

    const renderBackgroundLayer = (elapsed: number) => {
      if (elapsed < 1500) {
        const darkenProgress = Math.min(elapsed / 1500, 1);
        ctx.fillStyle = `rgba(0, 0, 0, ${darkenProgress})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
      if (elapsed < 2000) {
        const recoveryProgress = (elapsed - 1500) / 500;
        const recoveryOpacity = 1 - recoveryProgress;
        ctx.fillStyle = `rgba(0, 0, 0, ${recoveryOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
      if (elapsed >= RECOVERY_START_TIME && elapsed < RECOVERY_START_TIME + RECOVERY_DURATION) {
        const finalRecoveryProgress = Math.min((elapsed - RECOVERY_START_TIME) / RECOVERY_DURATION, 1);
        const finalRecoveryOpacity = 1 - finalRecoveryProgress;
        ctx.fillStyle = `rgba(0, 0, 0, ${finalRecoveryOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
      if (elapsed < RECOVERY_START_TIME) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    const renderGridLayer = (elapsed: number) => {
      if (elapsed >= 2000 && elapsed < 3500) {
        const gridProgress = Math.min((elapsed - 2000) / 1500, 1);
        renderGrid(ctx, canvas.width, canvas.height, gridCells, gridProgress, false);
        return;
      }
      if (elapsed >= 3500 && elapsed < 4500) {
        const fadeoutProgress = Math.min((elapsed - 3500) / 1000, 1);
        renderGrid(ctx, canvas.width, canvas.height, gridCells, fadeoutProgress, true);
        return;
      }
      if (elapsed >= FADEOUT_START_TIME && elapsed < FADEOUT_START_TIME + 1500) {
        const gridProgress = Math.min((elapsed - FADEOUT_START_TIME) / 1500, 1);
        renderGrid(ctx, canvas.width, canvas.height, gridCells, gridProgress, false);
        return;
      }
      if (elapsed >= FADEOUT_START_TIME + 1500 && elapsed < RECOVERY_START_TIME) {
        const fadeoutProgress = Math.min((elapsed - (FADEOUT_START_TIME + 1500)) / 1000, 1);
        renderGrid(ctx, canvas.width, canvas.height, gridCells, fadeoutProgress, true);
      }
    };

    const computeFadeoutOpacity = (elapsed: number): number => {
      if (elapsed < FADEOUT_START_TIME) return 1;
      return Math.max(0, 1 - (elapsed - FADEOUT_START_TIME) / FADEOUT_DURATION);
    };

    const renderRainChars = (
      column: any,
      rainElapsed: number,
      fadeoutOpacity: number
    ): void => {
      if (rainElapsed < column.startDelay) return;

      const chars = column.chars;
      const length = column.length;

      for (let charIndex = 0; charIndex < length; charIndex++) {
        const y = column.y + charIndex * FONT_SIZE;
        if (y <= -50 || y >= canvas.height) continue;

        const positionInColumn = charIndex / length;
        const isHead = charIndex === length - 1;
        const tailBrightness =
          positionInColumn > 0.3 ? (positionInColumn - 0.3) / 0.7 : 0;
        const brightness = isHead ? 1 : Math.min(tailBrightness, 1);
        const colorIndex = Math.floor(brightness * (MATRIX_COLORS.length - 1));

        ctx.fillStyle = MATRIX_COLORS[colorIndex] || MATRIX_COLORS[MATRIX_COLORS.length - 1];
        ctx.globalAlpha = brightness * 0.7 * fadeoutOpacity;
        ctx.fillText(chars[charIndex], column.x, y);
      }
    };

    const renderRainColumns = (rainElapsed: number, fadeoutOpacity: number): void => {
      const columns = columnsRef.current;

      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        if (rainElapsed < column.startDelay) continue;

        renderRainChars(column, rainElapsed, fadeoutOpacity);

        column.y += column.speed;
        const overflowY = canvas.height + column.length * FONT_SIZE;
        if (column.y > overflowY) {
          column.y = -column.length * FONT_SIZE - Math.random() * 200;
          for (let k = 0; k < column.length; k++) {
            column.chars[k] = getRandomChar(MATRIX_CHARS);
          }
        }
      }
    };

    const renderRainLayer = (elapsed: number) => {
      if (elapsed < RAIN_START_TIME) return;

      if (phase !== 'rain') setPhase('rain');

      const rainElapsed = elapsed - RAIN_START_TIME;
      const fadeoutOpacity = computeFadeoutOpacity(elapsed);
      renderRainColumns(rainElapsed, fadeoutOpacity);
    };

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= TOTAL_DURATION) {
        setTheme(previousThemeRef.current);
        onClose();
        return;
      }

      renderBackgroundLayer(elapsed);
      renderGridLayer(elapsed);
      renderRainLayer(elapsed);

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, onClose, getGridCells, renderGrid, initColumns, setTheme, MATRIX_CHARS, MATRIX_COLORS, GRID_SIZE, FONT_SIZE, TOTAL_DURATION, RAIN_START_TIME, FADEOUT_START_TIME, FADEOUT_DURATION, RECOVERY_START_TIME, RECOVERY_DURATION, effectTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        backgroundColor: 'transparent',
        mixBlendMode: 'screen',
      }}
    />
  );
};

export { MatrixEffect };
