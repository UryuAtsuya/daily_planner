import Link from "next/link"

export const metadata = {
  title: "お問い合わせ | Daily Planner",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen app-surface px-4 py-10">
      <article className="glass-panel max-w-3xl mx-auto p-6 sm:p-8 space-y-5">
        <h1 className="text-3xl font-display ui-text-strong">お問い合わせ</h1>
        <p className="font-body text-sm ui-text-soft">
          サービスに関するお問い合わせ、広告掲載に関するご連絡は以下までお願いします。
        </p>

        <section className="rounded-xl border ui-border bg-[hsl(var(--ui-surface-soft))] p-4 font-body text-sm ui-text-soft space-y-2">
          <p>メール: contact@example.com</p>
          <p>件名例: Daily Planner お問い合わせ</p>
          <p>回答までに数営業日いただく場合があります。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">運営情報</h2>
          <p>運営者名、所在地等の開示が必要な場合は、法令に基づき個別に開示します。</p>
        </section>

        <div className="flex flex-wrap gap-2 pt-3">
          <Link href="/privacy-policy" className="pill-chip text-sm font-body">プライバシーポリシー</Link>
          <Link href="/terms" className="pill-chip text-sm font-body">利用規約</Link>
          <Link href="/" className="pill-chip text-sm font-body">トップへ戻る</Link>
        </div>
      </article>
    </main>
  )
}
