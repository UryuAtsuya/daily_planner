# Daily Planner Web: リリースから収益化までのワークフロー

このドキュメントは、`Cloudflare (Pages + Workers) + Supabase + Stripe` 構成で、
「安全に本番リリースし、初期売上を作り、継続的に改善する」ための実行フローです。

関連ドキュメント:
- `docs/cloudflare-release-checklist.md`
- `docs/supabase-setup.md`
- `docs/google-affiliate-framework.md`
- `docs/google-adsense-readiness.md`

## 現状ステータス（2026-02-14 時点）

初期マーキング結果:
- 完了: `0 / 45`
- 未完了: `45 / 45`

コードベースで確認できた実装:
- Google OAuth ログイン（NextAuth）
- Google Calendar 連携（予定の取得・同期）
- タスク/設定のローカル保存（`localStorage`）

未着手（このワークフロー上の主要項目）:
- Cloudflare 本番運用設定（環境分離、デプロイ運用、監視）
- Supabase 本導入（Auth/RLS/DB運用）
- Stripe 課金導線（Checkout/Webhook/購読同期）
- 収益化KPI計測（Activation/Conversion/Retention/MRR）

## 0. 目的とKPI

- 目的: リリース後 30 日で有料転換の再現性を作る
- 主要KPI:
  - Activation: 新規登録後 24 時間以内に「初回タスク作成」した割合
  - Conversion: Free から Premium への課金率
  - Retention: D7 / D30 継続率
  - Revenue: MRR、解約率、ARPU

## 1. リリース前準備（T-14 〜 T-1）

### 1-1. 技術基盤の固定

- [ ] Cloudflare の環境分離（`dev/stg/prod`）を完了
- [ ] GitHub 連携デプロイ運用（`feature/*` -> PR Preview, `main` -> 本番）を固定
- [ ] Supabase Auth / RLS / テーブル設計を `stg` で検証
- [ ] Stripe 商品・価格（Monthly/Yearly）を確定
- [ ] Webhook（Stripe -> Worker or Supabase Edge Function）を疎通確認

### 1-2. 収益導線の最小実装

- [ ] Pricing ページ（Free/Premium 比較）を公開
- [ ] アプリ内アップセル導線を 2 箇所以上設置
- [ ] Checkout 成功後に `subscriptions` テーブル更新を確認
- [ ] `profiles.plan` と機能制限（gate）が連動していることを確認

### 1-3. 計測設計

- [ ] イベント定義を固定（例: `sign_up`, `task_created`, `checkout_started`, `checkout_completed`, `churned`）
- [ ] イベント送信先（Cloudflare Logs / Analytics / BI）を決定
- [ ] 週次で見る KPI ダッシュボードを準備

## 2. リリース当日（T0）

### 2-1. 実行順序

1. [ ] DB マイグレーション適用
2. [ ] Cloudflare 本番デプロイ
3. [ ] Stripe Webhook 本番エンドポイント切替
4. [ ] 動作確認（登録 -> タスク作成 -> Checkout -> 課金反映）
5. [ ] 監視強化（最初の 60 分）

### 2-2. Go/No-Go 判定

- [ ] 重大バグなし（ログイン不可、課金不可、データ消失がない）
- [ ] API 5xx が許容値以内
- [ ] Webhook エラー率が許容値以内

## 3. リリース後 72 時間（初速フェーズ）

### 3-1. Activation 最適化

- [ ] 初回ログイン時のセットアップを短縮（初回タスク作成まで 3 ステップ以内）
- [ ] 空状態画面にテンプレート導線を追加
- [ ] 初回価値到達までの離脱ポイントを分析

### 3-2. Conversion 最適化

- [ ] Paywall 表示タイミングを最適化（価値体験後に表示）
- [ ] Premium 機能訴求文を実利用ベースに改善
- [ ] Checkout 離脱率を確認し、文言・UI を修正

## 4. 2〜4週目（収益化の再現性を作る）

### 4-1. 料金プラン運用

- [ ] Monthly / Yearly の構成を比較検証
- [ ] 無料枠の上限（例: タスク数）を調整
- [ ] 無料トライアル導入有無をテスト

### 4-2. 継続率改善

- [ ] D7 離脱ユーザーの行動ログを確認
- [ ] リマインド通知（メール等）の配信ルールを設定
- [ ] 週次レポートなど継続価値機能を強化

### 4-3. 解約率対策

- [ ] 解約理由を取得する導線を実装
- [ ] 一時停止・ダウングレード導線を提供
- [ ] 返金ポリシーとサポート導線を明文化

## 5. 運用ループ（毎週）

1. [ ] KPI レビュー（Activation / Conversion / Retention / MRR）
2. [ ] ボトルネック仮説を 1〜2 個に絞る
3. [ ] 小さく実装（UI/導線/価格/制限）
4. [ ] 1 週間で効果検証
5. [ ] 継続 or ロールバックを決定

## 6. 役割分担（最小体制）

- Product/PM:
  - KPI 設計、優先順位、価格戦略
- Engineering:
  - Cloudflare デプロイ、Supabase/Stripe 連携、監視/復旧
- Design/Marketing:
  - Pricing、Paywall、オンボーディング文言最適化

## 7. インシデント対応（収益影響あり）

- [ ] 課金不能: Checkout ボタンを一時停止し、障害告知を表示
- [ ] 課金反映遅延: Webhook 再送 + 手動同期手順を実施
- [ ] 誤課金: 返金フローを即時実行
- [ ] 復旧後: 影響ユーザーへ個別連絡

## 8. 実装時の注意点（このプロジェクト向け）

- `docs/supabase-setup.md` には Vercel 記載があるため、Cloudflare 本番運用時は以下に読み替える:
  - デプロイ先: Vercel -> Cloudflare Pages/Workers
  - Webhook 受信先: Vercel API Route -> Cloudflare Worker または Supabase Edge Function
- 認証と課金ステータスの整合性を保つため、`profiles.plan` と `subscriptions.status` の同期ジョブを用意する
- 監査目的で、課金イベントの idempotency（重複処理防止）を必ず実装する

---

## 付録: 最初の30日アクションプラン

### Week 1
- [ ] リリース
- [ ] 主要導線の不具合修正
- [ ] Activation 改善 1 本

### Week 2
- [ ] Paywall 改善 A/B（または疑似 A/B）
- [ ] 料金訴求文の改善
- [ ] 解約理由の取得開始

### Week 3
- [ ] 年額プラン訴求の追加
- [ ] 休眠復帰施策（メール等）開始
- [ ] Retention 改善 1 本

### Week 4
- [ ] KPI 振り返り
- [ ] 価格/無料枠の再調整
- [ ] 翌月の実験計画を確定
