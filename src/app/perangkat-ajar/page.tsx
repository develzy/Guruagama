"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./perangkat.module.css";
import { grades, categories } from "./data";

function PerangkatAjarContent() {
  const searchParams = useSearchParams();
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const gradeParam = searchParams.get("grade");
    if (gradeParam) {
      setSelectedGradeId(Number(gradeParam));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceReq = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/perangkat?globalSearch=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.files || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceReq);
  }, [searchQuery]);

  const selectedGrade = grades.find(g => g.id === selectedGradeId);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Kembali ke Beranda
        </Link>
        <h1 className={styles.title}>Perangkat Ajar PAI-BP</h1>
        <p className={styles.subtitle}>Pilih tingkat kelas di bawah ini untuk membuka dokumen kurikulum merdeka.</p>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: "3rem" }}>
          <input 
            type="text" 
            placeholder="Cari dokumen, rpp, silabus di semua kelas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "1.25rem 1.5rem", borderRadius: "1rem",
              border: "1px solid rgba(229, 201, 127, 0.3)",
              background: "rgba(0,0,0,0.2)", color: "#fff",
              fontSize: "1rem", transition: "all 0.3s ease"
            }}
          />
        </div>

        {searchQuery.trim() ? (
          <section className={`${styles.contentWrapper}`} style={{ marginTop: 0 }}>
            <h2 className={styles.gradeTitle}>
              Hasil Pencarian: &quot;{searchQuery}&quot;
            </h2>
            {isSearching ? (
              <p>Mencari dokumen...</p>
            ) : searchResults.length > 0 ? (
              <ul className={styles.fileList} style={{ listStyle: "none", padding: 0 }}>
                {searchResults.map((file, i) => (
                  <li key={i} className={styles.fileItem} style={{ background: "rgba(255,255,255,0.02)", marginBottom: "1rem", padding: "1.5rem", borderRadius: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className={styles.fileIcon} style={{ marginRight: "1rem" }}>{file.ext === '.pdf' ? '📕' : '📄'}</span>
                      <span className={styles.fileName} style={{ fontWeight: 600 }}>{file.name}</span>
                      <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "0.5rem", marginLeft: "2.5rem" }}>
                        Lokasi: {file.directPath.split('/').slice(0, -1).join(' / ')}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <a 
                        href={`/perangkat-ajar/view?directPath=${encodeURIComponent(file.directPath)}`} 
                        className={styles.downloadBtn}
                        style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.5rem", textDecoration: "none" }}
                      >
                        👁️ Lihat
                      </a>
                      <a 
                        href={`/api/perangkat/download?directPath=${encodeURIComponent(file.directPath)}&file=${encodeURIComponent(file.name)}`} 
                        download
                        className={styles.downloadBtn}
                        style={{ background: "var(--accent)", color: "#000", padding: "0.5rem 1rem", borderRadius: "0.5rem", textDecoration: "none", fontWeight: 600 }}
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                Tidak ada dokumen yang sesuai dengan pencarian Anda.
              </div>
            )}
          </section>
        ) : (
          <>
            <div className={styles.tabContainer}>
              {grades.map(grade => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGradeId(grade.id)}
                  className={`${styles.tab} ${selectedGradeId === grade.id ? styles.tabActive : ""}`}
                >
                  {grade.title}
                </button>
              ))}
            </div>

            {selectedGrade ? (
              <section key={selectedGrade.id} className={`${styles.gradeSection} ${styles.contentWrapper}`}>
                <h2 className={styles.gradeTitle}>
                  Folder Terbuka: {selectedGrade.title}
                </h2>
                <div className={styles.categoryGrid}>
                  {categories.filter(c => !(c as any).isGlobal).map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/perangkat-ajar/view?grade=${selectedGrade.id}&cat=${cat.id}`}
                      className={styles.card}
                    >
                      <div className={styles.iconWrapper}>
                        {cat.icon}
                      </div>
                      <div className={styles.cardContent}>
                        <h3>{cat.title}</h3>
                        <p>Akses dokumen {cat.title} untuk {selectedGrade.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : (
              <div className={styles.emptyState}>
                 <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "1.5rem", filter: "sepia(1) saturate(2) hue-rotate(5deg)", opacity: 0.5 }}>📂</span>
                 Silakan pilih salah satu kelas di atas untuk menampilkan perangkat ajar.
              </div>
            )}

            <section style={{ marginTop: "6rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4rem" }}>
               <h2 className={styles.gradeTitle} style={{ fontSize: "1rem", opacity: 0.6, marginBottom: "1.5rem" }}>Sumber Daya Global</h2>
               <div className={styles.categoryGrid}>
                  {categories.filter(c => (c as any).isGlobal).map(cat => (
                    <Link 
                      key={cat.id} 
                      href={`/perangkat-ajar/view?cat=${cat.id}`}
                      className={styles.card}
                      style={{ background: "rgba(229, 201, 127, 0.05)", borderColor: "rgba(229, 201, 127, 0.2)" }}
                    >
                      <div className={styles.iconWrapper}>
                        {cat.icon}
                      </div>
                      <div className={styles.cardContent}>
                        <h3>{cat.title}</h3>
                        <p>Template administrasi penilaian PAI-BP.</p>
                      </div>
                    </Link>
                  ))}
               </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function PerangkatAjarPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Memuat Dashboard...</div>}>
      <PerangkatAjarContent />
    </Suspense>
  );
}
