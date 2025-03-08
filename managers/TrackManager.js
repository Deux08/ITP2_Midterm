const TrackManager = {
  loadTrack: function (trackPathOrFile) {
    console.log("🔄 Loading Track (Raw Mode):", trackPathOrFile);

    if (sound && sound.isPlaying()) {
      sound.stop();
    }

    // Load and play sound in its raw form (no EQ applied initially)
    sound = loadSound(trackPathOrFile, () => {
      sound.play();
      console.log("🎵 Track Loaded & Playing (RAW, No EQ):", trackPathOrFile);

      // **Ensure PURE playback first**
      sound.disconnect(); // Remove any previous effects
      sound.connect(); // Direct connection to ensure no processing
      sound.amp(1); // Ensure no normalization or gain changes

      // EQ is **NOT** connected until the user interacts with the equalizer
    });

    // Update current track index after a track is loaded
    currentTrackIndex = trackList.indexOf(trackPathOrFile);

    // Reset EQ Sliders to Neutral when a new track is loaded
    document.getElementById("lowSlider").value = 128;
    document.getElementById("midSlider").value = 128;
    document.getElementById("highSlider").value = 128;
  },

  applyEQ: function () {
    console.log("🎚 EQ Adjusted: Applying Filters...");

    // If EQ is touched, now apply processing
    sound.disconnect();
    sound.connect(EQManager.lowFilter);
    sound.connect(EQManager.midFilter);
    sound.connect(EQManager.highFilter);

    EQManager.lowFilter.connect();
    EQManager.midFilter.connect();
    EQManager.highFilter.connect();

    // Now allow FFT to analyze the sound
    fourier.setInput(sound);
  },

  switchTrack: function (direction) {
    const trackSelect = document.getElementById("trackSelect");

    if (trackList.length === 0) {
      console.warn("⚠️ No tracks available to switch.");
      return;
    }

    currentTrackIndex += direction;
    if (currentTrackIndex < 0) currentTrackIndex = trackList.length - 1;
    if (currentTrackIndex >= trackList.length) currentTrackIndex = 0;

    const newTrack = trackList[currentTrackIndex];

    console.log(
      "🔀 Switching to Track:",
      newTrack,
      "Index:",
      currentTrackIndex
    );

    if (trackSelect) {
      trackSelect.value = newTrack;
      trackSelect.dispatchEvent(new Event("change"));
    } else {
      console.warn("⚠️ trackSelect not found in the DOM.");
    }
  },

  handleUpload: function (file) {
    if (!file) return;
    if (file.type.startsWith("audio")) {
      const trackSelect = document.getElementById("trackSelect");

      const fileURL = URL.createObjectURL(file);
      const option = document.createElement("option");
      option.value = fileURL;
      option.text = file.name;
      trackSelect.appendChild(option);

      trackList.push(fileURL);
      currentTrackIndex = trackList.length - 1;

      trackSelect.value = fileURL;
      trackSelect.dispatchEvent(new Event("change"));
    } else {
      console.log("❌ Not an audio file, ignoring.");
    }
  },
};

// 🎚 Attach event listeners to EQ sliders (so EQ only applies when touched)
document
  .getElementById("lowSlider")
  .addEventListener("input", TrackManager.applyEQ);
document
  .getElementById("midSlider")
  .addEventListener("input", TrackManager.applyEQ);
document
  .getElementById("highSlider")
  .addEventListener("input", TrackManager.applyEQ);
