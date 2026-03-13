"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import Link from "next/link";

export default function AdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchItems(currentPath);
  }, [currentPath]);

  const fetchItems = async (path: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/files?path=${encodeURIComponent(path)}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth");
    router.push("/login");
  };

  const navigateTo = (name: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${name}` : name);
  };

  const goBack = () => {
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Hapus ${name}? Tindakan ini tidak bisa dibatalkan.`)) return;
    
    const target = currentPath ? `${currentPath}/${name}` : name;
    const res = await fetch(`/api/admin/files?path=${encodeURIComponent(target)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchItems(currentPath);
    } else {
      alert("Gagal menghapus file");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath);

    try {
      const res = await fetch("/api/admin/files", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        fetchItems(currentPath);
      } else {
        alert("Gagal mengunggah file");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
           <Link href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>← Web Utama</Link>
           <h1 className={styles.title}>File Manager</h1>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Keluar</button>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div className={styles.breadcrumb}>
          <span onClick={() => setCurrentPath("")}>Root</span>
          {currentPath.split("/").map((part, i) => (
            part && (
              <span key={i} onClick={() => {
                const newPath = currentPath.split("/").slice(0, i + 1).join("/");
                setCurrentPath(newPath);
              }}>
                {" / "}{part}
              </span>
            )
          ))}
        </div>

        {currentPath && (
          <button 
            onClick={goBack}
            style={{ marginBottom: "1.5rem", background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}
          >
            📂 .. (Kembali ke folder induk)
          </button>
        )}

        <div className={styles.grid}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", opacity: 0.5 }}>Memuat konten...</div>
          ) : items.length > 0 ? (
            items.map((item, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.itemInfo} onClick={() => item.isDir ? navigateTo(item.name) : null}>
                   <span className={styles.icon}>{item.isDir ? "📂" : (item.ext === '.docx' ? "📄" : "📁")}</span>
                   <div>
                      <div className={styles.name}>{item.name}</div>
                      <div className={styles.meta}>{item.isDir ? "Folder" : `${(item.size / 1024).toFixed(1)} KB`}</div>
                   </div>
                </div>
                <div className={styles.actions}>
                   <button className={styles.deleteBtn} onClick={() => handleDelete(item.name)} title="Hapus">
                      🗑️
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "4rem", border: "1px dashed rgba(255,255,255,0.05)", borderRadius: "1.5rem", color: "#444" }}>
               Folder ini kosong
            </div>
          )}
        </div>

        <section className={styles.uploadSection}>
           <h2 style={{ fontSize: "1.25rem", fontFamily: "var(--font-marcellus), serif" }}>Unggah Dokumen Baru</h2>
           <div className={styles.uploadBox}>
              <input 
                type="file" 
                className={styles.uploadInput} 
                onChange={handleUpload}
                accept=".docx,.pdf,.doc"
                disabled={uploading}
              />
              <div className={styles.uploadTitle}>
                {uploading ? " sedang mengunggah..." : "Klik atau seret file ke sini"}
              </div>
              <p className={styles.uploadSubtitle}>Format yang didukung: .docx, .doc, .pdf</p>
           </div>
           
           <div style={{ background: "rgba(229, 201, 127, 0.05)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(229, 201, 127, 0.1)", fontSize: "0.85rem", color: "var(--accent-light)" }}>
              💡 <b>Tips:</b> Masuklah ke folder <b>PAI KELAS X</b> {`>`} <b>MODUL AJAR</b> untuk menaruh file agar langsung terbaca di halaman publik.
           </div>
        </section>
      </main>
    </div>
  );
}
