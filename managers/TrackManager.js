const TrackManager = {
  loadTrack: function (trackPathOrFile) {
    console.log("🔄 Loading Track:", trackPathOrFile);

    if (sound && sound.isPlaying()) {
      sound.stop();
    }

    sound = loadSound(trackPathOrFile, () => {
      sound.play();
      console.log("🎵 Track Loaded & Playing:", trackPathOrFile);

      sound.disconnect();
      sound.connect(EQManager.lowFilter);
      sound.connect(EQManager.midFilter);
      sound.connect(EQManager.highFilter);

      EQManager.lowFilter.connect();
      EQManager.midFilter.connect();
      EQManager.highFilter.connect();

      fourier.setInput(sound);

      // Update current track index after a track is loaded
      currentTrackIndex = trackList.indexOf(trackPathOrFile);

      // Reset EQ Sliders to Neutral when a new track is loaded
      document.getElementById("lowSlider").value = 128;
      document.getElementById("midSlider").value = 128;
      document.getElementById("highSlider").value = 128;
      EQManager.updateEQ();
    });
  },

  switchTrack: function (direction) {
    const trackSelect = document.getElementById("trackSelect");

    // Prevent switching if there are no tracks
    if (trackList.length === 0) {
      console.warn("⚠️ No tracks available to switch.");
      return;
    }

    // Ensure looping (wrap around)
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

    // Ensure `trackSelect` exists before modifying it
    if (trackSelect) {
      trackSelect.value = newTrack;
      trackSelect.dispatchEvent(new Event("change")); // Force UI change
    } else {
      console.warn("⚠️ trackSelect not found in the DOM.");
    }
  },

  handleUpload: function (file) {
    if (!file) return;
    if (file.type.startsWith("audio")) {
      const trackSelect = document.getElementById("trackSelect");

      // Ensure file is added with a full reference
      const fileURL = URL.createObjectURL(file);
      const option = document.createElement("option");
      option.value = fileURL;
      option.text = file.name; // Show file name but keep URL for value
      trackSelect.appendChild(option);

      trackList.push(fileURL);
      currentTrackIndex = trackList.length - 1;

      // Set dropdown to new track and trigger load
      trackSelect.value = fileURL;
      trackSelect.dispatchEvent(new Event("change"));
    } else {
      console.log("❌ Not an audio file, ignoring.");
    }
  },
};
