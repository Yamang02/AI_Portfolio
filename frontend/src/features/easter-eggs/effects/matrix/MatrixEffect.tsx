import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { EasterEggContext } from '../../model/easter-egg.types';
import { useTheme } from '@shared/providers/ThemeProvider';

interface MatrixEffectProps {
  context: EasterEggContext;
  onClose: () => void;
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

const MATRIX_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const MATRIX_COLORS = ['#00ff00', '#00ff41', '#00ff82', '#00ffc3', '#39ff00', '#39ff41'];
const GRID_SIZE = 30;
const FONT_SIZE = 18;

const getRandomChar = () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
const getRandomColorIndex = () => Math.floor(Math.random() * MATRIX_COLORS.length);

const MatrixEffect: React.FC<MatrixEffectProps> = ({ context: _context, onClose }) => {
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
    if (currentTheme !== 'matrix') {
      previousThemeRef.current = currentTheme as 'light' | 'dark';
      setTheme('matrix');
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
          char: getRandomChar(),
          colorIndex: getRandomColorIndex(),
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
          chars.push(getRandomChar());
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

    const TOTAL_DURATION = 16500;
    const RAIN_START_TIME = 3500;
    const FADEOUT_START_TIME = 13500;
    const FADEOUT_DURATION = 2000;
    const RECOVERY_START_TIME = 16000;
    const RECOVERY_DURATION = 500;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;

      if (elapsed >= TOTAL_DURATION) {
        setTheme(previousThemeRef.current);
        onClose();
        return;
      }

      if (elapsed < 1500) {
        const darkenProgress = Math.min(elapsed / 1500, 1);
        ctx.fillStyle = `rgba(0, 0, 0, ${darkenProgress})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (elapsed < 2000) {
        const recoveryProgress = (elapsed - 1500) / 500;
        const recoveryOpacity = 1 - recoveryProgress;
        ctx.fillStyle = `rgba(0, 0, 0, ${recoveryOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (elapsed >= RECOVERY_START_TIME && elapsed < RECOVERY_START_TIME + RECOVERY_DURATION) {
        const finalRecoveryProgress = Math.min((elapsed - RECOVERY_START_TIME) / RECOVERY_DURATION, 1);
        const finalRecoveryOpacity = 1 - finalRecoveryProgress;
        ctx.fillStyle = `rgba(0, 0, 0, ${finalRecoveryOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (elapsed < RECOVERY_START_TIME) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (elapsed >= 2000 && elapsed < 3500) {
        const gridProgress = Math.min((elapsed - 2000) / 1500, 1);
        renderGrid(ctx, canvas.width, canvas.height, gridCells, gridProgress, false);
      } else if (elapsed >= 3500 && elapsed < 4500) {
        const fadeoutProgress = Math.min((elapsed - 3500) / 1000, 1);
        renderGrid(ctx, canvas.width, canvas.height, gridCells, fadeoutProgress, true);
      } else if (elapsed >= FADEOUT_START_TIME && elapsed < FADEOUT_START_TIME + 1500) {
        const gridProgress = Math.min((elapsed - FADEOUT_START_TIME) / 1500, 1);
        renderGrid(ctx, canvas.width, canvas.height, gridCells, gridProgress, false);
      } else if (elapsed >= FADEOUT_START_TIME + 1500 && elapsed < RECOVERY_START_TIME) {
        const fadeoutProgress = Math.min((elapsed - (FADEOUT_START_TIME + 1500)) / 1000, 1);
        renderGrid(ctx, canvas.width, canvas.height, gridCells, fadeoutProgress, true);
      }

      if (elapsed >= RAIN_START_TIME) {
        if (phase !== 'rain') {
          setPhase('rain');
        }

        const rainElapsed = elapsed - RAIN_START_TIME;

        let fadeoutOpacity = 1;
        if (elapsed >= FADEOUT_START_TIME) {
          const fadeoutProgress = (elapsed - FADEOUT_START_TIME) / FADEOUT_DURATION;
          fadeoutOpacity = Math.max(0, 1 - fadeoutProgress);
        }

        const columns = columnsRef.current;
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];

          if (rainElapsed < column.startDelay) continue;

          const chars = column.chars;
          const length = column.length;
          for (let charIndex = 0; charIndex < length; charIndex++) {
            const y = column.y + charIndex * FONT_SIZE;

            if (y > -50 && y < canvas.height) {
              const positionInColumn = charIndex / length;
              let brightness = 0;
              if (positionInColumn > 0.3) {
                brightness = (positionInColumn - 0.3) / 0.7;
              }
              brightness = Math.min(brightness, 1);

              if (charIndex === length - 1) {
                brightness = 1;
              }

              const colorIndex = Math.floor(brightness * (MATRIX_COLORS.length - 1));
              ctx.fillStyle = MATRIX_COLORS[colorIndex] || MATRIX_COLORS[MATRIX_COLORS.length - 1];
              ctx.globalAlpha = brightness * 0.7 * fadeoutOpacity;
              ctx.fillText(chars[charIndex], column.x, y);
            }
          }

          const actualElapsed = rainElapsed - column.startDelay;
          if (actualElapsed >= 0) {
            column.y += column.speed;
          }

          if (column.y > canvas.height + length * FONT_SIZE) {
            column.y = -length * FONT_SIZE - Math.random() * 200;
            for (let k = 0; k < length; k++) {
              column.chars[k] = getRandomChar();
            }
          }
        }
      }

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
  }, [phase, onClose, getGridCells, renderGrid, initColumns, setTheme]);

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
