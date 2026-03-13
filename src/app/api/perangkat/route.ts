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
      expression = `folder:"guru-agama/*" AND ${globalSearch}`;
    } else if (catFolder) {
      const folderPrefix = isGlobal 
        ? `guru-agama/${catFolder}` 
        : `guru-agama/${gradePath}/${gradePath}/${catFolder}`;
      
      // We search for both exact folder and its subfolders
      expression = `folder:"${folderPrefix}" OR folder:"${folderPrefix}/*"`;
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const data = await fetchCloudinary(expression);
    
    // Debug log to see what's happening (check Cloudflare Logs)
    console.log("Cloudinary Search Expression:", expression);
    console.log("Cloudinary Result Count:", data.total_count || 0);

    const files = (data.resources || []).map((res: any) => {
      const fullPublicId = res.public_id;
      const fileNameWithExt = fullPublicId.split('/').pop();
      const format = res.format || (fileNameWithExt.includes('.') ? fileNameWithExt.split('.').pop() : 'raw');
      
      return {
        name: fileNameWithExt + (fileNameWithExt.includes('.') ? '' : `.${format}`),
        size: res.bytes,
        ext: `.${format}`,
        directPath: res.secure_url,
      };
    });

    return NextResponse.json({ files, path: expression, total: data.total_count });
  } catch (error: any) {
    console.error("Cloudinary Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
