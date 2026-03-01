# Daily Planner Web — Supabase セットアップガイド

収益化に向けた Supabase 統合のためのセットアップガイドです。

## なぜ Supabase か

| 機能 | 内容 |
|---|---|
| **Authentication** | Google, GitHub, Email/Password 等、多数のプロバイダー対応 |
| **Database (Postgres)** | Row Level Security (RLS) でユーザーごとのデータ分離 |
| **Realtime** | WebSocket ベースのリアルタイムデータ同期 |
| **Storage** | ユーザーアバターや添付ファイルの保存 |
| **Edge Functions** | Stripe Webhook 等のサーバーレス処理 |

---

## 1. セットアップ手順

### 1.1 Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. Dashboard → Settings → API から以下を取得：
   - `Project URL`（例: `https://xxxxx.supabase.co`）
   - `anon (public)` API Key
   - `service_role` Key（サーバー側専用、**絶対に公開しない**）

### 1.2 パッケージインストール

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1.3 環境変数の設定

`.env.local` に追加：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxx  # サーバー側のみ使用
```

### 1.4 Supabase クライアントの作成

```typescript
// src/lib/supabase/client.ts（ブラウザ用）
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts（サーバー用）
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

---

## 2. 認証統合

### 方針：NextAuth → Supabase Auth への段階的移行

現在 NextAuth で Google OAuth を使用中。移行パターンは2つ：

| パターン | メリット | デメリット |
|---|---|---|
| **完全移行** | 認証とDBが統一、RLS が直接使える | 移行コストあり |
| **共存** | 既存 NextAuth を維持、DB のみ Supabase | RLS に手動で JWT 連携が必要 |

> **推奨**: 完全移行。Supabase Auth は Google OAuth をネイティブサポートしており、RLS と自然に統合できるため。

### Supabase Auth 設定（Google OAuth）

1. Supabase Dashboard → Authentication → Providers → Google を有効化
2. Google Cloud Console で OAuth クライアントを作成（リダイレクト URI: `https://xxxxx.supabase.co/auth/v1/callback`）
3. Client ID / Client Secret を Supabase に設定

---

## 3. データベース設計

### テーブル構成

```sql
-- ユーザープロフィール（auth.users を拡張）
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- タスク
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,            -- "2026-02-12"
  label TEXT NOT NULL,
  icon TEXT DEFAULT '📝',
  color TEXT NOT NULL,
  start_minutes INTEGER NOT NULL,    -- 0-1440
  duration_minutes INTEGER NOT NULL, -- 5-1440
  category_id TEXT,
  description TEXT,
  next_action TEXT,
  items_to_bring TEXT,
  google_event_id TEXT,
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日記
CREATE TABLE public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date_key)
);

-- サブスクリプション（収益化用）
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_tasks_user_date ON public.tasks(user_id, date_key);
CREATE INDEX idx_diary_user_date ON public.diary_entries(user_id, date_key);
```

### Row Level Security (RLS)

```sql
-- RLS を有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ポリシー：自分のデータのみ CRUD 可能
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can manage their own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own diary"
  ON public.diary_entries FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id);
```

---

## 4. 収益化パターン：Stripe + Supabase

### フロー

```
ユーザー → Checkout を開始 → Stripe Checkout Session
Stripe → Webhook → Supabase Edge Function
Edge Function → subscriptions テーブル更新 → profiles.plan を 'premium' に
```

### 必要なパッケージ

```bash
npm install stripe
```

### Premium 機能の例

| 機能 | Free | Premium |
|---|---|---|
| タスク数上限 | 10件/日 | 無制限 |
| Google カレンダー同期 | ✓ | ✓ |
| 週次/月次レポート | 基本 | 詳細 + エクスポート |
| カスタムテーマ | 3種類 | 全テーマ |
| 複数カレンダー同期 | 1つ | 無制限 |

---

## 5. デプロイ（Cloudflare + GitHub + Supabase）

1. **GitHub**: `main` を本番、PR を Preview とする運用を固定
2. **Cloudflare Pages**: GitHub リポジトリ連携で自動デプロイを設定
3. **Cloudflare Workers**: API/Webhook 処理を本番デプロイ（必要に応じて）
4. **Supabase**: Dashboard → Settings → API → Allowed origins に Cloudflare のドメインを追加
5. **Stripe**: Webhook endpoint を Cloudflare 側の本番 URL に設定

```env
# Cloudflare の Environment Variables / Secrets
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### GitHub 連携時の推奨ルール

- `main`: 本番デプロイ専用
- `feature/*`: 機能開発ブランチ
- Pull Request 作成時に Preview で動作確認
- 本番反映は `main` マージのみ

---

## 次のステップ

1. Supabase プロジェクトを作成し、環境変数を `.env.local` に設定
2. 上記の SQL でテーブルと RLS ポリシーを作成
3. `@supabase/ssr` をインストールし、クライアントファイルを作成
4. 既存の `localStorage` ベースのデータ保存を Supabase に段階的に移行
5. Stripe アカウントを作成し、サブスクリプション商品を設定
