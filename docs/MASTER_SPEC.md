# Sobh Royesh Treasure Game

## Master Product, UX, Visual & Technical Specification

---

# 0. PURPOSE OF THIS DOCUMENT

This document is the authoritative specification for the entire **Sobh Royesh Treasure Game** project.

Codex/Astra must read this document before implementing or modifying any major feature.

## CRITICAL IMPLEMENTATION RULE

**Do NOT attempt to implement the entire project in a single pass.**

This project will be developed in multiple controlled phases.

For every development task:

1. Read this document first.
2. Inspect the current repository and existing implementation.
3. Implement **only the phase explicitly requested in the current task**.
4. Preserve previously working functionality.
5. Do not prematurely implement later phases unless required for clean architecture.
6. Do not replace working components unnecessarily.
7. Do not leave incomplete code, placeholders, fake implementations, TODOs, or comments such as:

   * `// implement later`
   * `// rest of code here`
   * `TODO`
   * temporary fake logic

The current task determines **what should be implemented now**.

This document determines **how the final product must behave**.

If a current task conflicts with this specification, explicitly report the conflict before making a destructive architectural change.

---

# 1. PROJECT VISION

Create a highly engaging, colorful, polished browser-based game for **Sobh Royesh**.

The player moves through a visual treasure-map adventure containing **five checkpoints**.

Each checkpoint opens one mini-game.

After successfully completing the five games, the player reaches a treasure chest.

The five mini-games are:

1. Visual Memory Test
2. Stop-the-Timer Challenge
3. Zoomed Image Guessing
4. School Maze
5. Mini Sudoku

The product must feel like **one continuous adventure**, not five disconnected web pages.

---

# 2. TARGET AUDIENCE

Primary audience:

**Adults aged approximately 20–50**

The visual experience should therefore be:

* playful
* joyful
* energetic
* colorful
* polished
* intelligent
* intuitive
* visually memorable

It must **not** feel like a children's educational website.

Avoid:

* childish typography
* baby-like characters
* excessive cartoon clichés
* overly simple preschool-style UI
* generic corporate dashboards

The desired feeling is closer to a **premium casual mobile game** combined with an elegant educational experience.

---

# 3. TECHNICAL PLATFORM

The application must be deployable as a static web application through **GitHub Pages**.

Preferred stack:

* React
* TypeScript
* Vite
* modern maintainable CSS
* SVG
* CSS-based visual effects
* Canvas only where technically useful

Use currently stable and mutually compatible package versions.

Do not require:

* backend servers
* databases
* authentication
* paid APIs
* server-side rendering
* external AI services
* API keys

The production application must run entirely client-side.

---

# 4. ENGINEERING QUALITY

This must be a reliable working application, not a mockup.

Use:

* strict TypeScript
* modular architecture
* reusable components
* predictable game-state management
* centralized configuration
* robust pointer/touch events
* deterministic game logic
* proper cleanup of timers
* proper cleanup of event listeners
* robust localStorage handling
* responsive layouts

Avoid:

* huge monolithic components
* duplicated logic
* hardcoded state transitions scattered through files
* naive timers
* fragile desktop-only interaction
* undocumented magic values

---

# 5. APPLICATION STATE

Use an explicit game progression state.

Conceptually:

* INTRO
* MAP_STAGE_1
* GAME_1
* MAP_STAGE_2
* GAME_2
* MAP_STAGE_3
* GAME_3
* MAP_STAGE_4
* GAME_4
* MAP_STAGE_5
* GAME_5
* TREASURE_COMPLETE

The exact implementation architecture may differ, but progression must remain deterministic.

Users must **not** be able to open locked stages.

Completed checkpoints must persist.

Progress should survive browser refresh using localStorage.

Provide a clearly separated:

**Restart Adventure**

feature.

Restart must ask for confirmation before clearing progress.

If stored data is corrupted or invalid, recover gracefully instead of crashing.

---

# 6. LANGUAGE

