# Implementation Plan

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Track the next useful build checkpoints, verification, and consequential revisions.

## Working agreement

Developer: Keep the browser preview running, choose priorities, test results directly, and plan only the next few checkpoints.

Agent: Read the project documents and inspect the files. Keep each checkpoint small enough to run and judge. Do not expand scope or mark Developer verification complete.

Start or continue a fresh chat with:

`Read the project documents, inspect the current build, and help me complete the next unchecked checkpoint.`

## Checkpoints

Create your own checklist for the next few results, using the workflow in `brief.md` and the current `spec.md`. Name the main risk, what each checkpoint should produce, and how you will verify it. Review and approve the approach before implementation.

Test each result before continuing, including related behavior that already works. Update priorities as evidence emerges and preserve meaningful working checkpoints in git. Before delivery, verify the deployed app against the brief and specification.

### Phase 1 (due Mon 2026-10-19)

Live URL: https://lilycoan.github.io/virtual-halloweenie/ (repo: lilycoan/virtual-halloweenie, Pages from `main` /)
Main risk: mobile audio unlock and overlay alignment on real phones, so we deploy early and test on a phone at every checkpoint.

- [x] **1. Stage, layers, UI shell, deploy.** One 9:19.5 stage with %-positioned layers, a start-screen shell, a pause button shell and a hint strip. The Developer's painted background (`bg-city.jpg`, a compressed copy of `Moonlit Ruins and the Last Tower.png`) is in place. *Agent verified:* screenshots at 360×640, 390×844 and 430×932, and the live URL returns 200. *Developer:* still needs to open it on a phone.
- [x] **1b. Restyle props to match the painting.** Light-only overlays, as decided by the Developer.
- [x] **2. Start screen + reduced motion + Play/Pause + shared pause clock.** *Agent verified (headless Chrome via CDP):* reduced motion is detected before Enter, Pause suspends the AudioContext, and the scene clock stayed frozen at 9716 ms through 2 s of pause mid-story.
- [x] **3. Ambient effects + CC0 ambient audio.** Fog (2 depths), streetlight flicker, beacon pulse, shamblers, newspapers, a flying crow, a wind loop, and random groans/caws/siren. *Agent verified:* all 8 buffers decode with no console errors. *Developer:* needs to listen on a phone.
- [x] **4. Lab Breach sequence.** ~8.6 s, plus a 0.45 s lead-in: alarm 0–1.8 s → gas/zombies 1.8–6 s → decon flash/ALL CLEAR 6–8.6 s. *Agent verified* with screenshots of each phase. Debug: `labBreach()` in the console, or `?skip&story`.
- [x] **5. Trigger, prop reactions, hints, input lock, credits.** *Agent verified:* the wrong lamp resets, 3 correct lamps start the story, the moon tap is ignored during the story, the state returns to explore with lamps reset, and the credits panel renders.
- [ ] **6. Full keyboard + phone verification, then Phase 1 playtest**

Dev flags: `?debug` outlines tap targets; `?skip` bypasses the start screen.
Local preview: `python3 -m http.server 8765`, then open http://localhost:8765

## Evidence and revisions

Record non-identifying playtest observations, separating what Users did or said from your interpretation. Use the findings to choose revision priorities and record what changed and how you verified the improvement.

### 2026-10-18: Developer phone test (iPhone)

- **Observed:** the app works on the phone and the sound is good. "It's unclear what I'm supposed to do… I just tap some stuff and lights flicker, but nothing indicates what to do or is intuitive."
- **Causes found in the code:**
  1. No stated goal.
  2. The trigger lamps look exactly like the other props.
  3. The first hint waited 20 s and ignored taps on other props.
  4. Other props gave no sign that they weren't progress.
- **Revision (Developer approved all four):**
  1. A goal line on the start screen plus a "Secrets 0/3" badge.
  2. The lamps softly blink the top→bottom pattern every 10 s while no lamp is lit.
  3. Hints come earlier (8/22/40 s), each non-lamp tap counts as +5 s, and there are reaction messages for a wrong order, mid-progress and a found secret.
  4. A "1/3" pip pops from each correctly lit lamp.
- Also fixed `react()` cleanup timers, which were keyed by prop name, so the three lamps cancelled each other's cleanup. They're now keyed per element.
- **Verified (Agent, CDP):**
  - the pattern runs at 4 s, and hint 1 appears at 8.7 s
  - 3 non-lamp taps jump straight to hint 2
  - a wrong order shows its message, and all lamp classes are cleaned up afterward
  - the pip shows "1/3"
  - the counter goes to 1/3 after the story, and a replay doesn't double-count
- **Developer:** needs to re-test on the phone. Next step: a peer playtest without any explanation.

Keep implementation progress and verification here. Update `research.md` when evidence changes a decision and `spec.md` when intended behavior changes; link to those updates rather than duplicating them. Record consequential changes, not every small adjustment.

## Saving transcripts

When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md` or `transcripts/build-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.

### 2026-10-18: Peer playtest 1 (Phase 1)

- **Observed (relayed by the Developer):**
  - Testers tapped everything but were unsure how to "find secrets". Apart from the containment breach, "nothing seems to happen."
  - After getting frustrated they asked, "how do you reveal [a] secret?"
  - Follow-up from the Developer: testers *did* trigger the breach but didn't realize it was the secret. They noticed the other props' reactions, but those felt pointless.
- **Interpretation:**
  1. The word "secret" set an expectation of a hidden reveal, which didn't match the show that plays.
  2. The "found" signal was small and in the wrong place: the bottom hint strip after the story, plus a corner badge.
  3. The non-trigger props were dead ends.
- **Revision (Developer approved):**
  1. New framing: "Something is sealed inside the lab. Can you wake it up?", with the badge renamed to "Lab events n/N".
  2. A center **UNLOCKED: Lab Breach** card with a chime that flies into the badge on the first completion.
  3. A **shared rule**: every non-lamp prop tap ends by blinking the lamp pattern, and the lab door reads "ACCESS DENIED / CHECK ALARM LIGHTS ↑".
  4. A ripple ring on unlit lamps as a "tap me" affordance (a static ring in reduced motion).
- **Verified (Agent, CDP):**
  - a door tap shows the clue and then blinks the lamps
  - the card shows after the story, then hides at 3.4 s
  - the badge goes from 0/1 to 1/1, and a replay shows no card and no double count
  - no console errors
- **Next:** re-run the peer playtest with new testers. Watch whether they connect the breach to the goal, and how long it takes them to first tap a lamp.
