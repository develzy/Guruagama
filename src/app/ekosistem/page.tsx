"use client";

import Link from "next/link";
import styles from "../perangkat-ajar/perangkat.module.css";

export default function EkosistemPage() {
  const links = [
    { title: "EMIS GTK", desc: "Sistem Informasi Manajemen Pendidik & Tenaga Kependidikan.", url: "https://emisgtk.kemenag.go.id/" },
    { title: "SIAGA PENDIS", desc: "Aplikasi Guru dan Pengawas PAI (Kemenag).", url: "https://siagapendis.kemenag.go.id/" },
    { title: "PMM (Kemendikdasmen)", desc: "Platform Merdeka Mengajar Kurikulum Merdeka.", url: "https://guru.kemendikdasmen.go.id/" },
    { title: "PASPOR GTK SIMPKB", desc: "Layanan login akun SIMPKB terintegrasi.", url: "https://paspor-gtk.simpkb.id/casgpo/login" },
    { title: "PORTAL SIMPKB", desc: "Portal Layanan Program GTK Kemendikbudristek.", url: "https://portal.simpkb.id/" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Kembali ke Beranda
        </Link>
        <h1 className={styles.title}>Ekosistem Pendidik</h1>
        <p className={styles.subtitle}>Jaringan data terpadu dan portal eksternal pendukung Pendidikan Agama Islam.</p>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", width: "100%", paddingBottom: "5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
           {links.map((link, idx) => (
             <a 
               key={idx} 
               href={link.url} 
               target="_blank" 
               rel="noopener noreferrer" 
               style={{ 
                 background: "rgba(255,255,255,0.02)", 
                 border: "1px solid var(--border-color)", 
                 borderRadius: "1.5rem", 
                 padding: "2rem",
                 textDecoration: "none",
                 transition: "all 0.3s ease",
                 display: "block"
               }}
               onMouseOver={(e) => {
                 e.currentTarget.style.backgroundColor = "rgba(229, 201, 127, 0.05)";
                 e.currentTarget.style.borderColor = "rgba(229, 201, 127, 0.3)";
                 e.currentTarget.style.transform = "translateY(-5px)";
               }}
               onMouseOut={(e) => {
                 e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                 e.currentTarget.style.borderColor = "var(--border-color)";
                 e.currentTarget.style.transform = "translateY(0)";
               }}
             >
               <h3 style={{ color: "#fff", marginBottom: "0.5rem", fontSize: "1.2rem" }}>{link.title}</h3>
               <p style={{ color: "#777", fontSize: "0.9rem", lineHeight: "1.5" }}>{link.desc}</p>
               <div style={{ marginTop: "1.5rem", color: "var(--accent)", fontSize: "0.8rem", fontWeight: "700" }}>KUNJUNGI SITUS ↗</div>
             </a>
           ))}
        </div>

        <section style={{ marginTop: "5rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4rem" }}>
           <h2 style={{ fontFamily: "var(--font-marcellus), serif", color: "#fff", marginBottom: "1rem" }}>Ingin Menambahkan Link?</h2>
           <p style={{ color: "#666", maxWidth: "600px", margin: "0 auto" }}>
             Ekosistem ini akan terus tumbuh. Jika Anda memiliki referensi website penting lainnya untuk Guru Agama, silakan hubungi tim pengembang.
           </p>
        </section>
      </main>
    </div>
  );
}
