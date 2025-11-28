import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, uniqueFileName);

    try {
      // Ensure the uploads directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, buffer);
      const fileUrl = `/uploads/${uniqueFileName}`;
      return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
      console.warn('Filesystem write failed (likely read-only environment). Returning Data URI fallback.', error);
      // Fallback: Return Data URI
      const base64String = buffer.toString('base64');
      const mimeType = file.type || 'application/octet-stream';
      const dataUri = `data:${mimeType};base64,${base64String}`;
      return NextResponse.json({ url: dataUri }, { status: 200 });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
