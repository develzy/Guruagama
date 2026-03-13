import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gradePath = searchParams.get('gradePath');
  const catFolder = searchParams.get('catFolder');
  const fileName = searchParams.get('file');
  const isGlobal = searchParams.get('isGlobal') === 'true';
  const directPath = searchParams.get('directPath');

  const basePath = path.join(process.cwd(), 'PERANGKAT AJAR PAI-BP');
  
  let fullPath;

  if (directPath) {
    fullPath = path.join(basePath, directPath);
  } else {
    if (!catFolder || !fileName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    if (isGlobal) {
      fullPath = path.join(basePath, catFolder, fileName);
    } else {
      if (!gradePath) return NextResponse.json({ error: 'Missing grade path' }, { status: 400 });
      fullPath = path.join(basePath, gradePath, gradePath, catFolder, fileName);
    }
  }

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(fullPath);
  
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  });
}
