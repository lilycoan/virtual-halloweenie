# Project 4 Brief

## Client need and project challenge

A local theme park wants to test a seasonal promotion that people can explore on a smartphone. The experience should act as a virtual “[weenie](https://en.wikipedia.org/wiki/Weenie_\(design\))” that rewards exploration and builds interest in visiting the physical park.

You'll create Virtual Hallo"weenie", a Halloween-themed phone app with one interactive scene, ambient effects, and three discoverable spooky stories. The tone must be spooky, playful, and appropriate for ages 10 and older, without disturbing gore, realistic violence, or real-world suffering.

For this project, you will works as the Developer in collaboration with AI Agents. Your peers will serve as Users during usability testing. The development documents provide less step-by-step guidance than earlier projects. You must identify the next useful question, keep the Agent focused, test its work, and judge when the experience is complete.

## Project requirements

2D graphics are the expected approach. Use 3D only if you are already comfortable with real-time 3D workflows.

You choose the scene, focal point, environmental features, visual style, spooky stories, triggers, clue and hint systems, technical approach, assets, and sound design. Make these choices in service of the Client's promotional goal and the intended User experience. Drive the development process: direct the Agent, evaluate its work, and use testing and revision to achieve a high-quality result that meets the project goals and requirements. Do not use any specific branding.

### Ambient scene

Develop a distinctive setting and atmosphere. Use AI to explore possibilities, then choose a direction of your own. The examples below are starting points, not required content; different features, effects, and sounds are welcome when they support the project's tone and goals.

- Create one cohesive scene of your own design that fits a vertical smartphone screen without scrolling or switching pages.
- Give it a strong focal point and at least three distinct environmental features. These might be a haunted house, pumpkin patch, and graveyard, or another combination suited to your setting.
- Bring the scene to life with at least three ambient effects. Possibilities include falling leaves, flying bats, flickering jack-o-lanterns, drifting fog, or moving clouds; invent or explore others that fit your scene.
- Include looping ambient background sound chosen for your atmosphere, whether wind, occasional hooting owls, distant cackling, or a different soundscape.

For ambient audio and story effects, ask the Agent to find suitable public-domain or [CC0](https://creativecommons.org/public-domain/) sounds and verify each asset's source and usage terms before you use it. [Freesound.org](https://freesound.org/) may have some good options.

### Spooky stories

- Include three discoverable audiovisual stories using animation, sound, and visual effects, each with a clear beginning, middle, and end. Each must last 5–10 seconds and be replayable without reloading.
- Trigger each story through scene interaction, such as tapping three objects in order. All interactions must produce audiovisual feedback. Tiggers must respond uniquely and show progress toward completion. Provide progressive text hints over time to help Users discover the triggers. These should be hints. Don't just tell them what to do.
- Disable all other scene interactions while a story plays, then return clearly to the interactive scene when it ends.

Example: Tapping the biggest pumpkin in the patch three times transforms it into a jack-o-lantern, which transforms the others. They glow brighter, then fizzle out in a puff of smoke and return to their original state.

### Technical and quality requirements

- Build with browser-based HTML, CSS, and JavaScript.
- Begin with a start screen whose Enter button launches the scene and enables audio and animation. Honor the device’s reduced-motion preference before the experience begins.
- Provide one unobtrusive Play/Pause control that pauses and resumes all motion, sound, effects, timers, and scene interaction together.
- Make interaction reliable by touch and keyboard, with readable text, sufficient contrast, and appropriately sized tap/click targets.
- Deploy to a public HTTPS URL and verify the finished app on a physical smartphone.
- Credit the Developer and all external code, visual, and audio assets. Use only original, AI-generated, public-domain, or appropriately licensed material.
- Polish the visuals, sound, interactions, and pacing into a cohesive experience with stable, consistent behavior.

## Workflow

Build a functioning prototype early, then improve it through repeated cycles of research, specification, planning, implementation, testing, and revision. Expect dozens of small iterations to manage assets, troubleshoot audiovisual behavior, and refine interactions. Keep consequential decisions and changes current in `research.md`, `spec.md`, and `plan.md` without documenting every minor adjustment.

1. Set up. Create a new repository from the Project 4 template and run it in VS Code’s browser preview. Keep the preview running as you develop.
2. Design the background and screen layout. Choose the composition and visual direction, then fit the static background—or 3D camera and base environment—to the phone viewport.
3. Add the initial layers. Add transparent foreground elements, the interface, and reserved effects or particle layers—or the equivalent 3D scene structure—and verify the complete composition. See this [graphics/VFX layering example](https://www.artstation.com/artwork/Qzmx4B).
4. Establish the ambience. Build and verify the ambient effects, ambient audio, start screen, and Play/Pause behavior one system at a time.
5. Develop the first story. Design it around the established scene. Implement, test, and refine its audiovisual sequence before adding the required trigger and interaction behavior. Iterate until the complete story is cohesive and well timed.
6. Playtest Phase 1. Let peer Users explore the prototype on smartphones without explanation or assistance. Observe first, ask questions afterward, and choose revision priorities.
7. Repeat and complete. Use the playtest findings to revise the prototype, then apply the same build cycle to the remaining stories. Verify the finished app against every requirement.
8. Debrief. Add the provided `debrief.md` and follow its instructions.

## Deliverables

### Phase 1: Playtest prototype (week 1)

1. A working prototype meeting the ambient-scene requirements, with the start screen, Play/Pause control, and one complete story meeting the spooky-story requirements.
2. A shareable working URL verified on a physical smartphone.
3. All project files, including the current project documents and git log.

### Phase 2: Playtest, complete, and polish (week 2)

1. Peer-playtesting notes and evidence of sustained testing, consequential revisions, and final verification.
2. The completed app meeting all requirements above.
3. All project files, including updated project documents, sources and credits, git log, and completed debrief.
