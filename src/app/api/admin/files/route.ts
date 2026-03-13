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
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const subPath = searchParams.get('path') || '';
  const prefix = subPath ? (subPath.endsWith('/') ? subPath : `${subPath}/`) : '';

  // @ts-ignore
  const R2_BINDING = process.env.R2_BUCKET;

  if (R2_BINDING) {
    const list = await R2_BINDING.list({ prefix, delimiter: '/' });
    const folders = (list.delimitedPrefixes || []).map((p: string) => ({
      name: p.replace(prefix, "").replace("/", ""),
      isDir: true, size: 0, ext: ''
    }));
    const files = (list.objects || [])
      .filter((obj: any) => obj.key !== prefix)
      .map((obj: any) => ({
        name: obj.key.replace(prefix, ""),
        isDir: false, size: obj.size, ext: '.' + obj.key.split('.').pop()
      }));
    return NextResponse.json({ items: [...folders, ...files], currentPath: subPath });
  }

  // S3 Fallback
  const command = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Prefix: prefix, Delimiter: '/' });
  const { Contents, CommonPrefixes } = await r2Client.send(command);
  const folders = (CommonPrefixes || []).map(cp => ({
    name: cp.Prefix?.replace(prefix, "").replace("/", ""),
    isDir: true, size: 0, ext: ''
  }));
  const files = (Contents || []).filter(obj => obj.Key !== prefix).map(obj => ({
    name: obj.Key?.replace(prefix, ""),
    isDir: false, size: obj.Size, ext: '.' + obj.Key?.split('.').pop()
  }));
  return NextResponse.json({ items: [...folders, ...files], currentPath: subPath });
}

export async function POST(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const destPath = formData.get('path') as string;
  const prefix = destPath ? (destPath.endsWith('/') ? destPath : `${destPath}/`) : '';
  const key = `${prefix}${file.name}`;
  const bytes = await file.arrayBuffer();

  // @ts-ignore
  const R2_BINDING = process.env.R2_BUCKET;
  if (R2_BINDING) {
    await R2_BINDING.put(key, bytes, { httpMetadata: { contentType: file.type } });
    return NextResponse.json({ success: true });
  }

  const command = new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, Body: new Uint8Array(bytes), ContentType: file.type });
  await r2Client.send(command);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');
  if (!filePath) return NextResponse.json({ error: 'Path missing' }, { status: 400 });

  // @ts-ignore
  const R2_BINDING = process.env.R2_BUCKET;
  if (R2_BINDING) {
    await R2_BINDING.delete(filePath);
    return NextResponse.json({ success: true });
  }

  const command = new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: filePath });
  await r2Client.send(command);
  return NextResponse.json({ success: true });
}
