import Link from "next/link";
import styles from "../perangkat-ajar/perangkat.module.css";

export default function DokumentasiPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Kembali ke Beranda
        </Link>
        <h1 className={styles.title}>Dokumentasi Sistem</h1>
        <p className={styles.subtitle}>Panduan lengkap penggunaan aplikasi Guru Agama dan Ringkasan Arsitektur Digital.</p>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", width: "100%", paddingBottom: "5rem" }}>
        <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "2rem", padding: "3rem", marginBottom: "3rem" }}>
          <h2 style={{ color: "var(--accent)", marginBottom: "1.5rem", fontFamily: "var(--font-marcellus), serif" }}>Cara Menggunakan Aplikasi</h2>
          <div style={{ color: "#aaa", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "1rem" }}>Aplikasi <strong>Guru Agama</strong> dirancang untuk memudahkan manajemen administrasi Guru PAI-BP. Berikut langkah-langkah utamanya:</p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: "1rem" }}>✅ <strong>Akses Perangkat Ajar:</strong> Pilih kelas melalui tab yang tersedia, lalu pilih kategori dokumen (Modul Ajar, ATP, dll).</li>
              <li style={{ marginBottom: "1rem" }}>🔍 <strong>Pencarian Pintar:</strong> Jika dokumen terlalu banyak, gunakan fitur pencarian untuk menemukan file secara spesifik.</li>
              <li style={{ marginBottom: "1rem" }}>📖 <strong>Pratinjau Langsung:</strong> Anda dapat membaca isi dokumen Microsoft Word langsung di browser tanpa perlu mengunduh terlebih dahulu.</li>
              <li>📥 <strong>Unduh Cepat:</strong> Klik ikon unduh untuk menyimpan salinan dokumen ke perangkat Anda.</li>
            </ul>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "1.5rem", padding: "2rem" }}>
            <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Kurikulum Merdeka</h3>
            <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: "1.6" }}>
              Sistem ini telah dikonfigurasi sepenuhnya untuk mendukung implementasi Kurikulum Merdeka PAI-BP mulai dari Fase A (Kelas 1) hingga Fase C (Kelas 6).
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "1.5rem", padding: "2rem" }}>
            <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Struktur Data</h3>
            <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: "1.6" }}>
              Dokumen disimpan secara terstruktur di dalam folder root <i>PERANGKAT AJAR PAI-BP</i>, memastikan integritas data dan kemudahan sinkronisasi manual.
            </p>
          </div>
        </section>
        <section style={{ marginTop: "5rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4rem" }}>
           <h2 style={{ fontFamily: "var(--font-marcellus), serif", color: "#fff", marginBottom: "1rem" }}>Akses Terbatas</h2>
           <p style={{ color: "#666", maxWidth: "600px", margin: "0 auto", marginBottom: "2rem" }}>
             Halaman pengelolaan file hanya dapat diakses oleh admin sistem untuk menjaga integritas data perangkat ajar.
           </p>
           <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700", border: "1px solid var(--accent)", padding: "0.75rem 2rem", borderRadius: "100px" }}>
              MASUK KE DASHBOARD ADMIN
           </Link>
        </section>
      </main>
    </div>
  );
}
