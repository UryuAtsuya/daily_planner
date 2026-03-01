# Google AdSense 審査前チェック

このプロジェクトで AdSense 審査前に確認する項目です。

## 1. 必須ページ

- [x] プライバシーポリシー: `/privacy-policy`
- [x] 利用規約: `/terms`
- [x] お問い合わせ: `/contact`

## 2. 技術設定

- [x] `ads.txt` を設置（`public/ads.txt`）
- [x] `robots.txt` を配信（`src/app/robots.ts`）
- [x] `sitemap.xml` を配信（`src/app/sitemap.ts`）
- [ ] 本番ドメインを `NEXT_PUBLIC_SITE_URL` に設定
- [ ] `public/ads.txt` の Publisher ID (`pub-...`) を本番IDへ置換

## 3. 広告表示の実装

- [x] 広告枠コンポーネント: `src/features/monetization/components/AdSlot.tsx`
- [x] 設定画面に広告枠導線を配置
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT_ID` を本番値で設定
- [ ] `NEXT_PUBLIC_ENABLE_ADS=true` を本番環境で有効化

## 4. 審査前の運用確認

- [ ] 主要ページがログイン前後で表示できる
- [ ] サイト説明・運営情報が不足していない
- [ ] 極端に薄いコンテンツページがない
- [ ] モバイル表示で崩れがない
