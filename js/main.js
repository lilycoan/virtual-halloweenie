// Virtual Hallo"weenie": Lab Breach
// Checkpoint 1: layout scaffold only. Audio, pause clock, ambience and story come in later checkpoints.

const stage = document.getElementById('stage');
const enterBtn = document.getElementById('enter-btn');

// ?debug in the URL outlines every tap target to check alignment with the background
if (new URLSearchParams(location.search).has('debug')) {
  document.body.classList.add('debug');
}

// App state lives on the stage element so CSS can react to it: start | explore | paused | story
function setState(next) {
  stage.dataset.state = next;
}

// ?skip jumps past the start screen (dev only, for screenshots)
if (new URLSearchParams(location.search).has('skip')) {
  setState('explore');
}

enterBtn.addEventListener('click', () => {
  setState('explore');
});

// Placeholder prop handler: confirms every prop receives taps and key presses
stage.querySelectorAll('.prop').forEach((prop) => {
  prop.addEventListener('click', () => {
    console.log('[prop]', prop.dataset.prop, prop.dataset.index ?? '');
  });
});
