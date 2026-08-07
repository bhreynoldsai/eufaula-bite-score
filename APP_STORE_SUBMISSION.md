# Publishing Eufaula Bites to the Apple App Store

Eufaula Bites is a web app (React + Vite). To put it on the App Store it must be
**wrapped as a native iOS app**. This repo is now set up to do that with
[Capacitor](https://capacitorjs.com). The steps below that run in **Xcode** or a
**web portal** must be done on **your Mac with your Apple account** — they can't
be done from a cloud coding session.

---

## What's already in the repo (done for you)

- **`capacitor.config.json`** — Capacitor config (`appId: com.eufaulabites.app`,
  `webDir: dist`). Change `appId` to your own reverse-domain bundle ID if you
  want (e.g. `com.truenorth.eufaulabites`) before adding the iOS platform.
- **`package.json`** — Capacitor dependencies and helper scripts:
  `npm run ios:add`, `npm run ios:sync`, `npm run ios:open`.
- **`resources/icon-1024.png`** — the 1024×1024 App Store icon.
- Draft store screenshots (delivered separately) — see "Screenshots" below.

---

## Prerequisites (yours to obtain)

| Need | Where | Cost |
|---|---|---|
| A Mac | — | — |
| Xcode | Mac App Store | Free |
| CocoaPods | `sudo gem install cocoapods` | Free |
| **Apple Developer Program** membership | https://developer.apple.com/programs/ | **$99 / year** |

---

## Step 1 — Wrap the app (Terminal, on your Mac)

```bash
git clone https://github.com/bhreynoldsai/eufaula-bite-score.git
cd eufaula-bite-score
npm install
npm run build          # produces dist/
npm run ios:add        # creates the native ios/ project (runs `cap add ios`)
npm run ios:sync       # copies the web build into the iOS app
npm run ios:open       # opens the project in Xcode
```

## Step 2 — Set the icon

Easiest: install the asset generator and point it at the icon in this repo:

```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#0a1628' --ios
```

(It reads `resources/icon-1024.png` and writes every required iOS icon size.)

## Step 3 — Configure signing in Xcode

1. In Xcode, select the **App** target → **Signing & Capabilities**.
2. **Team:** choose your Apple Developer team (sign in with your Apple ID).
3. **Bundle Identifier:** must match `appId` in `capacitor.config.json`
   (`com.eufaulabites.app`) and be unique on the App Store.
4. Set a **Version** (e.g. 1.0.0) and **Build** (e.g. 1).

## Step 4 — Register the app in App Store Connect

**Portal:** https://appstoreconnect.apple.com → **My Apps** → **＋** → **New App**

- Platform: iOS
- Name: **Eufaula Bites** (must be unique across the App Store)
- Primary language, Bundle ID (pick the one you registered), SKU (any string)

## Step 5 — Upload the build

1. In Xcode: **Product → Archive** (set the run destination to "Any iOS Device").
2. In the Organizer window that opens: **Distribute App → App Store Connect → Upload**.
3. The build appears in App Store Connect under your app → **TestFlight** /
   **App Store** tab after ~10–30 min of processing.

## Step 6 — Fill in the listing (App Store Connect)

Attach: the build from Step 5, the **screenshots** (Step below), description,
keywords, support URL (your Vercel URL works), privacy policy URL, age rating,
and category (Sports or Weather fit well).

## Step 7 — Submit for review

**Submit for Review.** Apple review typically takes ~24–72 hours. You'll get an
email on approval or rejection.

---

## Screenshots — sizes Apple requires

App Store Connect requires at least one set. The **6.7″ iPhone** set is the one
most commonly required:

| Device class | Portrait pixels |
|---|---|
| 6.7″ iPhone (15/14 Pro Max) | **1290 × 2796** |
| 6.5″ iPhone (11 Pro Max) | 1242 × 2688 |
| 12.9″ iPad Pro (if you support iPad) | 2048 × 2732 |

**About the draft screenshots in this handoff:** they were rendered at the
correct 6.7″ size but in an environment with **no internet**, so live weather/
gauge data didn't load (you'll see the "data unavailable" banner and 0 scores).
They show the layout only. **Capture final screenshots from the live app** — run
it in the iOS Simulator (**Xcode → Simulator → iPhone 15 Pro Max**, then
`Cmd+S` to save a screenshot) or on a real phone, on a day with real data, so
the scores and feeds are populated.

---

## The two portals you'll upload to

1. **Apple Developer** — https://developer.apple.com — join the program, register
   the Bundle ID, manage signing.
2. **App Store Connect** — https://appstoreconnect.apple.com — create the app
   record, upload the build, add screenshots + metadata, submit for review.

Both require **your Apple ID with the paid Developer membership**. There is no
way to create these listings from outside Apple's portals.

---

## Alternative that needs none of the above

If the goal is just "an app on the phone," the app can be an **installable PWA**
(Add to Home Screen) with no Apple account, fee, or review. Ask and I'll add the
manifest + icons — it's a much shorter path than the App Store.
