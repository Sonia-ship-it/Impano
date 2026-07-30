"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const [hidden, setHidden] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [isTouch, setIsTouch] = useState(false);

  // Position references
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect touch device
    const touchCheck = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(touchCheck);
    if (touchCheck) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setHidden(false);
    };

    const handleMouseLeave = () => {
      setHidden(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Find clickable parents or dataset triggers
      const interactive = target.closest("a, button, [role='button'], input[type='submit'], .clickable");
      const cursorData = target.closest("[data-cursor]");

      if (interactive) {
        setHovered(true);
      }
      if (cursorData) {
        const text = cursorData.getAttribute("data-cursor") || "";
        setCursorText(text);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = target.closest("a, button, [role='button'], .clickable");
      const cursorData = target.closest("[data-cursor]");

      if (interactive) {
        setHovered(false);
      }
      if (cursorData) {
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    // Animation Loop for Ring Lerp
    let animationFrameId: number;
    const render = () => {
      // Lerp logic (spring effect)
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isTouch || hidden) return null;

  return (
    <>
      {/* Small dot tracking mouse instantly */}
      <div ref={dotRef} className={styles.cursorDot} />
      
      {/* Larger smooth lerp ring */}
      <div
        ref={ringRef}
        className={`${styles.cursorRing} ${hovered ? styles.hovered : ""} ${
          cursorText ? styles.hasText : ""
        }`}
      >
        {cursorText && <span className={styles.cursorText}>{cursorText}</span>}
      </div>
    </>
  );
}
