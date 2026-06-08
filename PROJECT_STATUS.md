# Davina Aerospace — Project Status Prompt
> Use this as the starting brief for any new Claude session on this project.
> Last updated: Session 3 (cinematic 3D overhaul + deployment).

---

## What This Project Is

Single-page investor/pitch site for **Davina Aerospace** (India).
Stack: **React 19 + TypeScript + Vite 8 + Three.js (React Three Fiber) + Tailwind v4 + Lenis + Framer Motion**.

A fixed Three.js canvas renders a cinematic 3D backdrop (Earth, procedural drone, starfield).
HTML sections scroll on top of it.

**Deployed live at: https://davina-aerospace.vercel.app**
**GitHub: https://github.com/Atomstars/Davina_AeroSpace (main branch)**

---

## ⚠️ Important Architecture Note for Next Session

There are **two versions** of the site's architecture in the repo:

### Version A — What is currently LIVE on `origin/main` (what was deployed)
This is the simpler, cleaner version we built in the worktree. It lives in the committed codebase and is what Vercel serves.

Key structure:
```
src/
  App.tsx                          ← All sections inline (hero, technology, mission, about, leadership, programs, contact, footer)
  components/
    Scene.tsx                      ← R3F Canvas + camera + lights + post-processing
    Navbar.tsx
    AerospaceCursor.tsx
    VigilanceHUD.tsx
    DavinaLogo.tsx
    canvas/
      TacticalEarth.tsx            ← Globe with custom GLSL shaders
      MorphingHeroDrone.tsx        ← Procedural drone (fallback)
      HeroDrone.tsx                ← GLTF loader with error boundary → fallback
      GLTFHeroDrone.tsx            ← GLTF drone (loads public/models/drone.glb)
      DataStreams.tsx               ← GPU particle system (currently REMOVED from TacticalEarth)
  lib/
    scroll.ts                      ← Lenis instance + shared scrollState mutable object
    droneFlight.ts                 ← Shared hover/gyro/scroll-exit logic for both drone variants
  index.css                        ← Tailwind v4 tokens + all custom CSS
```

### Version B — Uncommitted work in the MAIN working tree (NOT live)
The main working tree (`C:\Claude Code Projects\Davina Aerospace`) has a much more complex
architecture (chapters/, content/davina.ts, QualityProvider, lenis.tsx, shaders/, hooks/) that
was built in a previous session but **never committed**. This is NOT what's deployed.

**If you want to work on the live site, work from the worktree or pull `origin/main`.**
**If you want to revive the chapter architecture, check the main working tree — but be aware
it would overwrite the cinematic overhaul.**

---

## Session 1 — What Was Done (previous session)

### ActiveTheory-Inspired Scroll & 3D Effects (never deployed — in main worktree only)
- `src/lib/scrollStore.ts` — Global scroll bridge
- `src/components/ScrollFXOverlay.tsx` — DOM speed lines overlay
- `src/components/canvas/DroneParticles.tsx` — Particle exhaust trail
- Modified: `lenis.tsx`, `Navbar.tsx`, `TacticalEarth.tsx`, `MorphingHeroDrone.tsx`, `Scene.tsx`, `App.tsx`
- Quality tier system (`detect-gpu`) gating all effects

---

## Session 2 — Cinematic 3D Overhaul (LIVE on origin/main)

This session did a full Active Theory-style visual redesign in the worktree
`claude/peaceful-newton-f45dc0`, committed it, and deployed it to production.

### What was built and shipped:

| Feature | Files |
|---|---|
| **Lenis smooth scroll** wired to shared scroll store | `src/lib/scroll.ts` |
| **Scroll-driven cinematic camera** — dives toward Earth on scroll | `src/components/Scene.tsx` |
| **Drone scroll exit** — climbs + banks out of frame as camera dives | `src/lib/droneFlight.ts`, `MorphingHeroDrone.tsx` |
| **Custom GLSL day/night terminator shader** on globe — city lights on dark side only | `src/components/canvas/TacticalEarth.tsx` |
| **Fresnel atmosphere glow shader** replacing flat backside sphere | `TacticalEarth.tsx` |
| **GPU-animated particle data-streams** (vertex-shader, ~zero CPU) | `src/components/canvas/DataStreams.tsx` — **created but then REMOVED from scene at user request** |
| **Environment map** (Lightformers) — drone metal reflects cyan/white | `src/components/Scene.tsx` |
| **Cinematic post-processing** — stronger bloom, chromatic aberration, grain | `src/components/Scene.tsx` |
| **GLTF drone loader** with graceful procedural fallback | `src/components/canvas/HeroDrone.tsx`, `GLTFHeroDrone.tsx` |
| **Holographic scan ring + contrail trails** on procedural drone | `MorphingHeroDrone.tsx` |
| **Asset-progress preloader** — real `useProgress()` load % display | `src/App.tsx` |
| **Top-of-page scroll-progress bar** — framer-motion spring | `src/App.tsx` |
| **Velocity-reactive camera banking** during fast scrolls | `src/components/Scene.tsx` |

