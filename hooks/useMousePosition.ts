"use client";

import { useEffect, useRef, useState } from "react";

export interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition() {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
}

// Smooth lagged mouse follower using requestAnimationFrame
export function useLaggedMousePosition(lag: number = 0.12) {
  const position = useRef<MousePosition>({ x: 0, y: 0 });
  const lagged = useRef<MousePosition>({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const [laggedPos, setLaggedPos] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      position.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      lagged.current.x += (position.current.x - lagged.current.x) * lag;
      lagged.current.y += (position.current.y - lagged.current.y) * lag;
      setLaggedPos({ x: lagged.current.x, y: lagged.current.y });
      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [lag]);

  return laggedPos;
}
