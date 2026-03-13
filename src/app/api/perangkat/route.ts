import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

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
          // Mimic the double nested local structure for compatibility during migration
          prefix = `${gradePath}/${gradePath}/${catFolder}/`;
        }

        const command = new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          Prefix: prefix,
          Delimiter: '/',
        });

        const { Contents } = await r2Client.send(command);
        const files = (Contents || [])
          .filter(obj => obj.Key !== prefix) // Remove the folder/prefix itself if it appears
          .map(obj => ({
            name: obj.Key?.replace(prefix, ""),
            size: obj.Size,
            ext: '.' + obj.Key?.split('.').pop()?.toLowerCase(),
          }));

        return NextResponse.json({ files, path: prefix });
      }
    } catch (error: any) {
      console.error("R2 Error:", error);
      // If R2 fails and we are local, we might want to still try FS? 
      // But for "Professional" we better show the error or fallback.
    }
  }

  // FALLBACK TO LOCAL FILESYSTEM (For Local Dev)
  const basePath = path.join(process.cwd(), 'PERANGKAT AJAR PAI-BP');

  if (globalSearch) {
    const results: any[] = [];
    const walkSync = (dir: string, relPath: string = '') => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const relativePath = relPath ? `${relPath}/${file}` : file;
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          walkSync(fullPath, relativePath);
        } else {
          if (file.toLowerCase().includes(globalSearch.toLowerCase())) {
            results.push({
              name: file,
              size: stats.size,
              ext: path.extname(file).toLowerCase(),
              directPath: relativePath
            });
          }
        }
      }
    };
    try {
      walkSync(basePath);
      return NextResponse.json({ files: results });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (!catFolder) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  let fullPath;
  if (isGlobal) {
    fullPath = path.join(basePath, catFolder);
  } else {
    if (!gradePath) return NextResponse.json({ error: 'Missing grade path' }, { status: 400 });
    fullPath = path.join(basePath, gradePath, gradePath, catFolder);
  }

  try {
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ files: [], path: fullPath, status: 'Not Found' });
    }

    const items = fs.readdirSync(fullPath);
    const files = items
      .filter(item => {
        const stats = fs.statSync(path.join(fullPath, item));
        return stats.isFile();
      })
      .map(name => ({
        name,
        size: fs.statSync(path.join(fullPath, name)).size,
        ext: path.extname(name).toLowerCase(),
      }));

    return NextResponse.json({ files, path: fullPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
