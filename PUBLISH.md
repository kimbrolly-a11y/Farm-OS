# FarmOS — Publish & Deploy Commands (run AFTER Fable finishes)

> ⚠️ Do these once the Fable build has settled, so the submission reflects the
> final state. `.env.local` is gitignored, so your API key is never pushed —
> but double-check before pushing (step 1).

## 0. Hosting choice (read first)
FarmOS holds the twin in server memory and ticks the simulator + autopilot via a
background `setInterval` (in `instrumentation.ts`). That needs a **persistent
Node server**:
- **Best for the live demo:** run **locally** (`npm run build && npm start`, or
  `npm run dev`) and present from your laptop — the simulation ticks reliably.
- **Public URL, persistent (recommended if you need a link):** Render or Railway
  (`npm run build` + `npm start`) — the background loop keeps running.
- **Vercel:** fine for a quick link, but its serverless model may not run the
  background loop reliably (pages render; live ticking is not guaranteed).

---

## 1. Finalize the repo
```bash
cd "C:/Users/kimbr/OneDrive/Documents/Claude Projects Folder/Eco Tourism"
git status                       # confirm Fable's work is committed
git add -A && git commit -m "chore: finalize build for submission"   # only if uncommitted changes remain
npm run build                    # confirm the build is GREEN
git ls-files | grep -i env       # sanity: should return NOTHING (no .env committed)
```

## 2. Push to a public GitHub repo

**Option A — GitHub CLI (easiest):**
```bash
gh auth login                    # if not already logged in
gh repo create farmos --public --source=. --remote=origin --push
```

**Option B — manual:** create an empty **public** repo named `farmos` on
github.com (no README), then:
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/farmos.git
git branch -M main               # optional: rename master -> main
git push -u origin main          # (or: git push -u origin master)
```
→ Put this repo URL in the submission form.

## 3a. Deploy to Vercel (quick public link)
```bash
npm i -g vercel
vercel login
vercel                           # first deploy (preview) — Next.js auto-detected, accept defaults
vercel env add ANTHROPIC_API_KEY production   # paste your key when prompted
vercel --prod                    # production deploy → gives the live URL
```
(If the live simulation looks static on Vercel, that's the serverless caveat in
§0 — demo locally instead, or use 3b.)

## 3b. Deploy to Render or Railway (persistent — reliable live sim)
- **Render:** New → Web Service → connect the GitHub repo → Build `npm install &&
  npm run build`, Start `npm start` → add env var `ANTHROPIC_API_KEY` → deploy.
- **Railway:** New Project → Deploy from GitHub repo → it auto-detects Next.js →
  add `ANTHROPIC_API_KEY` variable → deploy.

## 4. Before the demo
- Confirm the agent runs on Claude: open the deployed/local app → Controls →
  "Run agent now" → the result badge should say **Claude**, not rule engine
  (means `ANTHROPIC_API_KEY` is set). Without the key it still works on rules.
- Capture screenshots (SUBMISSION.md list) and record the 2–3 min demo video.
