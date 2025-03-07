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

  // Make it a property on this object so we can reference it in sketch.js
  this.progressSlider = progressSlider;

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
  this.lowFilter = new p5.Filter("lowpass");
  this.midFilter = new p5.Filter("bandpass");
  this.highFilter = new p5.Filter("highpass");

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
    if (!file) return; // if user canceled
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
  // (J) LOAD TRACK (and connect filters)
  // ================================
  this.loadTrack = function (trackPathOrFile) {
    if (sound && sound.isPlaying()) {
      sound.stop();
    }
    sound = loadSound(trackPathOrFile, () => {
      sound.play();
      sound.setVolume(1); // ensure full volume
      console.log("Track loaded & playing:", trackPathOrFile);

      sound.disconnect();
      sound.connect(this.lowFilter);
      this.lowFilter.connect(this.midFilter);
      this.midFilter.connect(this.highFilter);
      this.highFilter.connect();

      fourier.setInput(sound); // let fourier analyze the new track
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

    const lowCutoff = map(lVal, 0, 255, 20, 500);
    const midCutoff = map(mVal, 0, 255, 501, 3000);
    const highCutoff = map(hVal, 0, 255, 3001, 22050);

    this.lowFilter.freq(lowCutoff);
    this.midFilter.freq(midCutoff);
    this.highFilter.freq(highCutoff);

    console.log(
      "EQ => LowPass freq:",
      lowCutoff,
      "| BandPass freq:",
      midCutoff,
      "| HighPass freq:",
      highCutoff
    );
  };
}
