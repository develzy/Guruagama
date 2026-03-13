import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'edge';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function GET(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const subPath = searchParams.get('path') || 'guru-agama';

  try {
    const auth = btoa(`${API_KEY}:${API_SECRET}`);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression: `folder:"${subPath}/*"`,
        max_results: 100,
      }),
    });

    const data = await response.json();
    
    const items = (data.resources || []).map((res: any) => ({
      name: res.public_id.split('/').pop(),
      isDir: false,
      size: res.bytes,
      ext: `.${res.format}`,
      public_id: res.public_id
    }));

    return NextResponse.json({ items, currentPath: subPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const destPath = formData.get('path') as string;

    if (!file || !destPath) {
      return NextResponse.json({ error: 'File or path missing' }, { status: 400 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = destPath;
    
    const signature = await generateSignature(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', folder);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('api_key', API_KEY!);
    uploadFormData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
      method: 'POST',
      body: uploadFormData,
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateSignature(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function DELETE(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get('path');

  if (!publicId) return NextResponse.json({ error: 'Public ID missing' }, { status: 400 });

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', API_KEY!);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/destroy`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