All player-facing interface content must be in **Persian**.

Application direction:

```html
dir="rtl"
```

Persian text must be:

* real HTML/SVG text
* correctly rendered RTL
* right-aligned where appropriate
* readable on mobile
* not embedded into generated raster images

Do not create Persian interface text as part of AI-generated illustrations.

---

# 7. SOBH ROYESH BRAND

Primary organizational color:

**#0D7572**

RGB:

**13, 117, 114**

This teal should remain the dominant identity color.

The experience may use additional joyful colors, especially inside illustrations and games, but the overall interface must remain visually coherent.

Official Persian font:

**IranSans**

Important:

Do not download unauthorized IranSans files.

If licensed IranSans files are already present in the repository, configure them.

Otherwise:

* use an appropriate Persian system fallback
* prepare a documented font location
* explain in README where licensed IranSans files should later be placed

Do not invent or redesign the Sobh Royesh logo.

If no official logo is present in repository assets, produce the interface **without a logo**.

---

# 8. VISUAL LANGUAGE

Use:

* organic forms
* rounded geometry
* subtle depth
* soft shadows
* natural curves
* visual references to growth
* leaves
* trees
* sun
* school
* play
* learning
* discovery
* community

The preferred visual direction for the map and environmental illustrations is:

**2.5D / pseudo-3D / isometric**

The experience should feel dimensional without requiring heavyweight WebGL.

Use:

* SVG layering
* gradients
* soft shadows
* perspective
* elevation
* overlapping objects
* subtle motion

Avoid heavy 3D dependencies unless absolutely justified.

Performance is more important than technically true 3D.

---

# 9. RESPONSIVE DESIGN

Primary experience:

**smartphones in portrait orientation**

Also support:

* tablets
* laptops
* desktops

Minimum QA viewports:

* 390 × 844
* 768px tablet width
* 1440px desktop width

Essential interactions must not depend on hover.

Tap targets must be mobile-friendly.

Use Pointer Events when interactions require touch/mouse/stylus compatibility.

---

# 10. INTRO SCREEN

Create a short and visually polished opening screen.

Suggested Persian title:

**ماموریت پنج‌مرحله‌ای صبح رویش**

Suggested supporting line:

**پنج چالش را پشت سر بگذار و به گنج برس!**

Primary CTA:

**شروع ماجراجویی**

The intro should visually hint at the treasure-map world.

Do not add a long tutorial or onboarding slideshow.

The player should enter the game quickly.

---

# 11. MASTER TREASURE MAP

The treasure map is the central hub of the entire experience.

Create a visually memorable 2.5D/isometric miniature world.

Possible environmental elements:

* hills
* trees
* rocks
* bridges
* pathways
* books
* pencils
* school objects
* plants
* flags
* clouds
* small landmarks
* treasure chest

The map must contain:

* one player character
* five checkpoints
* one final treasure destination
* a clear winding path

---

# 12. MAP PROGRESSION

At the start:

* player stands before checkpoint 1
* checkpoint 1 is active
* checkpoints 2–5 are locked
* treasure is locked

After completing a game:

1. return to map
2. animate the character along the route
3. reach the next checkpoint
4. visually unlock it
5. let the player manually click the checkpoint

Do **not** automatically open the next mini-game.

The act of reaching and clicking each checkpoint is part of the adventure.

---

# 13. CHECKPOINT STATES

Each checkpoint needs clear visual states:

### Locked

Future stage.

### Current

Clickable stage.

Use a subtle visual cue such as:

* glow
* breathing animation
* gentle pulse

### Completed

Use one or more:

* small flag
* check indicator
* environmental transformation
* illuminated path

Do not rely only on color.

---

# 14. CHECKPOINT THEMES

Checkpoint 1 — Memory

Possible visual theme:

* classroom
* backpack
* colorful school objects

Checkpoint 2 — Timer

Possible visual theme:

* stopwatch
* clock tower
* timing station

Checkpoint 3 — Image Guess

