import { NextResponse } from 'next/server';

export const runtime = 'edge';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

async function fetchCloudinary(searchQuery: string) {
  const auth = btoa(`${API_KEY}:${API_SECRET}`);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      expression: searchQuery,
      max_results: 100,
    }),
  });
  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const globalSearch = searchParams.get('globalSearch');
  const gradePath = searchParams.get('gradePath');
  const catFolder = searchParams.get('catFolder');
  const isGlobal = searchParams.get('isGlobal') === 'true';

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 });
  }

  try {
    let expression = "";
    if (globalSearch) {
      expression = `folder:perangkat/* AND ${globalSearch}`;
    } else if (catFolder) {
      const folderPrefix = isGlobal 
        ? `perangkat/${catFolder}` 
        : `perangkat/${gradePath}/${gradePath}/${catFolder}`;
      expression = `folder:"${folderPrefix}/*"`;
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const data = await fetchCloudinary(expression);
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const files = (data.resources || []).map((res: any) => ({
      name: res.public_id.split('/').pop(),
      size: res.bytes,
      ext: `.${res.format}`,
      directPath: res.secure_url, // For direct access
    }));

    return NextResponse.json({ files, path: expression });
  } catch (error: any) {
    console.error("Cloudinary Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
