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

**Layers (back to front).** Sky and background image → distant shamblers → fog (back) → interactive props → fog (front) and debris → story FX → UI (hint text, Play/Pause).

**Layout model.** A single stage with a fixed portrait aspect ratio (9:19.5) that scales to fit the viewport and is centered. The leftover space is filled with the scene's sky color. Every layer and tap target is positioned in % of the stage, so the overlays stay aligned with the background on any phone.

**Ambient effects (all four chosen).** Drifting green fog; flickering streetlight and neon; a slow pulse on the lab beacon; distant shambling silhouettes plus blowing newspapers and crows.

**Ambient audio.** Looping wind with distant groans and an occasional far-off siren. Every file must be CC0 or public domain, with its source and terms verified in `research.md`.

**Global states.** `start` → `explore` → `story` → `explore`, with a separate pause flag, so a story can be paused mid-way. Pressing P also toggles pause, and the app auto-pauses when hidden. One shared clock and a pause flag control all animation (CSS `animation-play-state` plus a JS loop), all audio, the hint timers and input.

**Start screen.** Title, one-line premise, Enter button, and credits link. Enter unlocks audio and starts the scene. If `prefers-reduced-motion` is set, the fog, debris and shamblers are static or very slow, there are no flashes or shakes, and the story uses fades instead.

**Play/Pause.** One small corner button (≥44px, keyboard-focusable, with `aria-pressed`). It freezes all motion, sound, timers and taps, including mid-story, and resumes exactly where things stopped.

**Story 1: Lab Breach (provisional).**
- *Trigger:* tap the three facade warning lights in the correct order (top → middle → bottom; to be tested).
  - A correct tap lights that lamp solid red and plays a rising beep (beep pitch 1/2/3), so progress is visible.
  - A wrong tap plays a buzz, all lamps blink, and progress resets.
  - Other props (car, streetlight, neon, crows) each give their own small tap reaction and sound, but don't advance the story.
- *Sequence (~8s):*
  - Beginning (0–2s): an alarm blares, the beacon spins red and the screen edges pulse.
  - Middle (2–6s): vents burst out green gas and cartoon zombie silhouettes stagger toward the viewer, getting bigger.
  - End (6–8s): a white "decontamination" flash and whoosh pull the gas and zombies back into the lab, the doors slam, and the lights return to normal.
- *During the story:* all other taps are disabled. When it ends, an "all clear" chime and fade return to the explore state, and the story can be replayed.

**Hints (progressive, never instructions).** A text strip at the bottom shows each hint after this much idle time without progress:
- 20s: "Something in the lab is blinking…"
- 45s: "Warning lights like to follow a pattern."
- 75s: "Alarms usually start at the top…"

Hints reset after the story plays. After that, a replay nudge appears following 15s idle.

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
