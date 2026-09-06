---
name: update-portfolio-from-drive
description: Import Martinussen Audio portfolio projects from a Google Drive folder. Lists Docs and media, downloads files into assets/projects/<slug>/, regenerates data/projects.json, and leaves index.html untouched. Use when the user says update portfolio from Drive, import projects from Google Docs, or sync Drive portfolio content.
---

# Update portfolio from Drive

Pull project Docs + media from Google Drive into this static site. The live page only reads local `data/projects.json` and `assets/projects/`.

**Never edit `index.html`, `css/styles.css`, or `js/main.js`.**

## Before you start

1. Read [config.json](config.json) for `driveFolderId`.
2. If `driveFolderId` is still `YOUR_DRIVE_FOLDER_ID`, stop and ask for the real folder ID (from the Drive URL `https://drive.google.com/drive/folders/<ID>`).
3. Use the Google Drive MCP tools (`search_files`, `read_file_content`, `download_file_content`). Authenticate with `mcp_auth` only if a Drive call fails.

Allowed tags (exact strings): `Music`, `SFX`, `Game Audio`, `Mix`, `Master`, `Recording`, `Production`.

## Workflow

```
Progress:
- [ ] List Drive folder
- [ ] Read each Google Doc
- [ ] Download media into assets/projects/<slug>/
- [ ] Write data/projects.json
- [ ] Do not touch index.html
```

### 1. List the folder

Search with `parentId = '<driveFolderId>'`. Paginate with `next_page_token` until empty.

Treat as a project:

- A Google Doc (`application/vnd.google-apps.document`) in the folder or one level down.
- Optional sibling folder named after the slug or title, holding media.

Skip the template Doc if its title is `Project template` or similar.

### 2. Read each Doc

Use `read_file_content` with the Doc `fileId`. Parse these labels (same as [docs/project-template.md](../../../docs/project-template.md)):

- Title
- Order
- Tags (comma-separated)
- Summary
- Body
- Cover
- Images
- Videos
- Audio
- Optional: Slug, Id

If a label is missing, infer carefully from headings. Do not invent credits, clients, or media that are not in the Doc or folder.

`slug` / `id`: use the Doc field, else lowercase hyphenated `title` (`Game Audio Reel` → `game-audio-reel`).

`tags`: keep only allowed values. Normalize obvious variants (`game audio` → `Game Audio`, `sfx` → `SFX`).

`body`: keep paragraph breaks. If the Doc is plain text, store paragraphs as `<p>…</p>`. Do not add new copy.

`order`: integer. If missing, append after the highest existing order.

### 3. Download media

For each project, write files under `assets/projects/<slug>/`.

Resolve cover/images/audio/video file names against:

1. Files in a sibling folder matching the slug or title
2. Files in the same parent as the Doc
3. Images exported from the Doc (`download_file_content`)

Use `download_file_content` for binaries. For Google-native images, export as `image/jpeg`. Write the decoded file to disk.

Path rules in JSON (relative to site root):

- Cover → `assets/projects/<slug>/<filename>`
- Images / local audio / local video → same folder
- YouTube or Vimeo URLs stay as URLs in `videos[]`

Skip files over ~90MB. Prefer MP3/AAC for audio. Prefer YouTube/Vimeo for long video. GitHub rejects files over 100MB.

### 4. Regenerate `data/projects.json`

Replace the whole file with a JSON **array** of project objects:

```json
{
  "id": "game-audio-reel",
  "slug": "game-audio-reel",
  "title": "Game Audio Reel",
  "summary": "Card text",
  "body": "<p>Overlay copy</p>",
  "tags": ["Game Audio", "SFX"],
  "order": 1,
  "cover": "assets/projects/game-audio-reel/cover.jpg",
  "images": ["assets/projects/game-audio-reel/still-1.jpg"],
  "videos": ["https://www.youtube.com/watch?v=XXXXXXXXXXX"],
  "audio": ["assets/projects/game-audio-reel/excerpt.mp3"]
}
```

Sort the written array by `order` ascending.

Remove placeholder projects (`game-audio-reel`, `studio-session`) once at least one real imported project exists, unless the user asks to keep them.

Pretty-print JSON (2-space indent). Validate it parses.

Delete `assets/projects/<old-slug>/` only when that slug is no longer in Drive and the user is doing a full sync.

### 5. Stop conditions

- Missing folder ID → ask; do not guess.
- Drive auth error → tell the user to reconnect the Google Drive plugin.
- No Docs found → report and leave existing JSON/assets unchanged.
- After a successful sync, list imported titles, skipped large files, and tag warnings.

## Local check

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` and confirm the new cards, filters, and overlay. Do not add projects into `index.html`.
