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

  // Check if R2 is configured
  const isR2Enabled = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY;

  if (isR2Enabled) {
    try {
      if (globalSearch) {
        const command = new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
        });
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
        let prefix = "";
        if (isGlobal) {
          prefix = `${catFolder}/`;
        } else {
          if (!gradePath) return NextResponse.json({ error: 'Missing grade path' }, { status: 400 });
          prefix = `${gradePath}/${gradePath}/${catFolder}/`;
        }

        const command = new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          Prefix: prefix,
          Delimiter: '/',
        });

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
      console.error("R2 Error:", error);
      return NextResponse.json({ error: "Gagal mengakses penyimpanan cloud (R2)." }, { status: 500 });
    }
  }

  // FALLBACK TO LOCAL FILESYSTEM (Only for local dev environment)
  // On Cloudflare Edge, this part will be skipped or cause an error if triggered.
  // We use a dynamic check to prevent the edge bundle from failing during production execution.
  
  return NextResponse.json({ 
    error: 'Penyimpanan lokal tidak tersedia di Cloudflare. Silakan konfigurasi R2 di Environment Variables.',
    details: 'isR2Enabled: ' + isR2Enabled
  }, { status: 503 });
}
