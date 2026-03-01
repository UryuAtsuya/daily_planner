import Link from "next/link"

export const metadata = {
  title: "プライバシーポリシー | Daily Planner",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen app-surface px-4 py-10">
      <article className="glass-panel max-w-3xl mx-auto p-6 sm:p-8 space-y-5">
        <h1 className="text-3xl font-display ui-text-strong">プライバシーポリシー</h1>
        <p className="font-body ui-text-soft text-sm">最終更新日: 2026-02-14</p>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">1. 取得する情報</h2>
          <p>本サービスは、Googleログイン情報（氏名、メールアドレス、プロフィール画像）、利用ログ、Cookie等を取得する場合があります。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">2. 利用目的</h2>
          <p>取得した情報は、認証、機能提供、品質改善、不正利用対策、サポート対応、広告配信最適化のために利用します。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">3. 広告配信について</h2>
          <p>本サービスは、Google AdSense等の第三者配信事業者の広告を表示する場合があります。第三者配信事業者は、Cookie等を使用して利用者の興味に応じた広告を表示することがあります。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">4. 外部サービス</h2>
          <p>本サービスでは、Google（認証・カレンダー連携）やクラウド基盤、分析基盤等の外部サービスを利用することがあります。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">5. 問い合わせ窓口</h2>
          <p>個人情報の取り扱いに関するお問い合わせは、<Link href="/contact" className="text-[hsl(var(--ui-brand))] underline">お問い合わせページ</Link>よりご連絡ください。</p>
        </section>

        <div className="pt-3">
          <Link href="/" className="pill-chip text-sm font-body">トップへ戻る</Link>
        </div>
      </article>
    </main>
  )
}
