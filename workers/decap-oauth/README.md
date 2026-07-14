# Decap CMS GitHub OAuth Worker

This worker is the OAuth proxy for `/admin`.

## GitHub OAuth App

- Homepage URL: `https://vanhuy.r2b.io.vn`
- Authorization callback URL: `https://cms-auth.vanhuy.r2b.io.vn/callback`

## Deploy

```bash
cd workers/decap-oauth
npm install -g wrangler
wrangler secret put CLIENT_ID
wrangler secret put CLIENT_SECRET
wrangler deploy
```

Point `cms-auth.vanhuy.r2b.io.vn` to the deployed worker, then open `https://vanhuy.r2b.io.vn/admin`.
