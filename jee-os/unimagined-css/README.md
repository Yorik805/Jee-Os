# JEE OS (React Version)

This is the React/Next.js version of your JEE dashboard with the unimagined visual system.

## Project Path
`E:\HTML\projects\JEE Dashbord\jee-os\unimagined-css`

## Run Locally
From PowerShell:

```powershell
cd "E:\HTML\projects\JEE Dashbord\jee-os\unimagined-css"
npm.cmd install
npm.cmd run dev
```

Open:
`http://localhost:3000`

## What Is Wired
- Sidebar navigation works across pages.
- Settings -> Add Chapter works.
- Tracker inputs are now clickable and save logs.
- Tracker supports:
  - Subject / Chapter / Type
  - Range Start / Range End
  - Solved
  - Doubts
  - Notes
- Log save updates:
  - streak
  - session history
  - chapter progress (Exercise / Step 2 / Step 3 done)
  - revision signals

## Data Storage
- Stored in browser localStorage key: `jee-os-data`
- Export/import/reset available in Settings.

## Core Files
- `app/page.tsx` -> main state + logic wiring
- `lib/jee-os/types.ts` -> data model
- `components/jee-os/pages/tracker.tsx` -> tracker UI + form
- `components/jee-os/pages/settings.tsx` -> chapter setup + data actions
- `app/globals.css` -> theme + glass/interaction layering

## If Inputs Ever Stop Clicking Again
1. Stop server (`Ctrl + C`)
2. Start again (`npm.cmd run dev`)
3. Hard refresh browser (`Ctrl + F5`)
4. Check overlay layering in `app/globals.css` around `.glass-card`

## Quick Usage Flow
1. Go to Settings, add chapters first.
2. Open Question Log and enter progress ranges.
3. Add doubts as comma-separated numbers (example: `8,12,19`).
4. Use Overview + Subject pages to monitor progress.

## Next Tweaks You Can Ask For
- Better doubt parser (`8-12,19,24-26` style)
- Smart auto-range suggestion
- Per-chapter doubt bank panel
- Mastery scoring refinements
- Mobile polish
