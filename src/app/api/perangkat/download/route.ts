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

  const isR2Enabled = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY;

  if (isR2Enabled) {
    try {
      let key = "";
      if (directPath) {
        key = directPath;
      } else {
        if (!catFolder || !fileName) {
          return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }
        if (isGlobal) {
          key = `${catFolder}/${fileName}`;
        } else {
          if (!gradePath) return NextResponse.json({ error: 'Missing grade path' }, { status: 400 });
          key = `${gradePath}/${gradePath}/${catFolder}/${fileName}`;
        }
      }

      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      const response = await r2Client.send(command);
      const data = await response.Body?.transformToByteArray();

      if (!data) {
        return NextResponse.json({ error: 'File empty' }, { status: 404 });
      }

      const safeFileName = fileName || key.split('/').pop() || 'document';
      const contentType = safeFileName.toLowerCase().endsWith('.pdf') 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      return new NextResponse(data as any, {
        headers: {
          'Content-Disposition': `attachment; filename="${safeFileName}"`,
          'Content-Type': contentType,
        },
      });
    } catch (error: any) {
      console.error("R2 Download Error:", error);
      return NextResponse.json({ error: "Gagal mendownload file dari cloud." }, { status: 500 });
    }
  }

  return NextResponse.json({ 
    error: 'Penyimpanan lokal tidak tersedia di Cloudflare. Harap gunakan R2.' 
  }, { status: 503 });
}
