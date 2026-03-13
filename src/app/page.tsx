"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import IntroScreen from "./components/IntroScreen";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  // Optional: Check if the intro has been shown in this session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem("hasSeenIntro", "true");
  };

  return (
    <>
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
      <div className={styles.container}>
        <div className={styles.background}></div>
        <main className={styles.main}>
          <div className={styles.badge}>DASHBOARD PENDIDIKAN</div>
          <h1 className={styles.title}>Guru Agama</h1>
          <p className={styles.subtitle}>
            Arsitektur Digital Modern untuk Pendidikan Agama Islam & Budi Pekerti yang Berwibawa.
          </p>

          <div className={styles.cardGrid}>
            <Link href="/perangkat-ajar" className={styles.primaryCard}>
              <div className={styles.cardIcon}>🏛️</div>
              <h2 className={styles.cardTitle}>Gerbang Perangkat Ajar</h2>
              <p className={styles.cardDesc}>
                Eksplorasi kurikulum merdeka, modul ajar, dan administrasi pendidikan dalam satu pintu digital yang eksklusif.
              </p>
              <div className={styles.cardAction}>Masuk ke Vault &rarr;</div>
            </Link>

            <div className={styles.secondaryGrid}>
              <Link href="/profil" className={styles.sideCard}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>👤</div>
                <h3>Profil Pembuat</h3>
                <p>Mengenal lebih dekat Muhammad Lu'lu Khulaluddin.</p>
              </Link>
              <Link href="/dokumentasi" className={styles.sideCard}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📜</div>
                <h3>Dokumentasi</h3>
                <p>Panduan sistem & arsitektur.</p>
              </Link>
              <Link href="/chat-ai" className={styles.sideCard}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🤖</div>
                <h3>Tanya AI</h3>
                <p>Asisten PAI cerdas.</p>
              </Link>
              <Link href="/ekosistem" className={styles.sideCard}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🌐</div>
                <h3>Ekosistem</h3>
                <p>Jaringan data terpadu.</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