Possible visual theme:

* magnifying glass
* telescope
* observation station

Checkpoint 4 — Maze

Possible visual theme:

* hedge maze
* school pathway

Checkpoint 5 — Sudoku

Possible visual theme:

* number tiles
* puzzle gate
* puzzle temple

Final destination:

* large treasure chest

The checkpoint itself should be interactive.

Avoid plain rectangular menu buttons placed on top of the map.

---

# 15. GAME 1 — VISUAL MEMORY TEST

## Objective

Display a colorful, detailed school-related scene.

The player studies it.

Then the image disappears.

Question:

**چند شیء زرد در تصویر بود؟**

Provide:

* numeric input
* submit action

---

# 16. GAME 1 — SCENE

Create a custom illustrated school scene.

Possible objects:

* notebooks
* ruler
* pencils
* backpack
* books
* pencil case
* scissors
* eraser
* water bottle
* clock
* globe
* art supplies
* ball
* lunch box
* classroom plant
* sticky notes
* school bell

The scene should be:

* colorful
* visually rich
* charming
* clear
* polished
* not childish

---

# 17. GAME 1 — YELLOW OBJECT RULE

There must be exactly:

**7 clearly identifiable yellow objects**

The correct answer is therefore:

**7**

Examples may include:

* yellow backpack
* yellow ruler
* yellow notebook
* yellow pencil case
* yellow cup
* yellow ball
* yellow lunch box

The exact final composition can differ.

Critical rule:

Do not add ambiguous yellow decorative details to unrelated objects.

A player must be able to objectively count exactly seven yellow objects.

Store the answer in centralized configuration.

---

# 18. GAME 1 — FIRST ATTEMPT

Initial image exposure:

**10 seconds**

A subtle countdown may be shown.

Do not distract the player from observing the scene.

After 10 seconds:

* scene disappears
* question appears
* answer input appears

Suggested CTA:

**ثبت پاسخ**

---

# 19. GAME 1 — CORRECT ANSWER

If answer = 7:

Show:

**آفرین! حالا برو مرحله بعدی.**

Use a short positive animation.

Then return to map.

The character travels to checkpoint 2.

---

# 20. GAME 1 — WRONG ANSWER

Show:

**سوختی! دوباره امتحان کن.**

Restart the game.

On every retry after the initial failed attempt:

image exposure becomes:

**5 seconds**

Do not reveal the correct answer.

Allow continued retries until success.

---

# 21. GAME 2 — STOP THE TIMER

Show:

* large digital timer
* prominent red stop button
* target
* remaining attempts

Timer begins at:

**0:00**

Target:

**10:00**

Interpret display as:

**seconds : centiseconds**

Therefore 10:00 means exactly 10 seconds.

Instruction:

**تایمر را دقیقاً روی 10:00 متوقف کن.**

---

# 22. GAME 2 — TIMER ENGINEERING

Do not base timer accuracy solely on setInterval.

Use:

**performance.now()**

or an equivalent monotonic clock.

Rendering may use:

**requestAnimationFrame**

The displayed value and success calculation must remain consistent.

Success occurs when the rounded centisecond display equals:

**10:00**

---

# 23. GAME 2 — ATTEMPTS

Maximum normal attempts:

**3**

Show remaining attempts.

Example:

**فرصت باقی‌مانده: ۳**

After failure, display the stopped time.

Example:

**9:84**

Then:

**نشد! دوباره تلاش کن.**

CTA:

**تلاش دوباره**

---

# 24. GAME 2 — SUCCESS

If player reaches exactly 10:00:

Show:

**عالی بود! دقیقاً روی 10:00!**

Then allow return to map and progression.

---

# 25. GAME 2 — MAGIC WAND

After three failed attempts:

Show:

**عیب نداره! تو یک قدرت ویژه داری.**

Then:

**می‌تونی از چوب جادو استفاده کنی و بری مرحله بعد.**

Create a visually attractive animated magic wand.

When activated:

