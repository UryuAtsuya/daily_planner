import OpenAI from 'openai';
import { Article } from './rss';

export interface ScoredArticle extends Article {
    summary: string;
    reason: string;
}

function createFallbackDigest(articles: Article[]): ScoredArticle[] {
    return articles.slice(0, 5).map((article, index) => {
        const clean = article.content.replace(/\s+/g, ' ').trim();
        const summary = clean.length > 90 ? `${clean.slice(0, 90)}...` : (clean || '本文要約を取得できませんでした。');
        return {
            ...article,
            summary,
            reason: index === 0 ? '最新性が高いため' : '注目度の高いトピックのため',
        };
    });
}

export async function generateDailyDigest(articles: Article[]): Promise<ScoredArticle[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return createFallbackDigest(articles);
    }

    const openai = new OpenAI({ apiKey });

    // Limit to latest 20 articles to avoid token limits and focus on recent news
    const recentArticles = articles.slice(0, 20);

    const prompt = `
  You are an "Information Gatekeeper" designed to save the user from digital overload.
  Below is a list of recent articles from the #AI tag on note.com.
  
  Your task:
  1. Analyze these articles.
  2. Select the TOP 5 most important, high-quality, or interesting articles that a general AI enthusiast should know today.
  3. Provide a 1-sentence summary for each.
  4. Provide a short "Why selected" reason (e.g., "Major breakthrough", "Helpful tutorial").

  Articles:
  ${JSON.stringify(recentArticles.map((a, i) => ({ id: i, title: a.title, snippet: a.content.substring(0, 200) })))}

  Return the result as a JSON array of objects with the following properties:
  - id: (original index)
  - summary: (string, Japanese)
  - reason: (string, Japanese)
  `;

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
    });

    try {
        const responseContent = completion.choices[0].message.content;
        const result = JSON.parse(responseContent || '{"articles": []}');
        // Handle potential wrapper object like { "articles": [...] } or just array inside
        let selections: unknown = result.articles || result;

        if (!Array.isArray(selections) && typeof selections === 'object' && selections) {
            // Find any array property in the object
            const arrayProp = Object.values(result).find((val) => Array.isArray(val));
            if (arrayProp) {
                selections = arrayProp;
            }
        }

        if (!Array.isArray(selections)) {
            console.error("Unexpected JSON structure:", result);
            return createFallbackDigest(recentArticles);
        }

        const digest: ScoredArticle[] = selections.map((raw) => {
            const s = raw as { id?: number; summary?: string; reason?: string };
            const original = recentArticles[s.id ?? -1];
            if (!original) return null;
            return {
                ...original,
                summary: s.summary ?? '要約を生成できませんでした。',
                reason: s.reason ?? '注目トピックのため'
            };
        }).filter((item): item is ScoredArticle => item !== null).slice(0, 5);

        return digest.length > 0 ? digest : createFallbackDigest(recentArticles);

    } catch (error) {
        console.error("Failed to parse LLM response:", error);
        return createFallbackDigest(recentArticles);
    }
}
