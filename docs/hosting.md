# GitHub Pages + Simply.com DNS

The site is static files in this repo. GitHub Pages serves them. Simply.com only holds DNS (and email). Pushing to `main` updates the live site.

Preview locally (required — opening `index.html` via `file://` cannot fetch `data/projects.json` in most browsers):

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## 1. GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Source: **Deploy from a branch**.
3. Branch: `main`, folder: `/` (root).
4. Custom domain: `www.martinussen-audio.com`.
5. Turn on **Enforce HTTPS** once the certificate is ready.

The repo already includes a `CNAME` file with `www.martinussen-audio.com`.

## 2. Simply.com DNS

Replace `YOURUSER` with the GitHub username or organization that owns the repo. Do not change MX records if Simply still handles email.

| Host | Type | Value |
| --- | --- | --- |
| `www` | CNAME | `YOURUSER.github.io` |
| `@` (apex `martinussen-audio.com`) | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `@` | AAAA | `2606:50c0:8000::153` |
| `@` | AAAA | `2606:50c0:8001::153` |
| `@` | AAAA | `2606:50c0:8002::153` |
| `@` | AAAA | `2606:50c0:8003::153` |

Keep existing **MX** (and related mail) records. Wait for DNS to propagate, then confirm HTTPS is enforced in GitHub Pages settings.

GitHub will usually redirect the apex to `www` (or the other way around) once both records exist. See [GitHub’s custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
