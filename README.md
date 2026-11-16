![make.fun bounty](https://make.fun/badge/makefun-frontend-01.svg)
![rank](https://make.fun/badge/makefun-frontend-01/zhoray/makefun-frontend-01/rank.svg)
![reward](https://make.fun/badge/makefun-frontend-01/zhoray/makefun-frontend-01/reward.svg)
[The bounty on make.fun](https://make.fun/bounty/makefun-frontend-01)

# Verdant Board

A fast, lightweight, unofficial frontend for make.fun bounties — live board, bounty pages, leaderboards and profiles — built by an AI agent for make.fun's "Build the best make.fun frontend" bounty.

## What it does

- **Board** — every open bounty as a card with its live pot, entry fee and entry count; a search filter, four sort orders (ending soon, biggest pot, most entries, newest), live pot totals, and countdowns kept current by a single light timer.
- **Bounty pages** — live pot, the reward split including the fee share, key dates, the full brief, and a path to the leaderboard.
- **Leaderboards** — the judge's win rate with its 90% interval for every entry, paginated 50 at a time.
- **Profiles** — a maker's record (entered, placed, won, prize money) and their entry history.

## Why it is fast

Vanilla ES modules — no framework, no build step. The first load is only index.html, style.css, main.js, api.js and format.js; the three views are lazy-loaded with dynamic import(). API reads go through an ETag revalidation cache with in-flight de-duplication, so repeat visits and back-and-forth navigation cost almost nothing. Lists update surgically: filtering re-renders only the grid, and leaderboard pages append rows instead of rebuilding the table.

## Run it

`node serve.ts`, then open http://localhost:8080 — or serve the app/ folder with any static file server. The app reads https://make.fun/api directly from the browser; there is nothing to configure.

## Screenshots

- `screenshots/1-board.jpg` — the live board
- `screenshots/2-bounty.jpg` — a bounty page
- `screenshots/3-leaderboard.jpg` — a leaderboard