### Deployment
- Pushed to `origin/main` via worktree: `git push origin HEAD:main`
- Deployed to Vercel: `vercel --prod` linked to project `davina-aerospace`
- **Live URL: https://davina-aerospace.vercel.app**

---

## Current State of the Live Site

### ✅ Working
- Smooth Lenis scroll
- Scroll-driven camera dive (hero → planet approach)
- Drone hovering with IMU-style gyro corrections, cursor parallax
- Drone climbs out of frame on scroll
- Globe with real GLSL day/night terminator + fresnel atmosphere
- Orbital rings around globe
- Environment-map reflections on drone metal
- Holographic scan ring + cyan contrail trails
- Cinematic post-processing (bloom, chromatic aberration, vignette, grain)
- Real asset-progress preloader
- Scroll progress bar
- All HTML sections (technology, mission, about, leadership, programs, contact)
- Contact form (client-side only — no backend yet)

### ❌ Not done / Pending
1. **GLTF drone model** — `public/models/drone.glb` does not exist yet. Drop any `.glb` there and it auto-loads. See `public/models/README.md`.
2. **Contact form backend** — form shows "sent" locally but POSTs to nothing. Needs a Vercel serverless function (`api/contact.ts`) using Resend to forward to `contact@davinaaerospace.com`.
3. **Particle data-streams** — `DataStreams.tsx` exists and works. User removed them this session. Can re-add by importing in `TacticalEarth.tsx` if desired.
4. **Mobile QA** — not tested on real devices.
5. **`davina-aerospace-public` Vercel project** — a second Vercel project exists (`https://davina-aerospace-public.vercel.app`). Unknown what it points to.

---

## How to Run Locally

```bash
# From the main repo dir OR the worktree:
npm install
npm run dev        # http://localhost:5173 (or another port if busy)
npm run build      # tsc -b && vite build
npx tsc --noEmit   # Type-check only
```

Preview tool in Claude Code:
```
# .claude/launch.json exists in the worktree at:
# C:\Claude Code Projects\Davina Aerospace\.claude\worktrees\peaceful-newton-f45dc0\.claude\launch.json
# Port 5180, server name "davina-dev"
preview_start("davina-dev")  # → http://localhost:5180
```

## Deployment Commands

```bash
# Push to GitHub (from worktree):
git push origin HEAD:main

# Deploy to Vercel production (from worktree — already linked):
vercel --prod --yes
```

---

## Key Files Quick Reference

| File | Purpose |
|---|---|
| `src/lib/scroll.ts` | Lenis init + `scrollState` mutable object (heroProgress, velocity, etc.) |
| `src/lib/droneFlight.ts` | Shared drone flight model — call `applyDroneFlight(group, t, pointer)` in useFrame |
| `src/components/Scene.tsx` | Canvas, camera, lighting, Environment, post-processing |
| `src/components/canvas/TacticalEarth.tsx` | Globe — GLSL shaders, orbital rings, clouds |
| `src/components/canvas/HeroDrone.tsx` | GLTF loader → error boundary → procedural fallback |
| `src/components/canvas/MorphingHeroDrone.tsx` | Procedural drone (active fallback) |
| `src/components/canvas/DataStreams.tsx` | GPU particles (inactive — not mounted) |
| `public/models/drone.glb` | **Drop a drone model here** to replace procedural |
| `src/index.css` | Tailwind v4 tokens, all custom CSS, Lenis base styles |
| `src/App.tsx` | Root: Lenis init, preloader, scroll bar, all page sections |

---

## Vercel Project Info

| | |
|---|---|
| **Project name** | `davina-aerospace` |
| **Live URL** | https://davina-aerospace.vercel.app |
| **Team** | `govadaakash-gmailcoms-projects` |
| **GitHub repo** | `Atomstars/Davina_AeroSpace` (auto-deploys from main) |
| **Inspector** | https://vercel.com/govadaakash-gmailcoms-projects/davina-aerospace |
