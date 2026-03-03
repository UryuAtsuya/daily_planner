import Link from "next/link"

export const metadata = {
  title: "このサービスについて | Daily Planner",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen app-surface px-4 py-10">
      <article className="glass-panel max-w-3xl mx-auto p-6 sm:p-8 space-y-5">
        <h1 className="text-3xl font-display ui-text-strong">このサービスについて</h1>
        <p className="font-body ui-text-soft text-sm">Daily Planner は、1日の予定管理と実行支援をまとめるための個人向けツールです。</p>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">提供内容</h2>
          <p>Google カレンダー連携、1日の可視化、テンプレートによる計画作成、Todo 管理、集中時間の記録を通じて、日々の行動整理を支援します。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">対象ユーザー</h2>
          <p>仕事、学習、生活の予定をまとめて整理したい個人ユーザーを想定しています。情報整理や自己管理を継続しやすくすることを目的としています。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">運営方針</h2>
          <p>使いやすさ、継続しやすさ、過度に煩雑でない UI を重視し、改善を継続します。ポリシー、問い合わせ窓口、利用条件は公開ページで案内します。</p>
        </section>

        <div className="flex flex-wrap gap-2 pt-3">
          <Link href="/privacy-policy" className="pill-chip text-sm font-body">プライバシーポリシー</Link>
          <Link href="/terms" className="pill-chip text-sm font-body">利用規約</Link>
          <Link href="/contact" className="pill-chip text-sm font-body">お問い合わせ</Link>
          <Link href="/" className="pill-chip text-sm font-body">トップへ戻る</Link>
        </div>
      </article>
    </main>
  )
}
