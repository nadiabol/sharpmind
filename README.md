# 🧠 SharpMind — Train Your Executive Mind

8 cognitive games designed to sharpen memory, decision-making, strategic thinking, and mental agility. Built for ages 40-70.

## Games

| Game | Skill | Difficulty |
|------|-------|------------|
| 🧩 Pattern Recall | Memory | Medium |
| 🔢 Number Flow | Logic | Medium |
| 🎯 Focus Grid | Attention | Easy |
| ⚖️ Decision Lab | Judgment | Hard |
| 🔤 Word Maze | Creativity | Medium |
| 📋 Priority Matrix | Planning | Hard |
| 🔁 Dual N-Back | Working Memory | Hard |
| ⚡ Speed Sort | Flexibility | Easy |

## Run Locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Deploy to Vercel (Recommended — Easiest)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** → import your repo
4. Vercel auto-detects Vite — just click **Deploy**
5. Done! You'll get a live URL like `sharpmind.vercel.app`

Every future push to `main` auto-deploys.

## Deploy to Netlify

1. Push this folder to a GitHub repo
2. Go to [netlify.com](https://netlify.com) and sign in with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your repo
5. Build settings (auto-detected, but verify):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy site**

## Deploy via Drag & Drop (No GitHub needed)

### Netlify Drop
1. Run `npm install && npm run build` locally
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder onto the page
4. Instant live URL!

### Vercel CLI
```bash
npm i -g vercel
npm run build
vercel --prod
```

## Tech Stack

- React 18
- Vite 5
- Zero external UI libraries — pure inline styles
- No backend required — fully client-side
