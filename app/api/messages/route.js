import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { auth } from '../../../lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required fields' }, { status: 400 });
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const newMsg = await db.addMessage(body);
    return NextResponse.json({ success: true, message: newMsg });
  } catch (err) {
    console.error('Messages POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth.verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const messages = await db.getMessages();
    return NextResponse.json(messages);
  } catch (err) {
    console.error('Messages GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await auth.verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const body = await req.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const updated = await db.markMessageRead(id, read !== false);
    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: updated });
  } catch (err) {
    console.error('Messages PUT error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth.verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const deleted = await db.deleteMessage(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error('Messages DELETE error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
