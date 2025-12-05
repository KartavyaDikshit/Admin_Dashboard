import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: 'public',
    });

    return NextResponse.json({ imageUrl: blob.url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}