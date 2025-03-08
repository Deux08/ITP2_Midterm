const EQManager = {
  lowFilter: new p5.Filter("lowshelf"),
  midFilter: new p5.Filter("peaking"),
  highFilter: new p5.Filter("highshelf"),

  updateEQ: function () {
    const hVal = parseInt(document.getElementById("highSlider").value);
    const mVal = parseInt(document.getElementById("midSlider").value);
    const lVal = parseInt(document.getElementById("lowSlider").value);

    // Check if all sliders are at their neutral position
    const isNeutral = hVal === 128 && mVal === 128 && lVal === 128;

    if (isNeutral) {
      console.log("EQ at neutral → Restoring original audio path.");

      // Instead of disconnecting, we ensure filters apply 0 gain,
      // which keeps the sound pristine without unwanted EQ changes.
      EQManager.lowFilter.gain(0);
      EQManager.midFilter.gain(0);
      EQManager.highFilter.gain(0);

      return;
    }

    // Convert slider values to gain levels (mapping 0-255 to -20 dB to +20 dB)
    const lowGain = map(lVal, 0, 255, -20, 20);
    const midGain = map(mVal, 0, 255, -20, 20);
    const highGain = map(hVal, 0, 255, -20, 20);

    // Set EQ frequency bands for low, mid, and high frequencies
    EQManager.lowFilter.freq(200);
    EQManager.midFilter.freq(1000);
    EQManager.highFilter.freq(5000);

    // Apply gain levels to each filter
    EQManager.lowFilter.gain(lowGain);
    EQManager.midFilter.gain(midGain);
    EQManager.highFilter.gain(highGain);

    // Apply resonance (Q factor) to all filters, but not affecting original sound at neutral
    EQManager.lowFilter.res(0.7);
    EQManager.midFilter.res(0.7);
    EQManager.highFilter.res(0.7);

    // Ensure the sound is only filtered when EQ is adjusted
    sound.disconnect();
    sound.connect(EQManager.lowFilter);
    sound.connect(EQManager.midFilter);
    sound.connect(EQManager.highFilter);

    EQManager.lowFilter.connect();
    EQManager.midFilter.connect();
    EQManager.highFilter.connect();

    // Ensure FFT analysis works on the processed audio
    fourier.setInput(sound);

    console.log("EQ Updated:", lowGain, midGain, highGain);
  },
};
