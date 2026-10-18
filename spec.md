# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Keep a concise, testable description of the experience currently being built.

## Working agreement

Developer: Begin with the running prototype, approve the intended behavior, test it directly, and update this file when the intended result changes.

Agent: Read `AGENTS.md`, `brief.md`, `research.md`, and this file, then inspect the project. Turn decisions into acceptance checks without inventing product choices or freezing details that still require testing.

Start a fresh chat with:

`Read the project documents, inspect the running prototype, and help me specify the next useful build checkpoint.`

## Current build contract

Define only enough to build and verify the current direction:

- the intended User experience and chosen scene, ambience, and story behavior
- the system structure, shared rules, and states that keep audiovisual behavior and interaction coordinated
- the assets and layout needed for that structure, linking to sources and credits in `research.md`
- acceptance checks for the chosen behavior and every requirement in `brief.md`, including accessibility and failure behavior

Reference the brief's fixed requirements rather than copying them. Specify your decisions precisely enough that the Developer and Agent can judge the same result. Leave untested details open until they are needed, and distinguish provisional ideas from approved behavior.

### Phase 1 contract — approved by Developer 2026-10-16

**Experience.** At night, in an empty city overrun by goofy cartoon zombies, a glowing futuristic lab towers in the center. The tone is spooky but playful (ages 10+, no gore). The User explores by tapping and discovers the lab's "breach" story.

**Scene (one portrait screen, no scrolling).**
- Focal point: the lab tower, centered in the upper-middle with a beacon on top and three warning lights on its facade.
- Environmental features (painted): (1) overgrown ruined skyscrapers framing both sides, (2) a cracked, weedy road leading to the lab, (3) two streetlights, (4) the moon and toxic-green sky. *Revised 2026-10-16: props are light/silhouette overlays on painted features (see research.md).*
- Tappable props: the 3 warning lamps (trigger), the moon (glow + owl hoot), the crows (they flee and return + caw), the left streetlight (sparks + blackout + zap), the right streetlight (power surge + hum), and the lab door ("ACCESS DENIED" + two-tone beep).
- Art: hybrid. The background is AI-painted by the Developer. Props, lights and effects are SVG/CSS layered on top by the Agent.

**Layers (back to front).** Sky and background image → distant shamblers → fog (back) → interactive props → fog (front) and flying crow → story FX → UI (hint text, Play/Pause).

**Layout model.** A single stage with a fixed portrait aspect ratio (9:19.5) that scales to fit the viewport and is centered. The leftover space is filled with the scene's sky color. Every layer and tap target is positioned in % of the stage, so the overlays stay aligned with the background on any phone.

**Ambient effects (all four chosen).** Drifting green fog; flickering streetlights; a slow pulse on the lab beacon; distant shambling silhouettes; a crow flying across the sky. *(Blowing newspapers were removed after playtest 2: testers took them for tappable objects.)*

**Ambient audio.** Looping wind with distant groans and an occasional far-off siren. Every file must be CC0 or public domain, with its source and terms verified in `research.md`.

**Global states.** `start` → `explore` → `story` → `explore`, with a separate pause flag, so a story can be paused mid-way. Pressing P also toggles pause, and the app auto-pauses when hidden. One shared clock and a pause flag control all animation (CSS `animation-play-state` plus a JS loop), all audio, the hint timers and input.

**Start screen.** Title, one-line premise, Enter button, and credits link. Enter unlocks audio and starts the scene. If `prefers-reduced-motion` is set, the fog, crow and shamblers are static or very slow, there are no flashes or shakes, and the story uses fades instead.

**Play/Pause.** One small corner button (≥44px, keyboard-focusable, with `aria-pressed`). It freezes all motion, sound, timers and taps, including mid-story, and resumes exactly where things stopped.

**Story 1: Lab Breach (provisional).**
- *Trigger:* tap the facade warning lights in a 4-step pattern: **middle → bottom → middle → top** (`LAMP_ORDER`). *Revised after playtest 3: any 3-step order can be solved by sweeping.*
  - A correct tap lights that lamp solid red, plays a beep that rises with progress (C5/E5/G5/C6) and pops an n/4 pip, so progress is visible.
  - A wrong tap plays a buzz, all lamps blink, and progress resets.
  - Other props (car, streetlight, neon, crows) each give their own small tap reaction and sound, but don't advance the story.
