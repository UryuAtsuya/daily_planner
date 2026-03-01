import { NextResponse } from 'next/server';
import { fetchNoteAIArticles } from '@/lib/rss';
import { generateDailyDigest } from '@/lib/llm';

export const dynamic = 'force-dynamic'; // Prevent caching for now to always get latest

export async function GET() {
    try {
        console.log('Fetching articles...');
        const articles = await fetchNoteAIArticles();
        console.log(`Fetched ${articles.length} articles.`);

        if (articles.length === 0) {
            return NextResponse.json({ error: 'No articles found' }, { status: 404 });
        }

        console.log('Generating digest...');
        const digest = await generateDailyDigest(articles);
        console.log('Digest generated.');

        return NextResponse.json({ digest });
    } catch (error) {
        console.error('Error in digest API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