* wand appears
* sparkles/particles appear
* timer visually changes to 10:00

Show:

**جادو انجام شد!**

Then:

**ادامه مسیر**

Return to map.

Move player to checkpoint 3.

The magic wand is a playful rescue mechanism.

It must not shame or punish the user.

---

# 26. GAME 3 — ZOOMED IMAGE GUESS

Game 3 uses a real photo supplied by the organizer.

The image represents:

**دهکده صبح رویش**

Primary accepted answer:

**دهکده**

The photo initially appears heavily zoomed.

The player must guess what the image is.

---

# 27. GAME 3 — PRODUCTION IMAGE

Primary production asset:

```text
public/assets/dehkadeh.jpg
```

If this image exists, use it.

The implementation must allow easy adjustment of:

* zoom scale
* focal X
* focal Y

Store those settings centrally.

---

# 28. GAME 3 — SETUP MODE

Provide an organizer-only configuration interface accessible through a parameter such as:

```text
?setup=1
```

This mode must not appear during normal player use.

Setup tools:

* upload village image
* image preview
* zoom-factor control
* focal X control
* focal Y control

Browser-local uploads may be stored in IndexedDB or equivalent local browser storage for testing.

Clearly document:

A locally uploaded image affects only that browser.

To make the image available to all GitHub Pages visitors, the final image must be committed as:

```text
public/assets/dehkadeh.jpg
```

If useful, provide a way to copy/export focal configuration.

---

# 29. GAME 3 — QUESTION

Display the zoomed image.

Question:

**فکر می‌کنی این تصویر چیه؟**

Provide:

* Persian text input
* submit button

CTA:

**ثبت پاسخ**

Maximum normal attempts:

**3**

---

# 30. GAME 3 — PERSIAN NORMALIZATION

Normalize harmless Persian text differences before checking.

Handle:

* extra spaces
* zero-width non-joiners
* Persian/Arabic Yeh
* Persian/Arabic Kaf
* punctuation
* repeated whitespace

Accept reasonable variants including:

* دهکده
* دهکده صبح رویش
* دهکده‌ی صبح رویش

Do not use overly broad fuzzy matching that accepts unrelated answers.

---

# 31. GAME 3 — FIRST WRONG ANSWER

Show:

**اشتباه گفتی.**

Hint:

**راهنمایی: این تصویر مربوط به صبح رویش هست.**

Allow second attempt.

---

# 32. GAME 3 — SECOND WRONG ANSWER

Show:

**هنوز نه!**

Hint:

**راهنمایی دوم: این توی دبستان‌هاست.**

Allow third attempt.

---

# 33. GAME 3 — CORRECT ANSWER

If correct at any point:

Show:

**آفرین! اینجا دهکده صبح رویش هست.**

Smoothly animate the image from zoomed to full view.

Then show:

**مرحله بعد**

Return to map.

Advance to checkpoint 4.

---

# 34. GAME 3 — THIRD FAILURE

After third incorrect answer:

Ask:

**دوباره می‌خوای از چوب جادو استفاده کنی؟**

Options:

**بله، چوب جادو!**

**یک بار دیگه فکر می‌کنم**

If magic wand is selected:

* animate wand
* smoothly zoom image out
* reveal complete photo

Show:

**اینجا دهکده صبح رویش هست.**

Then:

**مرحله بعد**

If the user wants to think again:

allow another manual attempt.

Do not trap the user.

---

# 35. GAME 4 — SCHOOL MAZE

Create an interactive maze.

At the entrance:

a school-age boy.

At the destination:

an illustrated school.

School sign:

**مدرسه صبح رویش**

The Persian school name must be rendered as HTML/SVG text.

Do not bake it into a generated image.

---

# 36. GAME 4 — VISUAL STYLE

The maze should belong to the same visual world as the treasure map.

Possible design:

* miniature garden maze
* low hedges
* school courtyard
* colorful path
* trees
* books/pencils as subtle decorations

