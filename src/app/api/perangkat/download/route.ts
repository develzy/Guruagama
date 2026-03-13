import { NextResponse } from 'next/server';

export const runtime = 'edge';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gradePath = searchParams.get('gradePath');
  const catFolder = searchParams.get('catFolder');
  const fileName = searchParams.get('file');
  const isGlobal = searchParams.get('isGlobal') === 'true';
  const directPath = searchParams.get('directPath');

  // If we already have a direct URL from the search, we can just redirect or proxy it.
  if (directPath) {
    return NextResponse.redirect(directPath);
  }

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
  }

  try {
    const publicId = isGlobal 
      ? `perangkat/${catFolder}/${fileName?.split('.')[0]}` 
      : `perangkat/${gradePath}/${gradePath}/${catFolder}/${fileName?.split('.')[0]}`;

    // Get resource details to find the exact secure URL if needed, 
    // or just construct it if we know the format.
    // Cloudinary URLs usually follow: https://res.cloudinary.com/cloud_name/raw/upload/v1/public_id
    
    // For simplicity, we can search for the specific file
    const auth = btoa(`${API_KEY}:${API_SECRET}`);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression: `public_id:"${publicId}"`,
        max_results: 1,
      }),
    });

    const data = await res.json();
    const fileData = data.resources?.[0];

    if (!fileData) {
      return NextResponse.json({ error: 'File tidak ditemukan di Cloudinary.' }, { status: 404 });
    }

    return NextResponse.redirect(fileData.secure_url);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
