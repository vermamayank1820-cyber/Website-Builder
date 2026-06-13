"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  /** Render element. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Use the hairline-draw variant instead of the fade-rise. */
  draw?: boolean;
}

/**
 * Fades + rises (or draws, for hairlines) its child the first time it
 * scrolls into view. CSS owns the transition; this only toggles a class,
 * so reduced-motion is handled entirely in meridian.css.
 */
export function Reveal({
  children,
  delay = 0,
  as,
  className = "",
  draw = false,
}: RevealProps) {
  const Tag = as ?? "div";
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  const base = draw ? "m-rule-draw" : "m-reveal";

  return (
    <Tag
      ref={ref}
      className={`${base} ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? ({ "--m-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
