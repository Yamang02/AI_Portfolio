/**
 * 컨페티 이펙트 컴포넌트
 */

import React, { useEffect, useRef } from 'react';
import type { EasterEggContext } from '../../model/easter-egg.types';

interface ConfettiEffectProps {
  context: EasterEggContext;
  onClose: () => void;
  /** 지속 시간 (ms, 기본값: 3000) */
  duration?: number;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  context,
  onClose,
  duration = 3000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 컨페티 파티클 생성
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
    }> = [];

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

    // 파티클 생성
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 3,
      });
    }

    // 애니메이션 루프
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // 중력

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 화면 밖으로 나간 파티클 제거
      const activeParticles = particles.filter(
        p => p.y < canvas.height && p.x > -10 && p.x < canvas.width + 10
      );

      if (activeParticles.length === 0) {
        onClose();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 지속 시간 후 자동 종료
    if (duration > 0) {
      const timeout = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(timeout);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [context, onClose, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1000]"
      style={{ zIndex: 1000 }}
    />
  );
};

