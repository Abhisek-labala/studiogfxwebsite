import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '../../../lib/auth';
import { put } from '@vercel/blob';
import PSD from 'psd';

// Helper to convert PSD buffer to standard PNG buffer entirely in-memory!
async function convertPsdToPngBuffer(psdBuffer) {
  const psd = new PSD(psdBuffer);
  psd.parse();

  if (!psd.image) {
    throw new Error('PSD does not contain a valid flattened preview image');
  }

  const png = psd.image.toPng(); // Returns a compatible pngjs object
  
  return new Promise((resolve, reject) => {
    const chunks = [];
    png.pack()
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', reject);
  });
}

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

    // 4. Extract secure name
    const originalName = file.name || 'image.jpg';
    const cleanName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
    const ext = path.extname(cleanName) || '.jpg';
    const baseName = path.basename(cleanName, ext);

    // DUAL MODE: Check if running on Vercel and Vercel Blob is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      let bufferToUpload = buffer;
      let uploadFileName = `${baseName}_${Date.now()}${ext}`;

      // In Vercel serverless environment, if PSD, convert in memory!
      if (ext.toLowerCase() === '.psd') {
        try {
          bufferToUpload = await convertPsdToPngBuffer(buffer);
          uploadFileName = `${baseName}_${Date.now()}.png`;
        } catch (psdErr) {
          console.error('Failed to convert PSD in memory for Vercel Blob:', psdErr);
        }
      }

      // Upload to Vercel Blob cloud bucket
      const blob = await put(uploadFileName, bufferToUpload, {
        access: 'public',
      });

      return NextResponse.json({ 
        success: true, 
        url: blob.url,
        fileName: uploadFileName
      });
    }

    // LOCAL FALLBACK: If running on Localhost with no Blob Token
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let uploadBuffer = buffer;
    let uniqueFileName = `${baseName}_${Date.now()}${ext}`;

    // Auto-convert PSD to PNG on Localhost in memory!
    if (ext.toLowerCase() === '.psd') {
      try {
        uploadBuffer = await convertPsdToPngBuffer(buffer);
        uniqueFileName = `${baseName}_${Date.now()}.png`;
      } catch (psdErr) {
        console.error('Failed to auto-convert uploaded PSD to PNG locally in memory:', psdErr);
      }
    }

    const filePath = path.join(uploadsDir, uniqueFileName);
    fs.writeFileSync(filePath, uploadBuffer);

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
