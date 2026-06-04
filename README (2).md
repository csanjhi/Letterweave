# Letterweave — Crossword Game

A beautiful, pastel-themed crossword word game playable in any browser. No dependencies, no build step — pure HTML + CSS + JS.

## Features

- **vs Computer** — Play solo against an AI opponent
- **Pass & Play** — Two players on the same device
- **Invite a Friend** — Share a link for online 2-player (uses localStorage for same-browser tabs; for cross-device play see notes below)
- 15×15 crossword board with bonus cells (Double Letter ★, Triple Letter ★★)
- Full letter tile rack with point values (vowels highlighted)
- Turn timer (2 minutes per turn)
- Word validation against a built-in English word list
- Score tracking + word history

## How to Deploy on GitHub Pages

1. Fork or clone this repository
2. Go to **Settings → Pages** in your GitHub repo
3. Set source to **Deploy from branch → main → / (root)**
4. Save — your site will be live at `https://yourusername.github.io/repo-name/`

## How to Play

1. Choose a game mode from the home screen
2. Click a tile from your rack, then click a cell on the board
3. All tiles in one turn must form a word in a row or column
4. Words must connect to letters already on the board
5. First word must cross the center ★ star
6. Click **Place Word** to confirm, or **Recall** to take tiles back
7. Highest score when tiles run out wins!

## Online Multiplayer Note

The "Invite a Friend" feature uses `localStorage` for tab-to-tab communication on the **same browser/device**. For true cross-device online play, you would need to connect a backend (Firebase, Supabase, etc.). The invite link and join code UI is fully wired — just swap in your preferred real-time sync layer.

## File Structure

```
index.html   — Game UI and layout
game.js      — All game logic (state, board, AI, scoring)
README.md    — This file
```
