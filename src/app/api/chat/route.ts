import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key belum dipasang di server.' }, { status: 500 });
    }

    // Google Gemini API expects a different format
    const geminiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: `Anda adalah "AI By Khulal", seorang pakar Pendidikan Agama Islam yang sangat terpelajar, bijaksana, dan memiliki gaya bahasa yang elegan serta intelektual. 
          Aturan penting:
          1. JANGAN mengucapkan salam (Assalamu'alaikum) di setiap jawaban jika percakapan berjalan berkelanjutan. Cukup langsung ke inti jawaban agar lebih efisien dan elegan.
          2. Fokus pada materi PAI (Akidah, Akhlak, Fikih, SKI, Al-Qur'an Hadits).
          3. WAJIB menyertakan dalil dari Al-Qur'an (nama surat dan ayat) atau Hadits (perawi) dalam format Markdown yang indah.
          4. Sangat diutamakan merujuk pada pendapat Ulama Syafi'iyah (seperti Imam Nawawi, Imam Al-Ghazali) dan sebutkan juga pandangan ringkas 4 Mazhab Utama jika relevan.
          5. Gunakan format Markdown yang sangat rapi.` }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || "Gagal mendapatkan respon dari server AI.";
      if (errorMsg.includes("high demand") || errorMsg.includes("503")) {
        return NextResponse.json({ error: "Server AI sedang sangat sibuk. Mohon coba lagi ya, Pak." }, { status: 503 });
      }
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ error: "Format respon AI tidak sesuai." }, { status: 500 });
    }

    return NextResponse.json({ content: data.candidates[0].content.parts[0].text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
