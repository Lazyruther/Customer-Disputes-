'use client';

import { useEffect, useRef, useState } from 'react';

const CURSOR_SIZE = 96;
const EASING = 0.15;

export function CursorTrail() {
  const circleRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number>();
  const targetRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const handleMediaChange = () => {
      setIsEnabled(!mediaQuery.matches);
    };

    handleMediaChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const circle = circleRef.current;
    if (!circle) {
      return;
    }

    const updatePosition = (event: PointerEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
    };

    const initialX = window.innerWidth / 2;
    const initialY = window.innerHeight / 2;
    targetRef.current = { x: initialX, y: initialY };
    positionRef.current = { x: initialX, y: initialY };

    const animate = () => {
      const target = targetRef.current;
      const position = positionRef.current;

      position.x += (target.x - position.x) * EASING;
      position.y += (target.y - position.y) * EASING;

      circle.style.transform = `translate3d(${position.x - CURSOR_SIZE / 2}px, ${position.y - CURSOR_SIZE / 2}px, 0)`;

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);
    window.addEventListener('pointermove', updatePosition);

    return () => {
      window.removeEventListener('pointermove', updatePosition);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={circleRef}
      className="pointer-events-none fixed left-0 top-0 z-50 hidden select-none sm:block"
      style={{
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        transform: `translate3d(-${CURSOR_SIZE / 2}px, -${CURSOR_SIZE / 2}px, 0)`
      }}
    >
      <div
        className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,_rgba(226,232,240,0.4),_rgba(56,189,248,0.15),_rgba(15,23,42,0))] mix-blend-difference opacity-90"
      />
    </div>
  );
}

export default CursorTrail;
