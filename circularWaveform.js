// Circular Waveform Visualization
function CircularWaveform() {
  // Name of the visualization
  this.name = "Circular Waveform";

  // Configuration variables
  let rotationSpeed = 0.01; // Base rotation speed
  let radiusBase = 150; // Base radiuss

  let breathingScale = 10; // Scale for breathing effect

  // Gradient colors
  let colorStart = color(0, 255, 255); // Cyan
  let colorEnd = color(255, 0, 0); // Reds

  // Draw method for rendering the visualization
  this.draw = function () {
    push();

    // Analyze the waveform data
    let waveform = fourier.waveform();

    // Calculate breathing effect based on volume
    let energy = fourier.getEnergy("bass");
    let breathing = map(energy, 0, 255, 0, breathingScale);

    // Rotate and set the center point
    translate(width / 2, height / 2);
    rotate(frameCount * rotationSpeed);

    // Begin the shape
    noFill();
    strokeWeight(2);
    beginShape();

    for (let i = 0; i < waveform.length; i++) {
      // Map waveform data to polar coordinates
      let angle = map(i, 0, waveform.length, 0, TWO_PI);
      let amp = waveform[i];
      let r = radiusBase + breathing + map(amp, -1, 1, -50, 50);

      let x = r * cos(angle);
      let y = r * sin(angle);

      // Gradient colors based on amplitude
      let col = lerpColor(colorStart, colorEnd, map(amp, -1, 1, 0, 1));
      stroke(col);

      vertex(x, y);
    }

    endShape(CLOSE);
    pop();
  };
}
