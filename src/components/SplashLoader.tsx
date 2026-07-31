"use client";

import { useEffect, useState } from "react";
import styles from "./SplashLoader.module.css";
import Logo from "./Logo";

export default function SplashLoader() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const timer = setTimeout(() => {
      setFadeOut(true);
      const removeTimer = setTimeout(() => {
        setVisible(false);
      }, 800); // Duration of fadeOut transition
      return () => clearTimeout(removeTimer);
    }, 1500); // Duration to show animated pulsing logo

    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div className={`${styles.overlay} ${fadeOut ? styles.fadeOut : ""}`}>
      <div className={styles.logoWrapper}>
        <Logo size={120} />
      </div>
    </div>
  );
}
