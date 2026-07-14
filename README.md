lynnandtonic.com
================

The portfolio of [Lynn Fisher](https://lynnandtonic.com). Words and images © Lynn Fisher.

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
