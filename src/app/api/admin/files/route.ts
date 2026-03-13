import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';
import { ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'edge';

// Helper to check auth
async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function GET(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subPath = searchParams.get('path') || '';
  const prefix = subPath ? (subPath.endsWith('/') ? subPath : `${subPath}/`) : '';

  try {
    const isR2Enabled = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY;
    if (!isR2Enabled) {
      return NextResponse.json({ error: 'R2 not configured' }, { status: 500 });
    }

    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/',
    });

    const { Contents, CommonPrefixes } = await r2Client.send(command);

    // Folders
    const folders = (CommonPrefixes || []).map(cp => ({
      name: cp.Prefix?.replace(prefix, "").replace("/", ""),
      isDir: true,
      size: 0,
      ext: '',
    }));

    // Files
    const files = (Contents || [])
      .filter(obj => obj.Key !== prefix)
      .map(obj => ({
        name: obj.Key?.replace(prefix, ""),
        isDir: false,
        size: obj.Size,
        ext: '.' + obj.Key?.split('.').pop()?.toLowerCase(),
      }));

    return NextResponse.json({ items: [...folders, ...files], currentPath: subPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const destPath = formData.get('path') as string;

    if (!file || !destPath) {
      return NextResponse.json({ error: 'File or path missing' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const prefix = destPath ? (destPath.endsWith('/') ? destPath : `${destPath}/`) : '';
    const key = `${prefix}${file.name}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(bytes),
      ContentType: file.type,
    });

    await r2Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return NextResponse.json({ error: 'Path missing' }, { status: 400 });
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filePath,
    });

    await r2Client.send(command);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
