# Casey Franceschy portfolio

Two views share the same career and project data:

- `/`: interactive Vim-inspired portfolio.
- `/recruiters/`: conventional professional overview, designed for recruiters and hiring managers.

## Development

```sh
npm ci
npm run dev
npm run build
npm run test:run
```

Vite builds both HTML entry points. GitHub Pages serves the resulting `dist/` directory, including direct visits and refreshes at `/recruiters/`.

## Content

Update career and project copy in `src/data/portfolio.ts`. The recruiter layout is in `src/recruiter/RecruiterPage.tsx`. Keyboard shortcuts belong only to the Vim entry point.

The recruiter summaries describe private professional work at a high level. Do not add employee data, credentials, internal system URLs, or private screenshots to public assets.

The resume source is `content/resume.md`. Regenerate the shared download with Python 3, `reportlab`, and `pypdf`:

```sh
python3 scripts/build_resume.py
```

The builder embeds fonts and enforces a one-page output at `public/assets/Casey_Franceschy.pdf`. Render and visually review the PDF after editing. The PDF is committed; the website build does not require Python.

## Navigation

The recruiter link is always visible in the editor toolbar. Number shortcuts 1-7 retain their established destinations. All projects are available in the explorer and command search. “Browse projects” opens the first featured project.
