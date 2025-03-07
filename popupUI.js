// popupUI.js

function PopupUI() {
  // ================================
  // (A) GRAB DOM ELEMENTS
  // ================================
  const popupContainer = document.getElementById("popupContainer");

  // Visual Radio Group
  const visRadioGroup = document.getElementById("visRadioGroup");

  // Music upload & track selection
  const uploadInput = document.getElementById("uploadInput");
  const trackSelect = document.getElementById("trackSelect");

  // Playback progress slider (HTML input range)
  const progressSlider = document.getElementById("progressSlider");
  this.progressSlider = progressSlider; // we use this in sketch.js

  // Playback controls
  const prevBtn = document.getElementById("prevBtn");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");

  // EQ Sliders
  const highSlider = document.getElementById("highSlider");
  const midSlider = document.getElementById("midSlider");
  const lowSlider = document.getElementById("lowSlider");

  // ================================
  // (B) CREATE FILTERS FOR REAL EQ
  // ================================
  // Use a 3-band approach in parallel
  this.lowFilter = new p5.Filter("lowshelf");
  this.midFilter = new p5.Filter("peaking");
  this.highFilter = new p5.Filter("highshelf");

  // ================================
  // (C) POPULATE & MANAGE VISUALS
  // ================================
  for (let i = 0; i < vis.visuals.length; i++) {
    let vName = vis.visuals[i].name;

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "visualRadio";
    radio.value = vName;
    radio.id = "radio_" + vName;

    if (vName === vis.selectedVisual.name) {
      radio.checked = true;
    }

    radio.addEventListener("change", () => {
      vis.selectVisual(vName);
    });

    const label = document.createElement("label");
    label.htmlFor = "radio_" + vName;
    label.innerText = vName;

    visRadioGroup.appendChild(radio);
    visRadioGroup.appendChild(label);
    visRadioGroup.appendChild(document.createElement("br"));
  }

  // ================================
  // (D) TRACK SELECTION & UPLOAD
  // ================================
  for (let i = 0; i < trackList.length; i++) {
    const option = document.createElement("option");
    option.value = trackList[i];
    option.text = trackList[i];
    trackSelect.appendChild(option);
  }
  trackSelect.value = trackList[0];

  trackSelect.addEventListener("change", () => {
    const chosenTrack = trackSelect.value;
    this.loadTrack(chosenTrack);
    currentTrackIndex = trackList.indexOf(chosenTrack);
  });

  uploadInput.addEventListener("change", (evt) => {
    const file = evt.target.files[0];
    this.handleUpload(file);
  });

  // ================================
  // (E) DRAGGABLE PROGRESS BAR
  // ================================
  progressSlider.addEventListener("input", () => {
    if (sound && sound.isLoaded()) {
      let newTime = map(progressSlider.value, 0, 100, 0, sound.duration());
      sound.jump(newTime);
    }
  });

  // ================================
  // (F) PLAYBACK CONTROLS
  // ================================
  prevBtn.addEventListener("click", () => this.switchTrack(-1));
  playPauseBtn.addEventListener("click", () => {
    if (sound && sound.isPlaying()) {
      sound.pause();
    } else if (sound) {
      sound.play();
    }
  });
  nextBtn.addEventListener("click", () => this.switchTrack(1));

  // ================================
  // (G) EQ SLIDER EVENTS
  // ================================
  highSlider.addEventListener("input", () => this.updateEQ());
  midSlider.addEventListener("input", () => this.updateEQ());
  lowSlider.addEventListener("input", () => this.updateEQ());

  // ================================
  // (H) SHOW/HIDE METHODS
  // ================================
  this.showUI = function () {
    popupContainer.style.display = "block";
  };
  this.hideUI = function () {
    popupContainer.style.display = "none";
  };

  // ================================
  // (I) HANDLE UPLOAD
  // ================================
  this.handleUpload = function (file) {
    if (!file) return;
    if (file.type.startsWith("audio")) {
      const option = document.createElement("option");
      option.value = file.name;
      option.text = file.name;
      trackSelect.appendChild(option);

      trackList.push(file.name);
      currentTrackIndex = trackList.length - 1;

      trackSelect.value = file.name;
      this.loadTrack(file);
    } else {
      console.log("Not an audio file, ignoring.");
    }
  };

  // ================================
  // (J) LOAD TRACK (Parallel + Reset EQ)
  // ================================
  this.loadTrack = function (trackPathOrFile) {
    if (sound && sound.isPlaying()) {
      sound.stop();
    }
    sound = loadSound(trackPathOrFile, () => {
      sound.play();
      console.log("Track loaded & playing:", trackPathOrFile);

      // Connect in parallel
      sound.disconnect();
      sound.connect(this.lowFilter);
      sound.connect(this.midFilter);
      sound.connect(this.highFilter);

      this.lowFilter.connect();
      this.midFilter.connect();
      this.highFilter.connect();

      fourier.setInput(sound);

      // RESET EQ
      // 1) Reset the sliders to 128 (which we map to 0 dB)
      lowSlider.value = 128;
      midSlider.value = 128;
      highSlider.value = 128;

      // 2) Call updateEQ to ensure filter gains are set to 0 dB
      this.updateEQ();
    });
  };

  // ================================
  // (K) SWITCH TRACK (prev/next)
  // ================================
  this.switchTrack = function (direction) {
    currentTrackIndex += direction;
    if (currentTrackIndex < 0) {
      currentTrackIndex = trackList.length - 1;
    }
    if (currentTrackIndex >= trackList.length) {
      currentTrackIndex = 0;
    }

    const newTrack = trackList[currentTrackIndex];
    trackSelect.value = newTrack;
    this.loadTrack(newTrack);
  };

  // ================================
  // (L) UPDATE EQ FILTERS
  // ================================
  this.updateEQ = function () {
    const hVal = parseInt(highSlider.value);
    const mVal = parseInt(midSlider.value);
    const lVal = parseInt(lowSlider.value);

    // Check if all sliders are at neutral (128)
    if (hVal === 128 && mVal === 128 && lVal === 128) {
      console.log("EQ at neutral → Bypassing filters.");

      // Disconnect filters (restore original audio path)
      sound.disconnect();
      sound.connect();
      return; // Exit function since no EQ change is needed
    }

    // MAP 0..255 to -20..+20 dB (for boosting/cutting)
    const lowGain = map(lVal, 0, 255, -20, 20);
    const midGain = map(mVal, 0, 255, -20, 20);
    const highGain = map(hVal, 0, 255, -20, 20);

    // Set EQ frequencies
    this.lowFilter.freq(200);
    this.midFilter.freq(1000);
    this.highFilter.freq(5000);

    // Apply Gain Adjustments
    this.lowFilter.gain(lowGain);
    this.midFilter.gain(midGain);
    this.highFilter.gain(highGain);

    // Ensure minimal impact at 0 dB
    this.midFilter.res(1);

    // Reconnect filters when EQ is active
    sound.disconnect();
    sound.connect(this.lowFilter);
    sound.connect(this.midFilter);
    sound.connect(this.highFilter);
    this.lowFilter.connect();
    this.midFilter.connect();
    this.highFilter.connect();

    console.log("EQ Active: Low:", lowGain, "Mid:", midGain, "High:", highGain);
  };
}
