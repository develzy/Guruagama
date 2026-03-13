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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: "Anda adalah Asisten PAI Cerdas by Khulal. Aturan penting: 1. Jangan sapa (Salam) jika percakapan berjalan berkelanjutan. 2. Jawab pertanyaan dengan padat dan jelas. 3. WAJIB sertakan minimal satu Dalil Al-Qur'an (beserta terjemahannya) ATAU Hadits shahih yang relevan dengan pertanyaan. 4. WAJIB sertakan pandangan ringkas/kitab dari 4 Mazhab Utama (Hanafi, Maliki, Syafi'i, Hambali) khusus untuk pertanyaan fiqih/hukum. 5. Gunakan format Markdown yang rapi." }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
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
