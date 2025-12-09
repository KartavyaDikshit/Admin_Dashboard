import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let file: File | null = null;
    let filename: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = (formData.get('file') as File) || (formData.get('image') as File);
    } else {
       // Fallback for raw body uploads if any
       // file = await request.blob() as any; // Typescript might complain
       return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    filename = file.name;
    
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({ 
        url: blob.url,
        imageUrl: blob.url // For compatibility with TestimonialForm
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}