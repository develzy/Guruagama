import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();

  // Secure admin password
  if (password === 'khulal25') {
    const response = NextResponse.json({ success: true });
    
    // Set a very simple cookie for "session"
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
}

export async function GET() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
