# Lexom

A daily word game built with React and Vite, inspired by SUTOM. One six-letter word per day — the first letter is always given. Try to find it in six attempts.

**[Play it live →](https://lexom.vercel.app)**

![Lexom gameplay](https://lexom.vercel.app/og-image.png)

-----

## Why I Built This

I wanted a project that wasn’t just a tutorial clone. SUTOM has a mechanic I find genuinely interesting, locking the first letter removes the random opening-move problem that makes Wordle feel a bit arbitrary. That constraint changes the whole strategy.

Beyond the game design, I used this as a chance to build something that could actually be used by other people, not just a portfolio demo with fake data. Real persistence, a real leaderboard, real deployments.

-----

## What’s Inside

**Game mechanics**

- SUTOM-style rules — first letter always revealed and locked
- Color-coded feedback per guess (correct position, wrong position, not in word)
- Hard mode: any revealed hints must be used in subsequent guesses
- Physical keyboard support alongside the on-screen keyboard

**Daily system**

- Same word for every player each day, derived from the date with no server coordination needed
- Game state persists across page refreshes
- Countdown timer to the next word

**Stats & social**

- Local stats tracking: games played, win rate, current and best streaks
- Guess distribution chart
- One-tap share button generates the emoji grid (the format you’ve seen on Twitter)

**Leaderboard**

- Global daily leaderboard via Supabase
- Ranked by attempts, then by solve time
- One submission per username per day enforced at the database level

-----

## Tech Stack

|Layer     |Choice             |Why                                       |
|----------|-------------------|------------------------------------------|
|Frontend  |React 18 + Vite    |Fast dev experience, modern tooling       |
|Styling   |CSS Modules        |Scoped styles, no runtime overhead        |
|Database  |Supabase (Postgres)|Row-level security, no backend to maintain|
|Deployment|Vercel             |Zero-config, edge CDN, instant previews   |
|PWA       |vite-plugin-pwa    |Installable on mobile, offline-capable    |

-----

## Security

This isn’t a “security section added for the README” — it was part of the build from day one.

- Row Level Security enabled on all Supabase tables. The anon key only permits what the RLS policies explicitly allow — public reads, single inserts with field-level validation constraints
- Username input is sanitized before any database write to strip HTML characters and prevent XSS
- All database writes go through the Supabase JS SDK which uses parameterized queries internally, no raw SQL in the application code
- Rate limiting layered at the client (localStorage-based, 10 leaderboard submissions per hour) and at the database (unique constraint on username + date prevents duplicate daily entries)
- HTTP security headers set at the Vercel edge: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Session persistence disabled on the Supabase client, no tokens stored in localStorage

-----

## Project Structure

```
src/
├── components/        # Board, Keyboard, Tile, all modals
├── hooks/             # useGame, useCountdown, useTimer, useConfetti
├── utils/             # Game logic, share formatting, rate limiting, stats
├── services/          # Leaderboard reads and writes
├── lib/               # Supabase client setup
└── data/              # Word list
```

The game logic lives entirely in `useGame.js` and the utility files — components are purely presentational. I kept it that way intentionally so the logic is easy to test in isolation and the components stay readable.

-----

## Running Locally

```bash
git clone https://github.com/Aisha-Aliyu/lexom.git
cd lexom
npm install
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_NAME=Lexom
VITE_WORD_LENGTH=6
VITE_MAX_ATTEMPTS=6
VITE_DAILY_MODE=true
```

```bash
npm run dev
```

The leaderboard requires a Supabase project. The rest of the game works without it. If the env variables are missing, leaderboard features degrade gracefully rather than crashing.

-----

## Supabase Setup

Run this in the Supabase SQL editor to create the leaderboard table with proper constraints and RLS:

```sql
CREATE TABLE leaderboard (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL CHECK (char_length(username) >= 2 AND char_length(username) <= 20),
  date_key text NOT NULL,
  attempts integer NOT NULL CHECK (attempts >= 1 AND attempts <= 6),
  hard_mode boolean DEFAULT false,
  time_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX leaderboard_unique_day ON leaderboard(username, date_key);
CREATE INDEX leaderboard_date_idx ON leaderboard(date_key);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Public insert" ON leaderboard FOR INSERT WITH CHECK (
  char_length(username) >= 2 AND char_length(username) <= 20
  AND attempts >= 1 AND attempts <= 6
);
```

-----

## Deployment

Deployed on Vercel. The `vercel.json` at the project root handles SPA routing rewrites and sets all security headers at the CDN edge, no server-side code needed.

Environment variables are set in the Vercel dashboard and never committed to the repo.

-----

## What I’d Add Next

- Anonymous Supabase Auth to prevent username squatting on the leaderboard
- Nonce-based CSP to replace `unsafe-inline` for scripts
- A larger, curated word list (currently ~200 words; enough to run for months without repeating)
- Light mode

-----

## License

MIT