Do not make it resemble a black-and-white worksheet.

---

# 37. GAME 4 — DIFFICULTY

Difficulty:

**medium-light**

It should be:

* not trivial
* not frustrating

Most adult players should succeed within approximately:

**2–3 attempts**

Use a deterministic maze.

Do not generate random mazes on every session.

The route should contain:

* multiple turns
* several plausible wrong branches
* corridors wide enough for finger use

---

# 38. GAME 4 — INTERACTION

Player begins by touching/clicking the boy.

They then drag through the maze toward the school.

Draw a subtle path/trail.

Support:

* touch
* mouse
* stylus

Use Pointer Events.

If the player hits a wall:

* stop current attempt
* gently indicate collision
* clear current trail
* reset to starting position

Message:

**اوه! به دیوار خوردی. دوباره امتحان کن.**

---

# 39. GAME 4 — COLLISION QUALITY

Do not check only isolated pointer coordinates.

Fast pointer movement must not allow users to jump through walls.

Collision handling must test/interpolate movement between previous and current positions or use another robust segment collision approach.

Handle:

* pointercancel
* pointer leaving interaction area
* rapid movement
* mobile touch

---

# 40. GAME 4 — SUCCESS

When the player reaches the school:

Show:

**رسیدی به مدرسه!**

Use a small success animation.

CTA:

**ادامه مسیر**

Return to map.

Advance to checkpoint 5.

---

# 41. GAME 4 — ADAPTIVE ASSISTANCE

If the user repeatedly fails, slightly reduce frustration.

Possible approach after multiple failures:

* subtly clarify valid corridor
* slightly adjust collision tolerance

Do not reveal the full solution.

Do not make the maze automatically complete itself.

---

# 42. GAME 5 — MINI SUDOKU

Use a:

**6 × 6 Sudoku**

Sub-grids:

**2 × 3**

Difficulty:

**medium**

Use a fixed validated puzzle.

The puzzle must:

* have exactly one valid solution
* be solvable
* provide reasonable medium difficulty

Do not simply remove random numbers from an unvalidated grid.

---

# 43. GAME 5 — SUDOKU UI

Create a polished modern Sudoku interface.

Include:

* 6×6 grid
* clear sub-grid borders
* number pad 1–6
* pencil/notes mode
* eraser
* selected-cell highlight
* selected-row highlight
* selected-column highlight
* selected-sub-grid highlight
* matching-number highlight
* clear difference between clues and user values

Tools:

**مداد**

**پاک‌کن**

**شروع دوباره**

Use icons plus labels where appropriate.

---

# 44. GAME 5 — INTERACTION

When selecting a cell, highlight:

* cell
* row
* column
* sub-grid

When a number is selected, optionally highlight matching digits.

Normal mode:

number enters the selected editable cell.

Pencil mode:

number toggles as a small candidate note.

Eraser:

clears editable value or notes.

If useful, remove resolved candidates from peers when a definitive number is entered.

---

# 45. GAME 5 — ERRORS

If an entry violates Sudoku rules:

communicate the conflict visually.

Do not aggressively block the user.

Do not reveal the solution.

---

# 46. GAME 5 — COMPLETION

When puzzle is correctly solved:

show success.

Return to map.

The character travels from checkpoint 5 to the treasure chest.

Treasure chest opens.

Use tasteful celebratory particles/confetti.

Final message:

**تبریک! هر پنج مرحله رو پشت سر گذاشتی.**

Secondary message:

**گنج پیدا شد!**

Optional action:

**بازی دوباره**

Restart must require confirmation before clearing progress.

---

# 47. GLOBAL FEEDBACK SYSTEM

Use consistent states throughout the experience.

### Success

Positive visual feedback + clear next action.

### Failure

Friendly feedback + retry option.

### Current stage

Visible active state.

### Locked stage

Clearly unavailable.

### Completed stage

Visibly completed.

Avoid excessive modal dialogs.

Prefer integrated overlays/cards when possible.

---

