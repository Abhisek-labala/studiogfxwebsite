import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { auth } from '../../../lib/auth';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const admin = await db.getAdmin();

    if (username !== admin.username || !auth.comparePassword(password, admin.passwordHash)) {
      return NextResponse.json({ error: 'Invalid administrative credentials' }, { status: 401 });
    }

    const token = auth.signToken({ username: admin.username });
    
    // Set HTTP-Only Cookie
    await auth.setSessionCookie(token);

    return NextResponse.json({ success: true, username: admin.username });
  } catch (err) {
    console.error('Login API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth.verifySession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, username: session.username });
  } catch (err) {
    console.error('Session verify API error:', err);
    return NextResponse.json({ authenticated: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await auth.clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
