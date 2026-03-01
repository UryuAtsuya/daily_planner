import Parser from 'rss-parser';

export interface Article {
    title: string;
    link: string;
    content: string;
    pubDate: string;
    creator: string;
}

const parser = new Parser();

export async function fetchNoteAIArticles(): Promise<Article[]> {
    try {
        const feed = await parser.parseURL('https://note.com/hashtag/AI/rss');

        return feed.items.map(item => ({
            title: item.title || 'No Title',
            link: item.link || '',
            content: item.contentSnippet || item.content || '',
            pubDate: item.pubDate || '',
            creator: item.creator || 'Unknown'
        }));
    } catch (error) {
        console.error('Error fetching RSS:', error);
        return [];
    }
}
