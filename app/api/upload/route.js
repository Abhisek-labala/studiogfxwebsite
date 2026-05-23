import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '../../../lib/auth';

export async function POST(req) {
  try {
    // 1. Verify administrative access
    const session = await auth.verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided in the upload body' }, { status: 400 });
    }

    // 3. Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 5. Generate secure, unique filename
    const originalName = file.name || 'image.jpg';
    const cleanName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
    const ext = path.extname(cleanName) || '.jpg';
    const baseName = path.basename(cleanName, ext);
    const uniqueFileName = `${baseName}_${Date.now()}${ext}`;
    
    const filePath = path.join(uploadsDir, uniqueFileName);

    // 6. Write file asynchronously
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueFileName}`;
    return NextResponse.json({ 
      success: true, 
      url: relativeUrl,
      fileName: uniqueFileName
    });

  } catch (err) {
    console.error('File upload API error:', err);
    return NextResponse.json({ error: 'Internal Server Error during upload' }, { status: 500 });
  }
}
