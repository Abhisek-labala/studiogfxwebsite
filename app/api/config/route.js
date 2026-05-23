import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { auth } from '../../../lib/auth';

export async function GET() {
  try {
    const config = db.getConfig();
    return NextResponse.json(config);
  } catch (err) {
    console.error('Config GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Enforce administrative session validation
    const session = await auth.verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const body = await req.json();
    const updated = db.updateConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (err) {
    console.error('Config POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
