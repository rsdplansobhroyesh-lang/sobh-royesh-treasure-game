# Phase 1 completion report

Verified on 2026-09-09. **Phase 1 only is implemented. Phase 2 has not started.**

The complete `docs/MASTER_SPEC.md` was read before changes. The source repository contained only that specification, which remains unchanged. Its source blob is `3b3b62db396b6125ba6146211a735ac17d1ea8fc`.

## Implemented foundation

- React 19.2.8, TypeScript 7.0.2 with strict application and test checking, Vite 8.2.2, and a locked pnpm dependency graph.
- Persian HTML shell with `lang="fa"`, `dir="rtl"`, logical CSS, touch-sized controls, keyboard focus, reduced motion, and responsive layouts.
- Global color, type, spacing, radius, shadow, motion, and sizing tokens, with primary brand color **#0D7572**.
- Central font architecture with local/system fallbacks and documented `public/fonts/` placement for future licensed IranSans files. No unauthorized fonts or invented logo.
- Central game configuration and explicit deterministic state progression.
- Intro, structural treasure-map hub, Game 1–5 placeholder states, and basic final treasure state.
- Validated, versioned localStorage saves; refresh recovery; clear error feedback; scoped restart after confirmation.
- Unit tests and production-browser tests; relative static asset paths compatible with GitHub Pages repository hosting.

## Architecture and state

Presentation components receive props. The pure reducer owns all stage transitions; the React integration hook persists accepted transitions and coordinates reset. Screens do not independently unlock stages.

The durable state contains `screen` and `completedStages`. Screens are `INTRO`, `MAP`, `GAME_1` through `GAME_5`, and `TREASURE_COMPLETE`. Completed stages must be a contiguous ordered prefix of `[1,2,3,4,5]`; the next unlocked stage is derived from that prefix.

Only the current checkpoint can open from the map. Only the active, current game can report completion. Completion always returns to `MAP`, including after Game 5. Opening the next stage or final treasure is a separate action. Duplicate and out-of-order events are ignored. Returning from a placeholder does not award completion.

The five game placeholders share one presentation component with separate explicit game states and centrally configured titles. No placeholder can emit a completion event. Later-game and final-state browser coverage uses reachable fixtures built through the production reducer and serializer in test code only.

## Persistence and reset

Storage key: `sobh-royesh:adventure`.

Envelope: `{ "version": 1, "state": { "screen": "MAP", "completedStages": [1, 2] } }`.

Accepted transitions save immediately. Both the envelope and state invariants are validated before restoration. Invalid data safely returns to the intro with a Persian notice. Unknown schema versions are preserved and cannot be overwritten without a confirmed restart. Blocked or full storage leaves the interface usable with a clear persistence notice.

Restart opens a native modal with cancellation initially focused, explicit keyboard focus wrapping, Escape handling, and focus restoration. Cancellation preserves progress. Confirmation removes only this game's key and then resets memory. Removal failure keeps progress and the confirmation dialog intact with an error message. Other localStorage keys are preserved. Browser storage events also reconcile updates from another tab.

## Verification results

| Check | Result |
| --- | --- |
| Strict TypeScript application checks | PASS |
| Strict TypeScript configuration and test checks | PASS |
| Vitest state and persistence tests | **54 passed, 0 failed** |
| Playwright production-browser tests | **24 passed, 0 failed** |
| Production build | **PASS**, Vite 8.2.2 |
| 390×844 mobile viewport | PASS, responsive RTL, no horizontal overflow, controls at least 44px |
| 768×1024 tablet viewport | PASS |
| 1440×900 desktop viewport | PASS |
| Refresh restoration | PASS for current game, completed checkpoints, map, and final state |
| Stage locking | PASS, only current stage enabled; no placeholder completion shortcut |
| Safe reset | PASS, Cancel/Escape retain progress; confirmation clears only game data and survives reload |
| Storage failures/recovery | PASS, corrupt JSON, impossible progression, unknown schema, blocked access, failed clearing |
| Keyboard navigation | PASS, Enter navigation, heading focus, dialog focus wrapping and restoration |
| Runtime application errors | No unhandled application errors in the browser suite |
| Repository subpath hosting | PASS at `/sobh-royesh-treasure-game/` against built assets |
| Specification preservation | Unchanged |

Browser verification used installed **Chrome 150.0.7871.182** through Playwright, with isolated contexts for each test. The downloadable test Chromium was unavailable from this environment, so `PLAYWRIGHT_CHANNEL=chrome` was used. Mobile and tablet are browser viewport/touch emulation; physical-device and other browser-engine QA remain later work.

The first browser run found a reset-dialog keyboard focus wrap problem, which was fixed. Test code also required checked stage lookups under strict indexed-access typing. The final build and all 24 browser tests passed after those fixes.

Screenshots of the intro, map, game placeholder, and reset dialog were captured. Mobile screenshots were visually inspected for Persian rendering, alignment, spacing, reading order, and dialog fit; desktop map composition was also inspected. The map is intentionally scrollable at small viewports.

Final production assets:

| Asset | Uncompressed | Gzip |
| --- | --- | --- |
| `dist/index.html` | 0.75 kB | 0.47 kB |
| CSS bundle | 10.91 kB | 2.65 kB |
| JavaScript bundle | 203.57 kB | 64.05 kB |

## Files created

The following 34 source/configuration/documentation files were created. Generated `dist/`, local dependencies, and browser test reports are excluded from this source-file inventory.

```text
.gitignore
.node-version
README.md
docs/PHASE_1_REPORT.md
index.html
package.json
playwright.config.ts
pnpm-lock.yaml
pnpm-workspace.yaml
public/fonts/README.md
src/App.tsx
src/main.tsx
src/components/AppShell.tsx
src/components/ResetDialog.tsx
src/config/gameConfig.ts
src/screens/FinalTreasureScreen.tsx
src/screens/GamePlaceholderScreen.tsx
src/screens/IntroScreen.tsx
src/screens/MapScreen.tsx
src/state/gameState.ts
src/state/gameState.test.ts
src/state/persistence.ts
src/state/persistence.test.ts
src/state/useAdventure.ts
src/styles/fonts.css
src/styles/global.css
src/styles/tokens.css
tests/adventure.spec.ts
tests/fixtures.ts
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
vitest.config.ts
```

## Decisions and boundaries for later phases

- **Mini-games remain unimplemented.** Their placeholder screens deliberately expose no success/skip controls. Normal Phase 1 use cannot earn the completions necessary to unlock Games 2–5 or the final treasure.
- **The map is structural only.** No final visual map, character movement, illustrations, or treasure celebration has been built. The next phase can use the existing checkpoint selectors while keeping travel animation separate from durable logical progression.
- `COMPLETE_GAME` is an integration contract for genuine future game results. Preserve manual next-checkpoint navigation and the master specification's exact game rules.
- Persistent data is limited to screen and checkpoints. Any future state extension needs an explicit schema/migration decision. Version 1 rejects unexpected state fields and invalid stage order.
- Persistence is browser-local and last-write-wins across tabs; it does not provide cloud sync or anti-cheat guarantees. Other apps on the same origin must use distinct storage keys.
- Licensed IranSans files and the organizer's `public/assets/dehkadeh.jpg` were not supplied. Their absence causes no requests or broken images in Phase 1. Add their configuration in the appropriate later phase.
- Runtime assets must respect the relative Vite base. No deployment workflow, publishing, or remote repository push was performed; the source and build are available locally for review.

Full setup, architecture, font instructions, and future integration contracts are in [README.md](../README.md).
