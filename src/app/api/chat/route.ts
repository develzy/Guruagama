import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // ERROR 1: Kunci tidak terbaca sama sekali
    if (!apiKey) {
      console.error("DEBUG: GEMINI_API_KEY is missing in environment");
      return NextResponse.json({ 
        error: 'API Key (GEMINI_API_KEY) tidak ditemukan di konfigurasi server Cloudflare Bapak. Mohon pasang di Environment Variables.' 
      }, { status: 500 });
    }

    const geminiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: `Anda adalah "AI By Khulal", asisten PAI profesional. Jawablah dengan bijaksana, sertakan dalil Al-Qur'an/Hadits dan rujukan Madzhab Syafi'i jika relevan.` }]
        },
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      }),
    });

    const data = await response.json();

    // ERROR 2: Respon dari Google tidak OK
    if (!response.ok) {
      const errorMsg = data.error?.message || response.statusText;
      console.error("DEBUG: Google API Error:", errorMsg);
      return NextResponse.json({ 
        error: `Google API Error (${response.status}): ${errorMsg}` 
      }, { status: response.status });
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ error: "Reson AI kosong. Coba tanya lagi." }, { status: 500 });
    }

    return NextResponse.json({ content: data.candidates[0].content.parts[0].text });
  } catch (error: any) {
    console.error("DEBUG: Chat Crash:", error.message);
    return NextResponse.json({ error: `System Error: ${error.message}` }, { status: 500 });
  }
}
