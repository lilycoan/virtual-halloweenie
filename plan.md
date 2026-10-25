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
- [x] **6. Full keyboard + phone verification, then Phase 1 playtests.**
  - *Developer:* verified on an iPhone (works, sound good) and ran 4 rounds of peer playtests (below).
  - *Agent, keyboard-only test with real key events:*
    - It found and fixed a bug: Tab went to the hidden scene props before Enter.
    - Fix: one `setState()` now makes the scene layers `inert` on the start screen.
    - Re-test: Tab → Enter first, then the props in order → Pause. Space/Enter activate lamps, P pauses and blocks input, and the story returns focus to the scene. The focus ring is visible.

### Phase 2 (due ~Mon 2026-10-26)

Main risk: the zoom into the interior lining up with the painted door on every phone, while pause and reduced motion still work. The second risk is that the new triggers end up too obvious or too hidden, so we playtest each one as soon as it works.

- [x] **7. Shared story runner + door unlock + zoom shell.** Refactor Lab Breach into a story runner shared by all three stories (state, input lock, ducking, reveal). The door opens after the first breach. The zoom goes in and out to a placeholder interior until the Developer's painting arrives. *Verify:* Lab Breach behaves exactly as before; pause freezes the zoom mid-way; reduced motion crossfades.
  - *Agent verified (CDP), 2026-10-19:*
    - The Lab Breach tap trigger plays the story again; the card, the 1/1 count and focus are unchanged.
    - The door then opens: `lab-open`, ACCESS GRANTED, and a two-tone "granted" beep on tap.
    - The `zoomTest` story zooms into the Developer's interior painting and back. While paused, the world transform held at scale 2.875 over 2 s and the clock was frozen.
    - A moon tap during the story was ignored, and the state returned to explore.
    - With reduced motion, the transform stays `none` (opacity crossfade only).
    - Bug found and fixed: a console hook named `window.playStory` overwrote the runner and recursed. It's now `runStory()`.
- [x] **8. Antidote Mix sequence**, previewed with `?skip&open&story=antidote`. It runs 8.4 s.
  - *Sequence:*
    - 0–1.1 s: zoom in
    - 1.1 s: beakers bubble and shift color, the vat glows, blub sounds
    - 3.0 s: vat foam swells and spills down the glass, gurgle
    - 4.3 s: mist drifts to the tank, fizz
    - 5.2 s: the tank flashes and a goofy zombie waves "hic!"
    - 6.4 s: ✓ ANTIDOTE STABLE
    - 7.3 s: zoom out
  - *Agent verified (CDP):*
    - The phase classes fire on time, and the state returns to explore.
    - Screenshots showed weak foam, mist and flash on the first pass. Revised: a foam spill sheet, a denser mist, and a bright tank flash that covers the painted figure.
    - Reduced motion: no transform, bubbles hidden, no rocking.
    - The clock held at 3600 ms through a 2 s pause.
- [x] **9. Eclipse trigger + hints.**
  - The crow's flights now run on the scene clock instead of CSS, so pause freezes them and hits are tested against the crow's exact position.
  - Hints now target the first story that is available and unfound; each story carries its own trigger hints.
  - `EVENT_TOTAL` is now derived from `STORIES`.
  - *Agent verified (CDP):*
    - An early tap does nothing.
    - A hit gives 1/3, and a double tap in the same crossing still gives 1.
    - A miss resets to 0 with "The moon slipped back into shadow…".
    - 3 hits tint the moon (opacity 0.9) and start Antidote Mix, and the card appears.
    - Spam test: 3 taps/s for 60 s through 2 real moon crossings reached at most 1/3.
    - Moon hints appear at 15/35/60 s, and `is-eclipsed` (green flicker) shows during the crossing.
    - Hit window: ~1.0 s normally, ~3.6 s with reduced motion.
    - Bug fixed: the per-crossing check used a counter id; it now compares the flight object.
  - **Risk for playtest:** moon crossings come only about every 25–30 s, so a perfect solve takes 1–1.5 min, and a miss resets it. Watch for frustration. The tuning levers are `FLIGHT_MS`, the flight gap in `startFlight`, and `ECLIPSE_HALF_WIDTH`.
