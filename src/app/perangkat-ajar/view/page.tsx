"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../perangkat.module.css";
import { grades, categories } from "../data";
import { Suspense, useState, useEffect, useRef } from "react";
import * as docx from "docx-preview";

function ViewContent() {
  const searchParams = useSearchParams();
  const gradeId = searchParams.get("grade");
  const catId = searchParams.get("cat");
  const directPath = searchParams.get("directPath");

  const [files, setFiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const grade = grades.find(g => g.id === Number(gradeId));
  const category = categories.find(c => c.id === catId);

  useEffect(() => {
    if (directPath) {
      // If directPath is present, we are viewing a single file from global search.
      // Auto-trigger preview
      const fileName = directPath.split('/').pop() || "Document";
      setFiles([{ name: fileName, size: 0, ext: '.' + fileName.split('.').pop() }]);
      setLoading(false);
      setTimeout(() => handlePreview(fileName, directPath), 500);
      return;
    }

    if (category) {
      setLoading(true);
      const isGlobal = (category as any).isGlobal || false;
      const url = isGlobal 
        ? `/api/perangkat?catFolder=${encodeURIComponent(category.folder)}&isGlobal=true`
        : `/api/perangkat?gradePath=${encodeURIComponent(grade?.path || "")}&catFolder=${encodeURIComponent(category.folder)}`;
      
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setFiles(data.files || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [grade, category, directPath]);

  const handlePreview = async (fileName: string, overrideDirectPath?: string) => {
    setPreviewFile(fileName);
    setIsPreviewing(true);
    
    setTimeout(async () => {
      if (previewRef.current && (category || overrideDirectPath || directPath)) {
        try {
          let url = "";
          const targetDirectPath = overrideDirectPath || directPath;

          if (targetDirectPath) {
            url = `/api/perangkat/download?directPath=${encodeURIComponent(targetDirectPath)}&file=${encodeURIComponent(fileName)}`;
          } else {
            const isGlobal = (category as any).isGlobal || false;
            url = isGlobal
              ? `/api/perangkat/download?catFolder=${encodeURIComponent(category!.folder)}&file=${encodeURIComponent(fileName)}&isGlobal=true`
              : `/api/perangkat/download?gradePath=${encodeURIComponent(grade?.path || "")}&catFolder=${encodeURIComponent(category!.folder)}&file=${encodeURIComponent(fileName)}`;
          }
          
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const isPdf = fileName.toLowerCase().endsWith('.pdf');
          
          if (previewRef.current) {
            previewRef.current.innerHTML = "";
            
            if (isPdf) {
              const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
              const pdfUrl = URL.createObjectURL(blob);
              const iframe = document.createElement('iframe');
              iframe.src = pdfUrl;
              iframe.style.width = '100%';
              iframe.style.height = '80vh';
              iframe.style.border = 'none';
              previewRef.current.appendChild(iframe);
            } else {
              await docx.renderAsync(arrayBuffer, previewRef.current, previewRef.current, {
                className: styles.docxWrapper,
                inWrapper: true,
              });
            }
          }
        } catch (error) {
          console.error("Preview failed:", error);
          if (previewRef.current) {
            previewRef.current.innerHTML = "<p style='color:red; text-align:center;'>Gagal memuat pratinjau dokumen.</p>";
          }
        }
      }
    }, 100);
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!directPath && (!category || (!(category as any).isGlobal && !grade))) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
           <h1 className={styles.title}>Data Tidak Ditemukan</h1>
           <Link href="/perangkat-ajar" className={styles.backButton}>← Kembali ke Dashboard</Link>
        </header>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href={`/perangkat-ajar?grade=${grade?.id || ""}`} className={styles.backButton}>
          ← Kembali ke Dashboard
        </Link>
        <h1 className={styles.title}>
          {directPath ? "Pratinjau Dokumen" : `${category?.title} ${grade?.title || ""}`}
        </h1>
        <p className={styles.subtitle}>
          {directPath ? "Melihat dokumen hasil pencarian global." : "Eksplorasi dokumen kurikulum merdeka terpadu."}
        </p>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Cari nama dokumen..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className={styles.emptyState}>
             <span style={{ display: "block", marginBottom: "1rem" }}>⏳</span>
             Sedang memindai folder dokumen...
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className={styles.fileList}>
            {filteredFiles.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <div className={styles.fileIcon}>
                  {file.ext === '.docx' || file.ext === '.doc' ? '📄' : (file.ext === '.pdf' ? '📕' : '📁')}
                </div>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileMeta}>{formatSize(file.size)} • {file.ext.toUpperCase().replace('.', '')} File</span>
                </div>
                <div className={styles.fileActions}>
                  <button 
                    onClick={() => handlePreview(file.name)}
                    className={styles.previewBtn}
                  >
                    Pratinjau
                  </button>
                  <a 
                    href={directPath
                      ? `/api/perangkat/download?directPath=${encodeURIComponent(directPath)}&file=${encodeURIComponent(file.name)}`
                      : (category as any)?.isGlobal 
                      ? `/api/perangkat/download?catFolder=${encodeURIComponent(category!.folder)}&file=${encodeURIComponent(file.name)}&isGlobal=true`
                      : `/api/perangkat/download?gradePath=${encodeURIComponent(grade?.path || "")}&catFolder=${encodeURIComponent(category!.folder)}&file=${encodeURIComponent(file.name)}`}
                    className={styles.downloadIcon}
                    title="Download"
                    download
                  >
                    ⬇️
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
             <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📭</span>
             {searchQuery ? "Hasil pencarian tidak ditemukan." : "Tidak ada file yang ditemukan."}
          </div>
        )}
        
        <div style={{ marginTop: "4rem", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)", fontSize: "0.85rem", color: "#666" }}>
           <strong>Direktori Sistem:</strong> PERANGKAT AJAR PAI-BP / {directPath ? directPath : `${grade?.path || ""} / ${grade?.path || ""} / ${category?.folder || ""}`}
        </div>
      </main>

      {/* Preview Modal */}
      {isPreviewing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Pratinjau: {previewFile}</h3>
              <button 
                onClick={() => setIsPreviewing(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div className={styles.previewContainer}>
              <div ref={previewRef}>
                <div style={{ textAlign: "center", padding: "5rem" }}>
                   <div className="loader"></div>
                   <p style={{ marginTop: "1rem", color: "#666" }}>Menyiapkan pratinjau dokumen...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PerangkatViewPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Memuat sistem...</div>}>
      <ViewContent />
    </Suspense>
  );
}
