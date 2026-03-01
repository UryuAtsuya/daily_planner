'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Newspaper } from 'lucide-react';
import { AdSlot } from '@/features/monetization/components/AdSlot';

interface Article {
  title: string;
  link: string;
  creator: string;
  summary: string;
  reason: string;
  pubDate: string;
}

export function ZenFeedView() {
  const [loading, setLoading] = useState(true);
  const [digest, setDigest] = useState<Article[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDigest() {
      try {
        const res = await fetch('/api/digest');
        const data = await res.json();
        if (data.digest) {
          setDigest(data.digest);
        } else if (data.error) {
          setError(data.error);
        }
      } catch (error) {
        console.error('Failed to load digest', error);
        setError('Failed to load digest');
      } finally {
        setLoading(false);
      }
    }
    fetchDigest();
  }, []);

  function formatDate(dateString: string) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (done) {
    return (
      <div className="w-full flex min-h-[60vh] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50 text-stone-700">
        <div className="text-center bg-white/80 backdrop-blur-sm border border-stone-200/60 rounded-2xl px-10 py-12 shadow-lg">
          <Check className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
          <h1 className="text-3xl mb-2 font-serif">You are up to date.</h1>
          <p className="text-stone-500">Enjoy your detox.</p>
          <button
            onClick={() => setDone(false)}
            className="mt-8 text-sm text-stone-500 hover:text-stone-800 underline"
          >
            Review again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full rounded-2xl bg-stone-50 text-stone-800 border border-stone-200/70 overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,113,108,0.15),_transparent_60%),radial-gradient(circle_at_20%_20%,_rgba(16,185,129,0.18),_transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <header className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.25em] text-stone-500">
              Daily essential digest
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-serif font-semibold tracking-tight text-stone-900">
              Zen Feed
            </h1>
            <p className="mt-4 text-stone-500">
              今日読むべき5本だけ。過剰な情報から距離を置くための静かなダイジェスト。
            </p>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-stone-500">
              <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
              <span className="mt-4 text-sm tracking-wide uppercase">Curating your feed…</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-stone-500">
              {error}
            </div>
          ) : digest.length > 0 ? (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm">
                  <div className="text-xs uppercase tracking-widest text-stone-400">
                    今日のセレクション
                  </div>
                  <div className="mt-2 text-3xl font-serif text-stone-900">
                    {digest.length} curated pieces
                  </div>
                  <div className="mt-3 text-sm text-stone-500">
                    最小限の情報で、最大限の理解を。
                  </div>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 shadow-sm">
                  <div className="text-xs uppercase tracking-widest text-stone-400">Guideline</div>
                  <ul className="mt-3 space-y-2 text-sm text-stone-600">
                    <li>厳選されたトップ5の記事</li>
                    <li>要約は1文に凝縮</li>
                    <li>理由で読む価値を判断</li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-6">
                {digest.map((article, idx) => (
                  <article
                    key={idx}
                    className="group rounded-2xl border border-stone-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span>{formatDate(article.pubDate)}</span>
                        <span>by {article.creator}</span>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900"
                        >
                          <Newspaper size={14} />
                          Open
                        </a>
                      </div>
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold text-stone-900">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline decoration-2 underline-offset-4"
                      >
                        {article.title}
                      </a>
                    </h2>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[2fr_1fr]">
                      <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
                        <div className="text-xs uppercase tracking-widest text-stone-400">Summary</div>
                        <p className="mt-2 font-serif text-lg leading-relaxed text-stone-700">
                          {article.summary}
                        </p>
                      </div>
                      <div className="rounded-xl border border-stone-200 bg-white p-4">
                        <div className="text-xs uppercase tracking-widest text-stone-400">Why selected</div>
                        <p className="mt-2 text-sm leading-relaxed text-stone-600">
                          {article.reason}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <AdSlot
                slot="zen-feed-bottom"
                className="my-8"
                format="horizontal"
              />

              <button
                onClick={() => setDone(true)}
                className="w-full rounded-2xl bg-stone-900 py-4 text-sm font-semibold uppercase tracking-widest text-stone-100 transition hover:bg-black"
              >
                I&apos;m done reading
              </button>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-500">
              No updates found for today.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
