# JEE OS README

## What Changed
1. Sidebar logo dot removed.
2. Chapter creation moved to **Settings**.
3. Subject pages no longer have `Add Chapter` buttons.
4. Question Log now supports **range-based progress** and **doubt question capture**.

## One-Time Setup (Today)
1. Open `jee-os/index.html`.
2. Go to **Settings**.
3. Set your **Daily Goal**.
4. In **Add Chapter** card, add chapters with:
- Subject
- Chapter name
- Exercise total
- Step 2 total
- Step 3 total
- Optional notes

## Daily Usage Flow
1. Solve questions.
2. Open **Question Log**.
3. Fill:
- Subject
- Chapter
- Type
- Range Start
- Range End
- Solved in Range
- Correct
- Doubt Questions (comma separated, e.g. `8,12,19`)
- Optional revision flag + notes
4. Click **Save Progress**.

## What The System Stores Per Log
- Attempted range (start-end)
- Solved count
- Left count (`attempted - solved`)
- Doubt questions for future revision
- Correct count
- Notes and revision mark

## Why Doubt Inputs Matter
If you enter doubt question numbers, they are treated as revision-worthy and saved with the session history. This helps you build targeted revision lists from real weak points.

## Current Behavior Notes
- Chapter progress (`done`) updates from solved count.
- Range, left count, and doubts are visible in history.
- Doubt questions also contribute to revision signals.

## Weekly Habit
1. Export data JSON once a week.
2. Review revision queue + doubt-heavy chapters.
3. Plan next week using weakest chapters first.
