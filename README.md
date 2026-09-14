# Attendance Tracker & Reminder

Local-first attendance tracker for classes, office shifts, or anything else you check in for.
No backend, no account, no cloud database — all data lives in your browser's storage
(IndexedDB) on your device. Export/import a JSON backup anytime (BYOS: bring your own storage).

## What's built (v1)

- Home screen: presence ring (today's check-in progress) + "Add attendance" + list of tracked items
- Setup wizard: name it → pick category (Class/Office/Custom) → pick check-in method(s)
  (manual, QR, location, or biometric+signature hybrid) → set a check-in window → configure reminders
- Reminders: while the app is open, a ping (2s) + vibration (3s) + on-screen alert that can only
  be dismissed by Submit attendance / Remind me in 10 min / Ignore for today
- Stats page: attendance % per tracked item, full history
- Settings: export/import your data as a JSON file

## Known limitation (by design, for v1)

Real "impossible to ignore" reminders — the kind alarm apps do, that fire even when the app is
closed or the phone is locked — require native code. A website (even installed as a PWA) can't
force itself open. **v1 reminders work while the app is open/foregrounded.** The upgrade path to
true native reminders is below.

---

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the printed localhost URL. This uses Vite + React + Tailwind + Dexie (IndexedDB).

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial attendance tracker"
gh repo create attendance-tracker --public --source=. --push
# or manually: create a repo on github.com, then
# git remote add origin https://github.com/<you>/attendance-tracker.git
# git branch -M main
# git push -u origin main
```

## 3. Deploy to Vercel

Easiest: go to [vercel.com/new](https://vercel.com/new), import the GitHub repo, and click Deploy.
Vercel auto-detects Vite — no config needed (the included `vercel.json` handles client-side routing).

Or via CLI:
```bash
npm i -g vercel
vercel
vercel --prod
```

You'll get a live `https://your-project.vercel.app` URL — installable as a PWA on Android/iOS/desktop
straight from the browser (Add to Home Screen).

## 4. Package for the Play Store

### Icons first
Replace the placeholder `public/favicon.svg` with real app icons at
`public/icons/icon-192.png` and `public/icons/icon-512.png` (referenced in `vite.config.js`).

### Option A — TWA (fastest, ships the current PWA as-is)
Uses [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) to wrap your live Vercel URL
into an Android app.

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://your-project.vercel.app/manifest.webmanifest
bubblewrap build
```
This produces a signed `.aab` ready to upload to the Play Console. Reminders will behave the same
as the PWA (foreground-only) — see limitation above.

### Option B — Capacitor (needed for true unmissable reminders, v2)
Wraps the same web code in a native shell so you can add native Android plugins:

```bash
npm i @capacitor/core @capacitor/android
npm i -D @capacitor/cli
npx cap init "Attendance Tracker" "com.yourname.attendance"
npm run build
npx cap add android
npx cap sync
npx cap open android
```

From there, the reminder takeover becomes a native Android feature using:
- `AlarmManager.setExactAndAllowWhileIdle` to schedule reminders precisely, even if the app is closed
- A **full-screen intent notification** (the same mechanism alarm-clock and incoming-call apps use)
  to force the lock/reminder screen open over anything else
- A **foreground service** to keep the ping/vibration running reliably

This is genuinely native Kotlin/Java work (a few hundred lines), not something achievable in the
JS layer — happy to build this out as the next phase once v1 is live and tested.

### Play Store submission checklist
- Google Play Console developer account ($25 one-time)
- Signed `.aab` from Bubblewrap or Capacitor/Android Studio
- Privacy policy page (required even for local-only apps) — since no data leaves the device,
  this can be short; I can draft one
- Store listing: screenshots, short/long description, app icon, feature graphic

## Project structure

```
src/
  lib/db.js              IndexedDB schema + export/import (the BYOS layer)
  lib/reminderEngine.js  ping/vibration logic
  components/            PresenceRing, ItemCard, ReminderOverlay, ReminderWatcher
  pages/                 Home, AddAttendance, Stats, ItemDetail, Settings
```
