"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Send, User, Quote, Sparkles, Moon, Sun, 
  ChevronLeft, FileText, MessageSquare, Book, 
  BrainCircuit, X, Volume2, ShieldCheck
} from 'lucide-react';
import styles from "./chat.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Selamat datang di AI By Khulal. Saya asisten ahli Pendidikan Agama Islam Anda. Silakan ajukan pertanyaan mengenai Fikih, Akidah, atau materi PAI lainnya. Saya akan menjawab dengan landasan dalil dan rujukan madzhab yang relevan." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'rpp' | 'simulasi' | 'ringkas' | null>(null);
  const [toolInput, setToolInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isTyping) return;

    if (!customPrompt) setInput("");
    setError(null);
    
    // Add user message to UI
    const newMessages = [...messages, { role: "user" as const, content: textToSend }];
    setMessages(newMessages);
    
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      } else {
        setError(data.error || "Gagal mendapatkan respon dari AI");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server AI.");
    } finally {
      setIsTyping(false);
      if (activeTool) {
        setActiveTool(null);
        setToolInput("");
      }
    }
  };

  const handleRunTool = () => {
    let prompt = "";
    if (activeTool === 'rpp') {
      prompt = `Buatkan draf Rencana Pelaksanaan Pembelajaran (RPP) yang lengkap dan terstruktur untuk materi PAI kelas menengah/atas tentang: ${toolInput}. Sertakan Tujuan Pembelajaran, Materi, Metode, dan Evaluasi.`;
    } else if (activeTool === 'simulasi') {
      prompt = `Berperanlah sebagai seorang santri yang sedang kritis dan ingin tahu. Ajukan satu pertanyaan yang cukup sulit atau menantang tentang topik: ${toolInput}. Gunakan bahasa yang santun tapi tajam.`;
    } else if (activeTool === 'ringkas') {
      prompt = `Ringkaskan teks kitab berikut ini agar lebih mudah dipahami oleh orang awam tanpa mengurangi esensi hukum atau maknanya: ${toolInput}`;
    }
    
    if (prompt) {
      handleSend(`[Mode: ✨ ${activeTool?.toUpperCase()}]\n\n${prompt}`);
    }
  };

  const handleSpeech = (text: string) => {
    // Current simple implementation using Web Speech API for better compatibility
    // until the backend multimodal TTS is fully set up.
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.substring(0, 1000));
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <Link href="/" className={styles.headerIcon}>
            <ChevronLeft size={20} />
          </Link>
          <div className={styles.headerTitle}>
            <h1>AI By Khulal</h1>
            <div className={styles.headerBadge}>
              <ShieldCheck size={12} />
              <span>Expert Religious System</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <BrainCircuit className={styles.aiGlow} size={24} color="#10b981" />
        </div>
      </header>

      <div className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <span className={styles.sectionLabel}>Guru Tools</span>
            
            <button onClick={() => setActiveTool('rpp')} className={styles.toolButton}>
              <div className={`${styles.toolIcon} ${styles.rpp}`}>
                <FileText size={18} />
              </div>
              <div className={styles.toolInfo}>
                <span className={styles.toolName}>Buat RPP</span>
                <span className={styles.toolDesc}>Draf rencana mengajar</span>
              </div>
            </button>

            <button onClick={() => setActiveTool('simulasi')} className={styles.toolButton}>
              <div className={`${styles.toolIcon} ${styles.simulasi}`}>
                <MessageSquare size={18} />
              </div>
              <div className={styles.toolInfo}>
                <span className={styles.toolName}>Simulasi Santri</span>
                <span className={styles.toolDesc}>Latih respon tanya-jawab</span>
              </div>
            </button>

            <button onClick={() => setActiveTool('ringkas')} className={styles.toolButton}>
              <div className={`${styles.toolIcon} ${styles.ringkas}`}>
                <Book size={18} />
              </div>
              <div className={styles.toolInfo}>
                <span className={styles.toolName}>Ringkas Kitab</span>
                <span className={styles.toolDesc}>Sederhanakan narasi</span>
              </div>
            </button>
          </div>
        </aside>

        <main className={styles.chatBox}>
          <div className={styles.messages}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.messageWrapperUser : ''}`}>
                <div className={`${styles.avatar} ${msg.role === 'assistant' ? styles.avatarAi : styles.avatarUser}`}>
                  {msg.role === 'assistant' ? <Quote size={20} /> : <User size={20} />}
                </div>
                <div className={`${styles.bubble} ${msg.role === 'assistant' ? styles.bubbleAi : styles.bubbleUser}`}>
                  <div className={`${styles.bubbleText} ${msg.role === 'user' ? styles.userText : styles.markdownFormat}`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === 'assistant' && (
                    <button 
                      onClick={() => handleSpeech(msg.content)}
                      className={styles.ttsBtn}
                      title="Dengarkan Jawaban"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className={styles.typingIndicator}>
                <BrainCircuit size={18} className={styles.spin} />
                <span>AI sedang menyusun jawaban terbaik...</span>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            )}
            
            {error && (
              <div style={{ color: "#ef4444", textAlign: "center", padding: "1.5rem", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.05)", borderRadius: "1rem", margin: "1rem" }}>
                ⚠️ {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className={styles.footer}>
            <div className={styles.inputContainer}>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  placeholder="Tanyakan persoalan agama atau gunakan fitur ✨ di samping..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isTyping}
                />
                <button 
                  onClick={() => handleSend()} 
                  className={styles.sendBtn} 
                  disabled={isTyping || !input.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Tool Modal Overlay */}
      {activeTool && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>
                <Sparkles size={18} color="#10b981" />
                {activeTool === 'rpp' ? 'Buat RPP Otomatis' : activeTool === 'simulasi' ? 'Simulasi Dialog Santri' : 'Ringkas Kitab'}
              </h3>
              <button onClick={() => setActiveTool(null)} className={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            <textarea
              className={styles.modalTextarea}
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              placeholder={
                activeTool === 'rpp' ? "Contoh: Materi Thaharah Kelas 7" : 
                activeTool === 'simulasi' ? "Contoh: Mengapa harus sholat?" : 
                "Tempelkan teks kitab di sini..."
              }
            />
            <button 
              onClick={handleRunTool}
              disabled={isTyping || !toolInput.trim()}
              className={styles.modalAction}
            >
              {isTyping ? 'Memproses...' : 'Proses dengan AI ✨'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
