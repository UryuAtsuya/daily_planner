import Link from "next/link"

export const metadata = {
  title: "プライバシーポリシー | Daily Planner",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen app-surface px-4 py-10">
      <article className="glass-panel max-w-3xl mx-auto p-6 sm:p-8 space-y-5">
        <h1 className="text-3xl font-display ui-text-strong">プライバシーポリシー</h1>
        <p className="font-body ui-text-soft text-sm">最終更新日: 2026-03-01</p>

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
          <p>本サービスでは、Google（認証・カレンダー連携・お問い合わせフォーム）、クラウド基盤、分析基盤等の外部サービスを利用することがあります。</p>
          <p>お問い合わせフォームから送信された情報は、Google が提供するフォーム基盤上で処理・保存される場合があります。</p>
        </section>

        <section className="space-y-2 font-body text-sm ui-text-soft">
          <h2 className="text-xl font-display ui-text-strong">5. 問い合わせ窓口</h2>
          <p>個人情報の取り扱いに関するお問い合わせは、<Link href="/contact" className="text-[hsl(var(--ui-brand))] underline">お問い合わせページ</Link>よりご連絡ください。</p>
          <p>お問い合わせフォームには、必要な範囲を超える個人情報、機微情報、認証情報を入力しないようお願いします。</p>
        </section>

        <div className="pt-3">
          <div className="flex flex-wrap gap-2">
            <Link href="/about" className="pill-chip text-sm font-body">このサービスについて</Link>
            <Link href="/" className="pill-chip text-sm font-body">トップへ戻る</Link>
          </div>
        </div>
      </article>
    </main>
  )
}
