function DebugVisual() {
  this.name = "debugVisual";

  this.draw = function () {
    background(0);
    let bassEnergy = fourier.getEnergy("bass");
    fill(255);
    textSize(24);
    text("Bass: " + bassEnergy, 50, 50);
  };
}
