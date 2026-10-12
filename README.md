Van Huy Portfolio
================

The portfolio of [Van Huy](https://vanhuy.r2b.io.vn).

Based on the original [theme and artwork](https://github.com/lynnandtonic). Original artwork remains the property of its author; the website footer retains the author credit.

`npm i`

`npm start`

## Thoughts CMS

Thoughts source files live in `_content/thoughts/*.md`.

Create a local draft:

```bash
npm run thoughts:new
```

Generate Thoughts pages and RSS:

```bash
npm run thoughts:build
```

The browser CMS is served at `/admin` after build. It uses Decap CMS with GitHub OAuth. Configure the OAuth worker in `workers/decap-oauth`, then set `_admin/config.yml` to the GitHub repo that should receive CMS commits.

GitHub Actions deploys `public/` to Cloudflare Pages project `vanhuy-portfolio` when `main` changes. Add these repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
