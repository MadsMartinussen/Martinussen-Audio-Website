# Local preview (not live yet)

The site files live in `Martinussen Audio Website/`. Do not publish to GitHub Pages or change Simply.com DNS until you are ready and ask for that process.

Opening `index.html` via `file://` cannot fetch `data/projects.json` in most browsers. Preview locally:

```bash
cd "Martinussen Audio Website"
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

A GitHub Actions workflow exists at `.github/workflows/pages.yml` for later. It does not go live until Pages is enabled and the workflow runs on `main`. Custom domain is set in GitHub → Settings → Pages, not by editing the `CNAME` file.
