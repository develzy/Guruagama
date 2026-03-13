import { NextResponse } from 'next/server';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gradePath = searchParams.get('gradePath');
  const catFolder = searchParams.get('catFolder');
  const fileName = searchParams.get('file');
  const isGlobal = searchParams.get('isGlobal') === 'true';
  const directPath = searchParams.get('directPath');

  // @ts-ignore - Cloudflare R2 Binding
  const R2_BINDING = process.env.R2_BUCKET;

  let key = directPath || (isGlobal ? `${catFolder}/${fileName}` : `${gradePath}/${gradePath}/${catFolder}/${fileName}`);
  const safeFileName = fileName || key.split('/').pop() || 'document';
  const contentType = safeFileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  // 1. TRY USING CLOUDFLARE NATIVE BINDING (PRO)
  if (R2_BINDING) {
    try {
      const obj = await R2_BINDING.get(key);
      if (obj) {
        const data = await obj.arrayBuffer();
        return new NextResponse(data, {
          headers: {
            'Content-Disposition': `attachment; filename="${safeFileName}"`,
            'Content-Type': contentType,
          },
        });
      }
    } catch (error: any) {
      console.error("Native R2 Download Error:", error);
    }
  }

  // 2. FALLBACK TO S3 API
  const isR2Enabled = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY;
  if (isR2Enabled) {
    try {
      const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
      const response = await r2Client.send(command);
      const data = await response.Body?.transformToByteArray();
      if (data) {
        return new NextResponse(data as any, {
          headers: {
            'Content-Disposition': `attachment; filename="${safeFileName}"`,
            'Content-Type': contentType,
          },
        });
      }
    } catch (error: any) {
      console.error("S3 R2 Download Error:", error);
    }
  }

  return NextResponse.json({ error: 'File tidak tersedia.' }, { status: 404 });
}
