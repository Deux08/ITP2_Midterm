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

  // ✅ Populate Visualisation & Track Dropdowns When UI Loads
  VisualisationManager.populateVisualisationDropdown();
  populateTrackDropdown();

  function populateTrackDropdown() {
    trackSelect.innerHTML = ""; // Clear previous options

    trackList.forEach((track) => {
      const option = document.createElement("option");
      option.value = track;
      option.text = track.split("/").pop(); // Show filename only
      trackSelect.appendChild(option);
    });

    // ✅ Set first track as selected
    trackSelect.value = trackList[0];
  }

  // ✅ Handle EQ Updates (delegating to EQManager)
  highSlider.addEventListener("input", () => EQManager.updateEQ());
  midSlider.addEventListener("input", () => EQManager.updateEQ());
  lowSlider.addEventListener("input", () => EQManager.updateEQ());

  // ✅ Handle Track Selection Change
  trackSelect.addEventListener("change", () => {
    const chosenTrack = trackSelect.value;
    const newIndex = trackList.indexOf(chosenTrack);

    console.log("🎯 Track Selected:", chosenTrack, "Index Found:", newIndex);

    if (newIndex !== -1) {
      currentTrackIndex = newIndex; // Update index
      TrackManager.loadTrack(chosenTrack);
    } else {
      console.warn("⚠️ Selected track not found in trackList!");
    }
  });

  // ✅ Handle Upload
  uploadInput.addEventListener("change", (evt) => {
    const file = evt.target.files[0];
    TrackManager.handleUpload(file);

    // ✅ Refresh dropdown with new track
    populateTrackDropdown();

    // ✅ Set dropdown to last uploaded track
    trackSelect.value = trackList[trackList.length - 1];
  });

  // ✅ Playback Controls
  prevBtn.addEventListener("click", () => TrackManager.switchTrack(-1));
  playPauseBtn.addEventListener("click", () => {
    if (sound && sound.isPlaying()) sound.pause();
    else if (sound) sound.play();
  });
  nextBtn.addEventListener("click", () => TrackManager.switchTrack(1));

  this.showUI = function () {
    popupContainer.style.display = "block";
  };
  this.hideUI = function () {
    popupContainer.style.display = "none";
  };
}
