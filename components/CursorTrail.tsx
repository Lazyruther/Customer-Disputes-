'use client';

import { useEffect, useRef } from 'react';

const CURSOR_SIZE = 96;
const EASING = 0.18;

const CursorTrail = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number>();
  const targetRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || typeof window === 'undefined') {
      return;
    }

    const updateInitialPosition = () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      targetRef.current = { x: centerX, y: centerY };
      positionRef.current = { x: centerX, y: centerY };
      cursor.style.transform = `translate3d(${centerX - CURSOR_SIZE / 2}px, ${centerY - CURSOR_SIZE / 2}px, 0)`;
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
    };

    const animate = () => {
      const { x: targetX, y: targetY } = targetRef.current;
      const { x, y } = positionRef.current;

      positionRef.current.x = x + (targetX - x) * EASING;
      positionRef.current.y = y + (targetY - y) * EASING;

      cursor.style.transform = `translate3d(${positionRef.current.x - CURSOR_SIZE / 2}px, ${
        positionRef.current.y - CURSOR_SIZE / 2
      }px, 0)`;

      frameRef.current = window.requestAnimationFrame(animate);
    };

    updateInitialPosition();
    frameRef.current = window.requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', updateInitialPosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateInitialPosition);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-50 hidden h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.blue.500),theme(colors.purple.500))] opacity-30 blur-2xl mix-blend-difference will-change-[transform] md:block"
      style={{ transform: `translate3d(-${CURSOR_SIZE / 2}px, -${CURSOR_SIZE / 2}px, 0)` }}
      aria-hidden
    />
  );
};

export default CursorTrail;
