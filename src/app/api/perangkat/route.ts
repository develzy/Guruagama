import { NextResponse } from 'next/server';
import localFiles from '@/lib/local-files.json';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const globalSearch = searchParams.get('globalSearch');
  const gradePath = searchParams.get('gradePath'); // e.g. "PAI KELAS 1"
  const catFolder = searchParams.get('catFolder'); // e.g. "MODUL AJAR"
  const isGlobal = searchParams.get('isGlobal') === 'true';

  try {
    let filteredFiles = [];

    if (globalSearch) {
      const query = globalSearch.toLowerCase();
      filteredFiles = localFiles.filter(f => 
        f.name.toLowerCase().includes(query) || 
        f.path.toLowerCase().includes(query)
      );
    } else if (catFolder) {
      const gPath = gradePath?.toLowerCase() || "";
      const cFolder = catFolder.toLowerCase();
      
      filteredFiles = localFiles.filter(f => {
        const p = f.path.toLowerCase();
        if (isGlobal) {
          return p.includes(cFolder);
        }
        // Match both grade and category in path (flexible matching for typos like "MEEngajar")
        return p.includes(gPath) && p.includes(cFolder);
      });
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const files = filteredFiles.map((res: any) => {
      const ext = res.name.includes('.') ? `.${res.name.split('.').pop()}` : '';
      
      return {
        name: res.name,
        size: res.size,
        ext: ext,
        // The URL will be the direct path in public folder
        directPath: `/perangkat-ajar/${res.path}`,
      };
    });

    return NextResponse.json({ 
      files, 
      total: files.length,
      source: 'local'
    });
  } catch (error: any) {
    console.error("Local Files Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
