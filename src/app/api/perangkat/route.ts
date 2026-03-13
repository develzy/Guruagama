import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const globalSearch = searchParams.get('globalSearch');
  const gradePath = searchParams.get('gradePath');
  const catFolder = searchParams.get('catFolder');
  const isGlobal = searchParams.get('isGlobal') === 'true';

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
    // Double nested structure: PERANGKAT AJAR PAI-BP / PAI KELAS 1 / PAI KELAS 1 / MODUL AJAR
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
