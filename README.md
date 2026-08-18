# MindSpace

A mental wellness check-in app for students, built on the MERN stack (MongoDB, Express, React, Node). Students log how they're feeling, get a reflection plus mood-matched calming music from a **custom-trained ML model that runs entirely on your own machine**, and can run a guided box-breathing exercise. Built as a portfolio project.

**This is a self-reflection and study-stress tool, not a medical device or a substitute for professional mental health care.** It includes a crisis-resources page and, if anyone logs a note suggesting they might be in danger, the app skips the music suggestion entirely and routes straight to real helpline numbers instead.

## What's in here

- **Mood check-in** — pick a mood, an intensity, and an optional note. Builds a day-streak.
- **A neural network built and trained from scratch** — `backend/ml/` contains a full pipeline: a hand-written tokenizer + TF-IDF vectorizer, a feedforward neural network with backpropagation implemented in plain JavaScript (no TensorFlow, no PyTorch, no ONNX), trained on 220 hand-labeled example check-ins. No API key, no external calls, no cost, works fully offline. See `backend/ml/README.md` for the architecture and honest accuracy numbers.
- **Curated music suggestions** — 16 curated, real calming/focus tracks (classical, ambient, lo-fi, acoustic) mapped to mood, blended with the classifier's read of your note to pick calmer tracks when the note sounds heavier.
- **Calm Space** — a guided 4-4-4-4 box breathing exercise with a real timer, plus a quick "suggest me music right now" flow that doesn't require a full journal entry.
- **Resources page** — short, practical articles (exam stress, sleep, grounding techniques) and Indian crisis helpline numbers, visible without logging in.
- **Safety net** — a local keyword check on journal notes catches crisis language before the ML layer even runs, independent of it.

## Stack

- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT auth, bcrypt, express-rate-limit
- **ML:** a from-scratch neural network (see `backend/ml/README.md`) — zero external ML dependencies
- **Frontend:** React 19, Vite, React Router, Tailwind CSS v4, Recharts (mood chart), Framer Motion (breathing animation), Axios

## Project structure

```
mindspace/
├── backend/
│   ├── config/       # MongoDB connection
│   ├── controllers/  # route handlers
│   ├── data/         # curated tracks, articles, crisis resources, crisis keyword check
│   ├── middleware/   # auth + error handling
│   ├── ml/           # the custom-trained model: tokenizer, vectorizer, neural net,
│   │                 # training script, trained weights, and its own README
│   ├── models/       # User, MoodEntry
│   ├── routes/
│   ├── utils/        # JWT helper, suggestion engine (combines the ML model + curated tracks)
│   └── server.js
└── frontend/
    └── src/
        ├── api/          # axios client
        ├── components/   # Navbar, Footer, BreathingOrb, MoodGrid, TrackCard, etc.
        ├── constants/     # mood metadata shared with backend enum
        ├── context/       # auth context
        ├── hooks/         # box-breathing timer
        └── pages/         # Home, Login, Register, Dashboard, CheckIn, CalmSpace, Resources
```

## Running it locally

### 1. MongoDB

You need a MongoDB instance — either install it locally, or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and copy its connection string.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set at minimum:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string

No AI API key needed anywhere — the mood classifier ships pretrained (`backend/ml/model/weights.json` is included in this zip). If you ever want to retrain it — e.g. after adding more examples to `backend/ml/data/trainingData.js` — run:

```bash
npm run train-model
```

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:5173` and expects the API at `http://localhost:5000/api` (change `VITE_API_URL` in `frontend/.env` if you run the backend elsewhere).

### 4. Try it

1. Open `http://localhost:5173`, create an account.
2. Go to **Check in**, log a mood — you'll get a reflection and 1-3 matched tracks (each links to a Spotify search for that title/artist).
3. Go to **Calm Space** to try the guided breathing timer.
4. Visit **Resources** any time, logged in or not — crisis helpline numbers are always visible there and in the footer.

## Notes on what was and wasn't tested here

Both backend and frontend were built and verified in this environment:
- Every backend file passed a Node syntax check and `npm install` succeeded.
- The ML pipeline was actually trained (not just written) — `npm run train-model` was run for real, producing the `weights.json` shipped in this zip, with validation accuracy printed honestly (55–65% depending on the run; see `backend/ml/README.md`).
- A test suite covering the tokenizer, TF-IDF vectorizer (including a round-trip serialization check), the neural network (including a toy-problem convergence test that proves the hand-written backpropagation math is actually correct, not just "runs without crashing"), the trained classifier, and the suggestion engine's escalation logic — all passed.
- The Express routes were smoke-tested with live HTTP requests, including a full end-to-end call through `/api/music/suggest` with a real note, confirming the classifier loads, predicts, and feeds into the right templated response — and a separate call confirming the crisis safety net still fires independently of the ML layer.
- The frontend builds cleanly (`npm run build`) and lints with 0 errors (`npm run lint`), and the production build was served and verified to return valid HTML with correctly linked JS/CSS bundles.

What **wasn't** possible to test in this environment: a real MongoDB instance wasn't available, so the full signup → check-in → suggestion flow through the database wasn't run end-to-end. That's the one thing worth testing yourself once you connect a real `MONGO_URI` — everything downstream of it (the ML layer, the suggestion logic, the crisis net) has already been exercised directly.

## Extending it

A few natural next steps if you keep building this out:
- Add more training examples to `backend/ml/data/trainingData.js` and re-run `npm run train-model` — dataset size is the single biggest lever on accuracy right now
- Deploy the backend (Render/Railway) and frontend (Vercel/Netlify), pointing `VITE_API_URL` at the deployed API
- Swap the Spotify-search links in `TrackCard.jsx` for the real Spotify Web API if you want in-app playback
- Add a weekly email/summary digest of mood trends
- Code-split the frontend bundle (it currently ships as one ~240KB gzipped chunk — fine for a portfolio project, worth splitting by route if this grows)
