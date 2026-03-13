"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./chat.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Assalamu'alaikum Bapak/Ibu! Saya asisten PAI cerdas Anda. Ada yang bisa saya bantu terkait materi agama atau administrasi hari ini?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setError(null);
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
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
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: "0.9rem" }}>
          ← Beranda
        </Link>
        <div className={styles.title}>Tanya AI PAI</div>
        <div style={{ width: "60px" }}></div>
      </header>

      <main className={styles.chatBox}>
        <div className={styles.messages}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'assistant' ? styles.aiMessageWrapper : ''}`}>
              <div className={styles.messageContent}>
                <div className={`${styles.messageRole} ${msg.role === 'user' ? styles.messageRoleUser : ''}`}>
                  {msg.role === 'assistant' ? (
                    <>
                      <div className={styles.messageAvatar}>AI</div>
                      Asisten PAI Khulal
                    </>
                  ) : (
                    <>
                      <div className={`${styles.messageAvatar} ${styles.messageAvatarUser}`}>You</div>
                      Anda
                    </>
                  )}
                </div>
                
                <div className={styles.messageText}>
                  {msg.role === 'assistant' ? (
                    <div className={styles.markdownFormat}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                        <button 
                          onClick={() => handleCopy(msg.content, idx)}
                          className={styles.copyBtn}
                          title="Salin ke Clipboard"
                        >
                          {copiedIndex === idx ? "✓ Tersalin" : "📋 Salin Kutipan"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={styles.typing}>
              AI sedang menyusun jawaban terbaik...
            </div>
          )}
          {error && (
            <div style={{ color: "#ef4444", textAlign: "center", padding: "1rem", fontSize: "0.8rem", background: "rgba(239, 68, 68, 0.1)" }}>
              ⚠️ {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputArea} onSubmit={handleSend}>
          <div className={styles.inputWrapper}>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Tanyakan materi agama atau administrasi ke AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className={styles.sendBtn} disabled={isTyping || !input.trim()}>
              {isTyping ? "⏳" : "↑"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
