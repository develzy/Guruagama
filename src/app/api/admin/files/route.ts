import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

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

  const basePath = path.join(process.cwd(), 'PERANGKAT AJAR PAI-BP');
  const targetPath = path.join(basePath, subPath);

  try {
    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    const items = fs.readdirSync(targetPath);
    const result = items.map(name => {
      const stats = fs.statSync(path.join(targetPath, name));
      return {
        name,
        isDir: stats.isDirectory(),
        size: stats.size,
        ext: path.extname(name).toLowerCase(),
      };
    });

    return NextResponse.json({ items: result, currentPath: subPath });
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
    const buffer = Buffer.from(bytes);

    const basePath = path.join(process.cwd(), 'PERANGKAT AJAR PAI-BP');
    const fullPath = path.join(basePath, destPath, file.name);

    fs.writeFileSync(fullPath, buffer);

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

  const basePath = path.join(process.cwd(), 'PERANGKAT AJAR PAI-BP');
  const fullPath = path.join(basePath, filePath);

  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if (stats.isFile()) {
        fs.unlinkSync(fullPath);
      } else {
        // Recursive delete for directories is risky, but we can support empty folders
        fs.rmdirSync(fullPath);
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
