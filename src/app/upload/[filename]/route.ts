import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  if (!filename) {
    return new NextResponse('Filename is required', { status: 400 });
  }

  // Remove extension to get slug
  const slug = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');

  try {
    // Try to find as a report first
    const report = await prisma.report.findFirst({
      where: {
        OR: [
            { slug: slug },
            { reportId: slug }
        ]
      },
      select: { imageUrl: true }
    });

    let sourceUrl = report?.imageUrl;

    // If not found as report, try to find as a category
    if (!sourceUrl) {
      const category = await prisma.category.findFirst({
        where: { slug: slug },
        select: { icon: true }
      });
      sourceUrl = category?.icon;
    }

    if (!sourceUrl) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Fetch the actual image
    const imageResponse = await fetch(sourceUrl);

    if (!imageResponse.ok) {
        return new NextResponse('Failed to fetch image source', { status: 502 });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const buffer = await imageResponse.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error serving report image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
