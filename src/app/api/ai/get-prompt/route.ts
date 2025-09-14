// app/api/ai/get-prompt/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const part = searchParams.get('part');

    if (!part) {
        return NextResponse.json({ error: 'Prompt part is required.' }, { status: 400 });
    }

    try {
        const promptFilePath = path.join(process.cwd(), 'prompts', `prompt${part}.txt`);
        const promptContent = await fs.readFile(promptFilePath, 'utf-8');
        return NextResponse.json({ prompt: promptContent });
    } catch (error) {
        console.error(`Error reading prompt file for part ${part}:`, error);
        return NextResponse.json({ error: 'Failed to read prompt file.' }, { status: 500 });
    }
}