# 48. ANIMATION

Good animation opportunities:

* character movement
* path illumination
* checkpoint unlock
* flags appearing
* zoom transitions
* timer stop
* magic wand
* subtle environmental motion
* treasure chest opening
* success particles

Avoid:

* constant bouncing
* overly long transitions
* excessive simultaneous animation
* distracting motion during the memory test
* animation that blocks interaction unnecessarily

Support:

```css
prefers-reduced-motion
```

---

# 49. SOUND

Sound is optional.

If implemented:

* default OFF
* provide toggle
* never autoplay without user interaction
* keep effects lightweight

Possible sounds:

* checkpoint unlock
* success
* wand
* treasure

The application must work perfectly without sound.

Do not introduce licensing risk merely to add sound effects.

---

# 50. ACCESSIBILITY

Provide:

* semantic buttons
* keyboard-accessible core navigation
* visible focus states
* adequate contrast
* large touch targets
* readable text
* ARIA labels for icon-only controls where necessary
* reduced-motion support

Important states must not rely exclusively on color.

---

# 51. PERFORMANCE

Prioritize smartphone performance.

Avoid unnecessarily large dependencies.

Prefer:

* SVG
* CSS
* optimized images
* efficient animation

Do not preload every large asset at application startup.

The Game 3 image does not need to block initial loading.

---

# 52. MISSING ASSET HANDLING

If:

```text
public/assets/dehkadeh.jpg
```

is missing:

the application must not crash.

Provide a clear development/setup fallback.

Normal gameplay should remain visually stable.

Do not expose stack traces to users.

---

# 53. CENTRAL CONFIGURATION

Use a central configuration location, for example:

```text
src/config/gameConfig.ts
```

Suitable values include:

* memory initial display duration
* memory retry duration
* yellow object count
* timer target
* timer attempt count
* accepted image answers
* image hints
* image zoom
* image focal point
* maze parameters
* Sudoku puzzle
* UI text where appropriate

Avoid scattering hardcoded values across unrelated components.

---

# 54. PROJECT STRUCTURE

Use a modular architecture.

Example only:

```text
src/
  components/
    common/
    map/
  games/
    MemoryGame/
    TimerGame/
    ImageGuessGame/
    MazeGame/
    SudokuGame/
  config/
  hooks/
  state/
  utils/
  styles/
```

The exact structure may differ.

Do not place the entire project in one component.

---

# 55. TESTING EXPECTATIONS

Critical game logic should have automated tests.

Final project testing should eventually cover:

### Progression

* stage locking
* completion
* persistence
* reset

### Memory

* initial timing
* retry timing
* correct answer
* wrong answer

### Timer

* target calculation
* attempt count
* magic wand fallback

### Image Guess

* Persian normalization
* hints
* accepted answers
* magic wand

### Maze

* collision helper logic where practical

### Sudoku

* puzzle validity
* unique solution
* row validation
* column validation
* sub-grid validation
* completion
* note utilities

Preferred test tools may include:

* Vitest
* React Testing Library
* Playwright when useful

Do not add unnecessarily heavy test infrastructure for trivial behavior.

---

# 56. GITHUB PAGES

The final project must support deployment at:

```text
https://USERNAME.github.io/REPOSITORY_NAME/
```

Do not assume deployment at `/`.

Vite base-path behavior must be correct.

Eventually provide a GitHub Actions workflow such as:

```text
.github/workflows/deploy.yml
```

The workflow should:

* checkout
* install dependencies
* run appropriate checks
* build
* deploy to GitHub Pages

Deployment configuration may be implemented in the dedicated deployment/QA phase rather than prematurely.

---

# 57. README REQUIREMENTS

The final README should eventually explain:

* local development
* installation
* production build
* testing
* GitHub Pages deployment
* location of `dehkadeh.jpg`
* Game 3 focal configuration
* IranSans font setup
* project architecture

Do not link to unauthorized font downloads.

---

# 58. PERSIAN MICROCOPY

