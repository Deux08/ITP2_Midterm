function PopupUI() {
  const popupContainer = document.getElementById("popupContainer");
  const uploadInput = document.getElementById("uploadInput");
  const trackSelect = document.getElementById("trackSelect");
  const progressSlider = document.getElementById("progressSlider");
  const prevBtn = document.getElementById("prevBtn");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const highSlider = document.getElementById("highSlider");
  const midSlider = document.getElementById("midSlider");
  const lowSlider = document.getElementById("lowSlider");

  this.progressSlider = progressSlider;

  // Populate the visualisation and track dropdowns when the UI loads.
  // This ensures the dropdowns have the correct options available.
  VisualisationManager.populateVisualisationDropdown();
  populateTrackDropdown();

  function populateTrackDropdown() {
    // Clear existing options before repopulating.
    trackSelect.innerHTML = "";

    trackList.forEach((track) => {
      const option = document.createElement("option");
      option.value = track;
      option.text = track.split("/").pop(); // Display only the filename.
      trackSelect.appendChild(option);
    });

    // Default to selecting the first track in the list.
    trackSelect.value = trackList[0];
  }

  // Attach event listeners to the EQ sliders.
  // Each time the slider is moved, the equalizer settings are updated.
  highSlider.addEventListener("input", () => EQManager.updateEQ());
  midSlider.addEventListener("input", () => EQManager.updateEQ());
  lowSlider.addEventListener("input", () => EQManager.updateEQ());

  // Handle track selection changes from the dropdown.
  trackSelect.addEventListener("change", () => {
    const chosenTrack = trackSelect.value;
    const newIndex = trackList.indexOf(chosenTrack);

    console.log("Track Selected:", chosenTrack, "Index Found:", newIndex);

    if (newIndex !== -1) {
      // Update the current track index and load the selected track.
      currentTrackIndex = newIndex;
      TrackManager.loadTrack(chosenTrack);
    } else {
      console.warn("Selected track not found in trackList!");
    }
  });

  // Handle file uploads and add them to the track list.
  uploadInput.addEventListener("change", (evt) => {
    const file = evt.target.files[0];

    // Pass the uploaded file to TrackManager for processing.
    TrackManager.handleUpload(file);

    // Refresh the dropdown so that the new track appears.
    populateTrackDropdown();

    // Automatically select the newly uploaded track.
    trackSelect.value = trackList[trackList.length - 1];
  });

  // Playback control buttons (Previous, Play/Pause, Next).
  prevBtn.addEventListener("click", () => TrackManager.switchTrack(-1));

  playPauseBtn.addEventListener("click", () => {
    if (sound && sound.isPlaying()) {
      sound.pause();
    } else if (sound) {
      sound.play();
    }
  });

  nextBtn.addEventListener("click", () => TrackManager.switchTrack(1));

  // Functions to show or hide the popup container.
  this.showUI = function () {
    popupContainer.style.display = "block";
  };

  this.hideUI = function () {
    popupContainer.style.display = "none";
  };
}
