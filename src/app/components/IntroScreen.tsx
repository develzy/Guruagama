"use client";

import { useEffect, useState } from "react";
import styles from "./IntroScreen.module.css";

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Total narrative duration ~22 seconds
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 2000); 
    }, 22500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 2000);
  };

  return (
    <div className={`${styles.introOverlay} ${isFadingOut ? styles.outerFade : ""}`}>
      {/* Cinematic Background Layer */}
      <div className={styles.stage}></div>
      <div className={styles.overlay}></div>
      <div className={styles.particles}></div>
      
      <div className={styles.storyContainer}>
        {/* Sequence 1: Greeting */}
        <div className={`${styles.narrativeLine} ${styles.line1}`}>
          <span className={styles.accentWord}>Awal Langkah</span>
          <h2 className={styles.mainWord}>Assalamu'alaikum</h2>
          <p className={styles.subWord}>Membuka pintu dengan keberkahan</p>
        </div>

        {/* Sequence 2: The Core Identity */}
        <div className={`${styles.narrativeLine} ${styles.line2}`}>
          <span className={styles.accentWord}>Karya Digital</span>
          <h2 className={styles.mainWord}>Guru Agama</h2>
          <div className={styles.signatureWrapper}>
            <div className={styles.signatureLine}></div>
            <p className={styles.signatureText}>by Muhammad Khulal</p>
            <div className={styles.signatureLine}></div>
          </div>
          <p className={styles.subWord}>Platform Terpadu Kurikulum PAI-BP</p>
        </div>

        {/* Sequence 3: Final Vision */}
        <div className={`${styles.narrativeLine} ${styles.line3}`}>
          <span className={styles.accentWord}>Didedikasikan Untuk</span>
          <h2 className={styles.mainWord}>Kemajuan Guru</h2>
          <p className={styles.subWord}>Membangun generasi dengan teknologi</p>
        </div>
      </div>

      <button className={styles.skipBtn} onClick={handleSkip}>
        Lewati Perjalanan
      </button>
    </div>
  );
}
