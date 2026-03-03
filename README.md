# Daily Planner Web

Next.js 16 app for a daily planner with Google sign-in and Google Calendar sync.

## Local Development

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Required local environment variables:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

Google OAuth redirect URI for local development:

```text
http://localhost:3000/api/auth/callback/google
```

## Cloudflare Workers

This repository is prepared for Cloudflare Workers with OpenNext.

1. Authenticate Wrangler.

```bash
npx wrangler login
```

2. Set production secrets in Cloudflare.

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put AUTH_SECRET
npx wrangler secret put NEXTAUTH_URL
```

3. Preview the production build locally.

```bash
npm run preview
```

4. Deploy to Cloudflare Workers.

```bash
npm run deploy
```

Google OAuth redirect URI for production:

```text
https://<your-worker-domain>/api/auth/callback/google
```

If you attach a custom domain, add that exact callback URL in Google Auth Platform as well.
