# Project template

Copy this structure into a Google Doc (one Doc per project). Keep the field labels on their own lines. The Drive import skill maps them into `data/projects.json`.

```
Title:
Example Project Name

Order:
10

Tags:
Music, Mix, Master

Summary:
One or two sentences for the portfolio card.

Body:
Longer description for the overlay. Separate paragraphs with a blank line.

Cover:
cover.jpg

Images:
still-1.jpg
still-2.jpg

Videos:
https://www.youtube.com/watch?v=XXXXXXXXXXX
clip.mp4

Audio:
excerpt.mp3
```

## Field notes

| Field | JSON key | Required | Notes |
| --- | --- | --- | --- |
| Title | `title` | Yes | Overlay heading and card title. Also used to build `slug` / `id` if those are not set. |
| Order | `order` | Yes | Number. Lower appears first in the default grid. |
| Tags | `tags` | Yes | Comma-separated. Allowed values only: `Music`, `SFX`, `Game Audio`, `Mix`, `Master`, `Recording`, `Production`. |
| Summary | `summary` | Yes | 1–2 sentences on the card. |
| Body | `body` | Yes | Overlay copy. Plain paragraphs or light HTML (`<p>`). |
| Cover | `cover` | Yes | File name in the project’s Drive folder, or an image embedded in the Doc. Saved to `assets/projects/<slug>/`. |
| Images | `images` | No | Extra stills. One file name or URL per line. |
| Videos | `videos` | No | Local file name **or** YouTube / Vimeo URL. One per line. Prefer links for long video (GitHub file limit is 100MB). |
| Audio | `audio` | No | Local `mp3` / `wav` / `aac`. Prefer compressed MP3. One per line. |

Optional extras the skill also accepts if you add them:

```
Slug:
example-project-name

Id:
example-project-name
```

If omitted, both are generated from the title (lowercase, hyphenated).

## Drive layout

Put the Doc and its media in the same project folder (or as siblings in the shared Portfolio folder):

```
Portfolio/
  Game Audio Reel.gdoc
  game-audio-reel/
    cover.jpg
    still-1.jpg
    excerpt.mp3
```

Do not put large WAV/video files in the Doc itself. Keep them as Drive files next to the Doc.
