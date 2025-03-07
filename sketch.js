//global for the controls and input
var controls = null;
//store visualisations in a container
var vis = null;
//variable for the p5 sound object
var sound = null;
//variable for p5 fast fourier transform
var fourier;
//variable for popup
let popup;

// Manual track list and index
let trackList = [
  "assets/losingControl.mp3",
  "assets/redrum.mp3",
  "assets/stomper_reggae_bit.mp3",
];
let currentTrackIndex = 0;

// Load the first track so something is ready to play at launch
function preload() {
  sound = loadSound(trackList[0]);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // 1) Initialize main controls (handles keyboard, toggling popup, etc.)
  controls = new ControlsAndInput();

  // 2) Create FFT object for audio analysis
  fourier = new p5.FFT();

  // 3) Create a container for all visualizations and add them
  vis = new Visualisations();
  vis.add(new Spectrum());
  vis.add(new WavePattern());
  vis.add(new Needles());
  vis.add(new CircularWaveform());
  vis.add(new ParticleMask());
  vis.add(new DebugVisual()); // for debugging FFT data if you like

  // 4) Create the new popup UI
  popup = new PopupUI();
}

function draw() {
  background(0);

  // Draw the currently selected visualization
  vis.selectedVisual.draw();

  // Show or hide the popup based on the boolean in controls
  if (controls.popupDisplayed) {
    popup.showUI();
  } else {
    popup.hideUI();
  }

  // Keep the progress slider updated if sound is playing
  if (sound && sound.isPlaying()) {
    let pct = map(sound.currentTime(), 0, sound.duration(), 0, 100);
    // Use standard DOM assignment for an HTML range input
    popup.progressSlider.value = pct;
  }

  // Draw any additional controls (like the text menu)
  controls.draw();
}

// Called whenever the mouse is clicked
function mouseClicked() {
  controls.mousePressed();
}

// Called whenever a key is pressed
function keyPressed() {
  controls.keyPressed(keyCode);

  // If the current visual is "particleMask", activate the webcam
  if (vis.selectedVisual.name === "particleMask") {
    vis.selectedVisual.activateWebcam();
  }
}

// When the window is resized, resize the canvas and notify the visual if needed
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (vis.selectedVisual.hasOwnProperty("onResize")) {
    vis.selectedVisual.onResize();
  }
}
