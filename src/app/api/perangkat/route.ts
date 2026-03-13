import { NextResponse } from 'next/server';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const globalSearch = searchParams.get('globalSearch');
  const gradePath = searchParams.get('gradePath');
  const catFolder = searchParams.get('catFolder');
  const isGlobal = searchParams.get('isGlobal') === 'true';

  // @ts-ignore - Cloudflare R2 Binding
  const R2_BINDING = process.env.R2_BUCKET as any;

  // 1. TRY USING CLOUDFLARE NATIVE BINDING (PRO)
  if (R2_BINDING && typeof R2_BINDING !== 'string') {
    try {
      if (globalSearch) {
        const list = await R2_BINDING.list();
        const results = list.objects
          .filter((obj: any) => obj.key.toLowerCase().includes(globalSearch.toLowerCase()))
          .map((obj: any) => ({
            name: obj.key.split('/').pop(),
            size: obj.size,
            ext: '.' + obj.key.split('.').pop()?.toLowerCase(),
            directPath: obj.key
          }));
        return NextResponse.json({ files: results });
      }

      if (catFolder) {
        let prefix = isGlobal ? `${catFolder}/` : `${gradePath}/${gradePath}/${catFolder}/`;
        const list = await R2_BINDING.list({ prefix, delimiter: '/' });
        
        const files = list.objects
          .filter((obj: any) => obj.key !== prefix)
          .map((obj: any) => ({
            name: obj.key.replace(prefix, ""),
            size: obj.size,
            ext: '.' + obj.key.split('.').pop()?.toLowerCase(),
          }));

        return NextResponse.json({ files, path: prefix });
      }
    } catch (error: any) {
      console.error("Native R2 Error:", error);
    }
  }

  // 2. FALLBACK TO S3 API (For Local Dev or if Binding fails)
  const isR2Enabled = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY;
  if (isR2Enabled) {
    try {
      if (globalSearch) {
        const command = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME });
        const { Contents } = await r2Client.send(command);
        const results = (Contents || [])
          .filter(obj => obj.Key?.toLowerCase().includes(globalSearch.toLowerCase()))
          .map(obj => ({
            name: obj.Key?.split('/').pop(),
            size: obj.Size,
            ext: '.' + obj.Key?.split('.').pop()?.toLowerCase(),
            directPath: obj.Key
          }));
        return NextResponse.json({ files: results });
      }

      if (catFolder) {
        let prefix = isGlobal ? `${catFolder}/` : `${gradePath}/${gradePath}/${catFolder}/`;
        const command = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Prefix: prefix, Delimiter: '/' });
        const { Contents } = await r2Client.send(command);
        const files = (Contents || [])
          .filter(obj => obj.Key !== prefix)
          .map(obj => ({
            name: obj.Key?.replace(prefix, ""),
            size: obj.Size,
            ext: '.' + obj.Key?.split('.').pop()?.toLowerCase(),
          }));
        return NextResponse.json({ files, path: prefix });
      }
    } catch (error: any) {
      console.error("S3 R2 Error:", error);
    }
  }

  return NextResponse.json({ 
    error: 'Penyimpanan tidak tersedia. Pastikan R2_BUCKET binding atau R2 credentials sudah disetel.' 
  }, { status: 503 });
}