Tone:

* conversational
* playful
* energetic
* respectful
* concise

Avoid:

* bureaucratic wording
* overly childish language
* long instructions

Each game should ideally explain itself in one or two short sentences.

The player should understand what to do within a few seconds.

---

# 59. USER EXPERIENCE PRINCIPLES

Do not create long tutorials.

Do not overload screens with text.

Prioritize:

* obvious interaction
* strong visual hierarchy
* short feedback
* immediate responses
* clear progress

The experience should feel like a game, not an online form.

---

# 60. VISUAL QUALITY BAR

Do not produce generic Bootstrap-style screens.

Do not make the mini-games look like dashboard cards.

The entire experience needs a coherent visual world.

Prioritize:

* composition
* depth
* visual storytelling
* character movement
* environmental detail
* polish
* consistency
* mobile usability

---

# 61. CHILD REPRESENTATION

Any representation of children must remain respectful and dignified.

Avoid:

* stereotypes
* depictions emphasizing poverty
* sad or exploitative imagery
* infantilization

Children may be depicted as:

* active
* curious
* learning
* moving
* participating

---

# 62. PROHIBITED IMPLEMENTATION SHORTCUTS

Do not:

* build only static mockups
* replace games with slideshow screens
* create fake interactions
* skip locked-stage logic
* use naive timer calculations
* create an unusable touch maze
* create an unvalidated Sudoku
* reveal answers immediately after mistakes
* make magic-wand usage humiliating
* download unauthorized fonts
* invent the official logo
* put Persian text into generated raster images
* leave incomplete files
* leave placeholders
* leave TODOs
* use comments instead of real implementation
* silently remove requested functionality

---

# 63. PHASED DEVELOPMENT RULE

The project will be implemented incrementally.

A typical sequence may include:

1. Technical Foundation
2. Treasure Map & Navigation
3. Games 1 & 2
4. Games 3 & 4
5. Game 5 & Final Treasure
6. Full QA
7. Visual Polish
8. GitHub Pages Deployment

This sequence is informative.

**The current task prompt determines the exact phase to implement.**

Do not independently start later phases.

---

# 64. BEFORE EVERY DEVELOPMENT PHASE

Before modifying the codebase:

1. Read this specification.
2. Inspect existing repository structure.
3. Understand previously implemented behavior.
4. Identify the requested current phase.
5. Make the smallest coherent architectural changes needed.
6. Preserve working behavior from earlier phases.

---

# 65. BEFORE FINISHING EVERY PHASE

At minimum:

* ensure code compiles
* run relevant TypeScript checks
* run relevant tests
* run production build when practical
* fix errors introduced by the current phase
* remove accidental debug code
* verify there are no unfinished placeholders

Do not claim a feature is complete without actually implementing it.

---

# 66. CHANGE CONTROL

Do not silently change established game rules.

For example, do not independently change:

* number of stages
* memory timing
* yellow object answer
* timer target
* attempt counts
* Game 3 hints
* maze concept
* Sudoku size
* progression logic

Minor UX decisions may be made autonomously when necessary.

Material product changes should remain consistent with this specification unless explicitly requested by the user.

---

# 67. CURRENT-SCOPE PRIORITY

When receiving a new task, treat instructions in this order:

1. Explicit current-task requirements
2. This Master Specification
3. Existing working implementation
4. Reasonable engineering judgment

However, a current task requesting only one phase is **not permission to build later phases**.

---

# 68. FINAL PRODUCT STANDARD

When all phases are eventually complete, the project should feel like a cohesive, production-ready interactive experience.

The final application should be:

* visually distinctive
* joyful
* professional
* mobile-friendly
* responsive
* stable
* intuitive
* accessible
* performant
* maintainable
* suitable for GitHub Pages
* faithful to Sobh Royesh's visual and ethical identity

The objective is not merely to make every mini-game technically functional.

The objective is to create a memorable five-stage adventure that participants genuinely enjoy playing.
