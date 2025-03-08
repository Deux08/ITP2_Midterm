// Global variables for controls, visuals, sound, and UI
var controls = null;
var vis = null;
var sound = null;
var fourier;
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

  // Initialize main controls (handles keyboard, toggling popup, etc.)
  controls = new controlsAndInput();

  // Create FFT object for audio analysis
  fourier = new p5.FFT();

  // Create a container for all Visualisations and add them
  vis = new Visualisations();
  vis.add(new Spectrum());
  vis.add(new WavePattern());
  vis.add(new Needles());
  vis.add(new CircularWaveform());
  vis.add(new ParticleMask());

  // Create the new popup UI
  popup = new PopupUI();

  // Ensure progress slider updates the audio when dragged
  popup.progressSlider.addEventListener("input", () => {
    if (sound && sound.isLoaded()) {
      let newTime = map(
        popup.progressSlider.value,
        0,
        100,
        0,
        sound.duration()
      );
      sound.jump(newTime);
      console.log("Jumping to:", newTime.toFixed(2), "seconds");
    }
  });
}

function draw() {
  background(0);

  // Draw the currently selected Visualisation
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

  // Ensure all visuals resize properly
  if (vis.selectedVisual.hasOwnProperty("onResize")) {
    vis.selectedVisual.onResize();
  }
}
