const EQManager = {
  lowFilter: new p5.Filter("lowshelf"),
  midFilter: new p5.Filter("peaking"),
  highFilter: new p5.Filter("highshelf"),

  updateEQ: function () {
    const hVal = parseInt(document.getElementById("highSlider").value);
    const mVal = parseInt(document.getElementById("midSlider").value);
    const lVal = parseInt(document.getElementById("lowSlider").value);

    if (hVal === 128 && mVal === 128 && lVal === 128) {
      console.log("EQ at neutral → Bypassing filters.");
      sound.disconnect();
      sound.connect();
      return;
    }

    const lowGain = map(lVal, 0, 255, -20, 20);
    const midGain = map(mVal, 0, 255, -20, 20);
    const highGain = map(hVal, 0, 255, -20, 20);

    EQManager.lowFilter.freq(200);
    EQManager.midFilter.freq(1000);
    EQManager.highFilter.freq(5000);

    EQManager.lowFilter.gain(lowGain);
    EQManager.midFilter.gain(midGain);
    EQManager.highFilter.gain(highGain);
    EQManager.midFilter.res(0.7);

    sound.disconnect();
    sound.connect(EQManager.lowFilter);
    sound.connect(EQManager.midFilter);
    sound.connect(EQManager.highFilter);
    EQManager.lowFilter.connect();
    EQManager.midFilter.connect();
    EQManager.highFilter.connect();

    console.log("EQ Updated:", lowGain, midGain, highGain);
  },
};