- [x] **9b. Explorable lab interior + easier Eclipse** (Developer's revision after their own test: the moon trigger was "way too hard", and they wanted to go inside).
  - Door → lab view (zoom), ⟵ Street → back. Interior props: window moon, 2 monitor walls, tank, beakers and vat. The other view is inert/hidden.
  - Eclipse moved to the window moon: a pass every ~6.5–9.5 s, a ~2 s window, 2 hits. Antidote Mix now plays inside with no zoom (7.6 s).
  - "Where" hints point to the lab when the next event is inside.
  - *Agent verified (CDP), real flow with no forced timing:*
    - Lamps → door opens → the 10 s hint "The lab door is open now…" → door tap enters the lab. Focus goes to the window moon, the street is inert and the lab is active.
    - The window crow was caught after 5.3 s, then 8.6 s later (2/2), and Antidote Mix played inside. The card shows, the badge reads 2/2, and focus returns to the window moon.
    - ⟵ Street returns: focus goes to the top lamp, and the lab is inert.
    - Spam test: 3 taps/s for 60 s reached at most 1/2.
    - Hit window: 2.0 s normally, 2.6 s with reduced motion.
    - Tap targets line up with the painting at 390×844 and 360×640 (`?debug`).
    - The window crow was enlarged after a screenshot showed it was too small to notice.
- [x] **9c. Eclipse = one catch** (Developer: "still not intuitive"). `ECLIPSE_HITS = 1`. *Agent verified (CDP):* an early tap does nothing; one tap during a real pass (3.75 s in) started Antidote Mix, and the card showed.
  - **Open risks:**
    - Tapping the moon nonstop will now solve it within one pass.
    - The brief's "show progress toward completion" now rests only on the green flicker.
- [x] **9d. Reason to tap the moon** (Developer: "no reason to tap moon").
  - Changes: an entry pulse (×3), an approach glow (`--near`), and the first moon hint moved to 8 s.
  - *Agent verified (CDP):* `is-beckoning` is on 1.9 s after entering, with the glow at 0.93, and it's cleared by 5.9 s. `--near` read 0.14 as the crow approached and 0.67 over the moon. The hint is empty at 7 s and shows at 8.5 s.
- [x] **10. Emergency Broadcast sequence**, previewed with `?skip&open&lab&story=broadcast`. It runs 8 s; the badge now reads n/3 (`EVENT_TOTAL` is derived from `STORIES`).
  - *Agent verified (CDP):*
    - The phases fire on time: static at 0.6 s; the typed alert at 1–2.2 s; the map and count at 3.9 s; JUST A TEST at 5.4 s. The state returns to explore at 9.75 s, and the card appears.
    - At 360 px, the longest banner is 270 of 295 px wide.
    - Pause at 3.6 s: the counter held at 516 and the clock held for 2 s, with the dot animations paused.
    - Reduced motion: no static roll, alert blink or glitch animation.
    - Fixed while building: the glitch used `transform`, which would have moved the positioned screens. It's now filter-only.
- [x] **11. Monitor count trigger + hints** (inside, on the monitor walls).
  - *Agent verified (CDP):*
    - The first round came 3.3 s after entering (left wall, count 2).
    - 3 taps for a count of 2 failed with the reset message.
    - A tap on the other wall mid-answer reset the round.
    - Exactly 2 taps showed ●● and "The screens are listening…", then started Emergency Broadcast, and the card appeared.
    - Spam: 45 s of random taps on both walls and 45 s of steady taps on one wall started 0 stories.
    - Hints appear at 8.5/31/56 s.
  - The test driver (`cdp.mjs`) was recreated after macOS cleared the scratchpad's `/tmp` folder. The raw Freesound downloads in `audio-src/` were also lost; they aren't needed, since the trimmed versions are committed.
- [ ] **12. 3/3 ending, credits, simplification pass, deploy, phone + playtests 5–6.**
- [ ] **13. Final verification against the brief + `debrief.md`.**

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

### 2026-10-18: Peer playtest 2 (Phase 1)

- **Observed (relayed by the Developer):**
  - Testers recognized the breach as the goal, so the playtest 1 fix worked.
  - They found it too quickly: "too much hand-holding when it told you what to do immediately after tapping [the] wrong thing."
  - "Check alarm lights was too direct."
  - They were confused by the tiny light rectangles floating across the bottom (the newspapers), especially since those weren't tappable.
- **Interpretation:** the clues stacked up too fast. The door text named the solution, every off-target tap blinked the lamps, and taps sped up the hints by 5 s each. The newspapers read as UI or interactive objects, not as scenery.
- **Revision:**
  - The door reverts to "ACCESS DENIED".
  - The lamps answer only after 4 off-target taps, with a 15 s cooldown.
  - The tap speed-up drops to 1 s per tap.
  - Text hints move to 15/35/60 s.
  - The ambient pattern blink moves to first at 12 s, then every 14 s.
  - The newspapers are removed. Five ambient effects remain.
  - All pacing values are named constants at the top of the hints section in `js/main.js`.
- **Verified (Agent, CDP):** after 3 off-target taps there's no blink and no hint; the 4th tap brings the lamp blink; the door text and no-newspapers change are confirmed.
- **Next:** playtest again and watch the time to first lamp tap. If it's now too slow, lower `POINT_AFTER_TAPS` or the hint times.

### 2026-10-18: Peer playtest 3 (Phase 1)

- **Observed (relayed by the Developer):** time to the first lamp tap was 2 s, 3 s and 3 s for three testers.
- **Interpretation:** all three tapped before any hint could fire (the first blink is at 12 s, the first text hint at 15 s), so the lamps themselves gave it away.
  1. The ripple rings added in playtest 1 made the lamps the most "tappable"-looking thing on screen.
  2. Top→bottom is reading order, so the first guess solved it.
  3. *Agent simulation:* with 3 lamps, every order is a rotation of a top-down or bottom-up sweep, so repeated sweeping solves any 3-step order in 3–5 taps.
- **Revision (Developer approved):**
  - Removed the ripple rings.
  - The trigger is now a 4-step pattern with a repeat: **middle → bottom → middle → top** (`LAMP_ORDER`).
  - Beeps rise with progress (C5–C6), and pips show n/4.
  - The pattern blink plays this order at 0.55 s per step.
  - Hints: 35 s "Those lab lights blink in a certain order. Were you watching?", 60 s "Count the blinks… one light speaks twice."
- **Verified (Agent, CDP):**
  - 12 top-down sweep taps reach only 2/4, and 12 bottom-up taps reach 0
  - the correct pattern starts the story, and the repeated lamp shows "3/4"
  - the blink order was recorded as 1@12.0 s, 2@12.6 s, 1@13.1 s, 0@13.7 s
  - no console errors
- **Next:** playtest again and time both the first lamp tap and the full solve. The risk is now the other way: if testers never notice the blink, the 35/60 s hints need to arrive sooner.

### 2026-10-18: Peer playtest 4 (Phase 1)

- **Observed (relayed by the Developer):** "much better, varied for all playtesters and was a challenge this time."
- **Interpretation:** the 4-step pattern produces a real but solvable challenge, and solve times now spread across testers rather than clustering at 2–3 s. No further pacing changes for Phase 1.
- **Carry to Phase 2:** apply the same lessons to stories 2–3:
  - the payoff names itself (unlock card)
  - triggers can't be solved by sweeping
  - clues live in the scene, and text hints come later
  - nothing that looks interactive is decoration only

### 2026-10-19: Phase 1 final verification

- **Developer:** opened the latest deployed build (`2b77334`) on a physical iPhone and confirmed it works. Also confirmed the credits name, "Lily Coan".
- Phase 1 deliverables are complete: the working prototype at https://lilycoan.github.io/virtual-halloweenie/, the current `research.md`/`spec.md`/`plan.md`, the git log, and transcripts in `transcripts/`.
