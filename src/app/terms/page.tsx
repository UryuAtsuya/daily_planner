import Link from "next/link"

export const metadata = {
  title: "利用規約 | Daily Planner",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen app-surface px-4 py-10">
      <article className="glass-panel max-w-3xl mx-auto p-6 sm:p-8 space-y-5">
        <h1 className="text-3xl font-display ui-text-strong">利用規約</h1>
        <p className="font-body ui-text-soft text-sm">最終更新日: 2026-02-14</p>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">1. 適用</h2>
          <p>本規約は、Daily Planner（以下「本サービス」）の利用条件を定めるものです。利用者は本規約に同意のうえ本サービスを利用するものとします。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">2. 禁止事項</h2>
          <p>不正アクセス、法令違反行為、第三者の権利侵害、サービス運営を妨害する行為を禁止します。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">3. 免責</h2>
          <p>本サービスは、合理的な範囲で正確性・安全性の確保に努めますが、完全性・無停止を保証するものではありません。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">4. 規約の変更</h2>
          <p>運営者は必要に応じて本規約を変更できます。重要な変更は本サービス上で告知します。</p>
        </section>

        <div className="pt-3">
          <Link href="/" className="pill-chip text-sm font-body">トップへ戻る</Link>
        </div>
      </article>
    </main>
  )
}