- *Sequence (~8s):*
  - Beginning (0–2s): an alarm blares, the beacon spins red and the screen edges pulse.
  - Middle (2–6s): vents burst out green gas and cartoon zombie silhouettes stagger toward the viewer, getting bigger.
  - End (6–8s): a white "decontamination" flash and whoosh pull the gas and zombies back into the lab, the doors slam, and the lights return to normal.
- *During the story:* all other taps are disabled. When it ends, an "all clear" chime and fade return to the explore state, and the story can be replayed.

**Goal and progress (revised twice on 2026-10-18; see plan.md, peer playtest 1).**
- Framing: "Something is sealed inside the lab. Can you wake it up?" The badge reads "Lab events n/N". *Replaced the earlier "secrets" wording, which testers misread.*
- On the first completion of a story, a center **UNLOCKED: [story]** card appears with a chime, then flies into the badge.
- Shared prop rule: every non-trigger prop tap ends by blinking the lamp pattern. The lamps answer only after 4 off-target taps, with a 15 s cooldown. The lab door reads "ACCESS DENIED". *Revised after playtest 2: the earlier version was too direct.*
- ~~Unlit lamps show a ripple ring as a tap affordance.~~ Removed after playtest 3: it made the lamps too obvious.
- The start screen states the goal, and a "Secrets n/N" badge sits top-left. Each story counts once, and replays don't add to it.
- N = `EVENT_TOTAL` in `js/main.js`.
  - **Phase 1: N = 1.** The Developer's call (2026-10-18), so playtesters don't hunt for stories that don't exist yet. 
  - **Phase 2:** set N = 3. The goal becomes "…wake all 3 events?", and the found message switches between "the city is hiding more" and "You woke the lab!".

**Hints (progressive, never instructions).**
- *In-scene hint:* first at 12 s, then every 14 s (every 24 s once found), while no lamp is lit, the lamps softly blink the 4-step pattern (0.55 s per step) with quiet rising beeps.
- *Text hints:* they appear by "effective idle", which is the time since last progress plus 1 s per non-lamp tap:
  - 15 s: "Something in the lab keeps blinking…"
  - 35 s: "Those lab lights blink in a certain order. Were you watching?"
  - 60 s: "Count the blinks… one light speaks twice."
- *Reaction messages:*
  - wrong lamp: "Wrong order… the alarm system reset." (3 s)
  - mid-progress: "The lab noticed you… keep going."
  - story done: "Secret found! The city is hiding more…" while some remain, or "You woke the lab! Tap the lights again to replay." once all are found (4 s)
  - after that: "The lab is resetting… it might breach again." (15 s idle)
- Each correct tap pops an n/4 pip.

**Accessibility.** Every interactive prop is a focusable `<button>` with an aria-label, and Enter/Space activate it. Visible focus rings. Text ≥16px with contrast ≥4.5:1. Tap targets ≥44px.

**Acceptance checks (Phase 1).**
1. The scene fits portrait phones from 360×640 up to 430×932 with no scrolling and the overlays aligned.
2. Enter starts the audio and animation, and reduced motion is honored from the very first frame.
3. Play/Pause freezes and resumes everything together, including mid-story.
4. Every prop gives unique audiovisual feedback, and the lamps show trigger progress.
5. The story runs 5–10s with a clear beginning, middle and end, blocks other input, returns cleanly, and can be replayed without a reload.
6. The hints appear progressively.
7. The whole experience is playable by keyboard alone.
8. The live HTTPS URL works on a physical phone.
9. A credits screen lists the Developer and every asset.

## Scope and revisions

Excluded for Phase 1: stories 2–3 (candidates: Manhole Rising, Antidote Mix, Emergency Broadcast), haptics, and 3D.

Record excluded ideas, the next behavior that must work, and consequential requirement changes with their evidence.

## Saving the transcript

When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
