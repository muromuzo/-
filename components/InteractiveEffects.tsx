'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveEffects() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const glow = glowRef.current;
    const dot = dotRef.current;
    if (!glow || !dot) return;

    let rafId = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const render = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      glow.style.transform = `translate3d(${currentX - 90}px, ${currentY - 90}px, 0)`;
      dot.style.transform = `translate3d(${targetX - 5}px, ${targetY - 5}px, 0)`;
      rafId = window.requestAnimationFrame(render);
    };

    const show = () => {
      glow.style.opacity = '1';
      dot.style.opacity = '1';
      if (!rafId) rafId = window.requestAnimationFrame(render);
    };

    const hide = () => {
      glow.style.opacity = '0';
      dot.style.opacity = '0';
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      show();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', show, { passive: true });
    document.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', show);
      document.removeEventListener('mouseleave', hide);
      window.removeEventListener('blur', hide);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
