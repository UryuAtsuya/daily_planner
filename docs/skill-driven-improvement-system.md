# Skill-Driven Improvement System

このプロジェクトを「改善を継続できる状態」にするための、スキル主導ワークフローです。

## 1. 使うスキル（優先順）

1. `requirements-groomer`
   - 改修依頼を「要件・受け入れ基準」に整形して、実装ブレを防ぐ。
2. `vercel-react-best-practices`
   - React/Next.js の実装品質とパフォーマンスの基本方針を統一する。
3. `web-design-guidelines`
   - UI/UX とアクセシビリティの監査基準を揃える。
4. `web-perf`
   - Core Web Vitals / ボトルネック計測と改善を実行する。
5. `technical-seo`
   - インデックス・構造化データ・メタ情報の技術SEOを仕上げる。

## 2. 実行ループ（毎イテレーション）

1. `requirements-groomer` で今回の変更を定義
   - 入力: ユーザー要望
   - 出力: 受け入れ基準（UI、速度、SEO、回帰影響）
2. 実装
   - `vercel-react-best-practices` を基準に React/Next.js 実装
3. 品質監査
   - `web-design-guidelines` で UI/アクセシビリティ確認
   - `web-perf` で計測し、閾値未達なら再実装
4. 公開前チェック
   - `technical-seo` でメタ・サイトマップ・robots・構造化データ確認
5. 回帰確認
   - `npm run lint` と主要導線の手動チェック

## 3. Definition of Done（完了条件）

- Lint エラー `0`
- 主要ページでアクセシビリティの重大問題 `0`
- パフォーマンスの改善差分が説明可能（計測値ベース）
- SEO の必須要素（title/description/canonical/sitemap/robots）が維持
- 変更の目的と影響がドキュメント化されている

## 4. 今回の初動（2026-02-24）

- Lint エラーを解消し、`any` と未使用コードを整理
- `next/image` へ置換して画像最適化の警告を削減
- 本ドキュメントを追加し、改善フローを固定化

