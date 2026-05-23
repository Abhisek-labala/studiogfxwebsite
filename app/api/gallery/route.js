import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { auth } from '../../../lib/auth';

export async function GET() {
  try {
    const gallery = await db.getGallery();
    return NextResponse.json(gallery);
  } catch (err) {
    console.error('Gallery GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth.verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const newItem = await db.addGalleryItem(body);
    return NextResponse.json({ success: true, item: newItem });
  } catch (err) {
    console.error('Gallery POST error:', err);
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
      return NextResponse.json({ error: 'Gallery item ID is required' }, { status: 400 });
    }

    const deleted = await db.deleteGalleryItem(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error('Gallery DELETE error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
