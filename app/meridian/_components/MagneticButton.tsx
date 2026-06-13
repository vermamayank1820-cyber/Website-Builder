"use client";

import { useRef, type ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  href: string;
  variant?: "primary" | "ghost";
  className?: string;
}

const STRENGTH = 0.28;
const MAX_SHIFT = 10;

/**
 * Anchor that subtly leans toward the cursor — the "magnetic" feel used by
 * Linear/Framer. Pointer-driven transform only; pointer-coarse devices and
 * reduced-motion get a plain button (no listeners attached / no movement).
 */
export function MagneticButton({
  children,
  href,
  variant = "primary",
  className = "",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMove(event: React.PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const shiftX = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, x * STRENGTH));
    const shiftY = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, y * STRENGTH));
    el.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
  }

  function reset() {
    const el = ref.current;
    if (el) el.style.transform = "";
  }

  return (
    <a
      ref={ref}
      href={href}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={`m-btn ${variant === "primary" ? "m-btn-primary" : "m-btn-ghost"} ${className}`.trim()}
    >
      {children}
    </a>
  );
}
