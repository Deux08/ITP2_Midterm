//Start - Circular waveforms No Help//
// Circular Waveform Visualisation
function CircularWaveform() {
  // Name of the Visualisation
  this.name = "circularWaveform";

  // Configuration variables
  let radiusBase = 150; // Base radius
  let rotationSpeed = 0.005; // Slow rotation speed
  let pulseScale = 40; // Increased pulse scaling factor for stronger effect
  let bassThreshold = 220; // Threshold for bass spike

  // Particle settings
  let particles = [];

  // Color gradients for low, mid, and high frequencies
  let colorsLow = [color(0, 255, 255), color(0, 204, 255), color(0, 153, 255)]; // Cyan shades
  let colorsMid = [color(0, 255, 0), color(102, 255, 102), color(51, 204, 51)]; // Green shades
  let colorsHigh = [color(255, 0, 0), color(255, 102, 102), color(204, 51, 51)]; // Red shades

  // Particle class
  class Particle {
    constructor(x, y, angle, col, shape, lifetime, sizeMultiplier) {
      this.x = x;
      this.y = y;
      // Adjust particle speed based on size multiplier
      let speed = random(2, 4) * sizeMultiplier;
      this.vx = cos(angle) * speed;
      this.vy = sin(angle) * speed;
      this.life = lifetime; // Dynamic lifetime based on bar height
      this.color = col;
      this.shape = shape;
      this.size = sizeMultiplier * 1; // Particle size adjustment
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
    }

    display() {
      noStroke();
      fill(this.color, map(this.life, 0, 30, 255, 0));
      if (this.shape === "circle") {
        ellipse(this.x, this.y, this.size, this.size);
      } else if (this.shape === "square") {
        rect(this.x, this.y, this.size, this.size);
      } else if (this.shape === "triangle") {
        triangle(
          this.x,
          this.y - this.size,
          this.x - this.size / 2,
          this.y + this.size,
          this.x + this.size / 2,
          this.y + this.size
        );
      }
    }

    isDead() {
      return this.life <= 0;
    }
  }

  // Draw method for rendering the Visualisation
  this.draw = function () {
    push();

    // Analyze the frequency spectrum
    let spectrum = fourier.analyze();
    console.log("Spectrum first bin:", spectrum[0]);

    // Normalize spectrum values to remove volume dependency
    let maxFreqValue = max(spectrum);
    spectrum = spectrum.map((v) => (v / maxFreqValue) * 255);

    // Set the center point
    translate(width / 2, height / 2);

    // Calculate pulse effect based on bass energy
    let bassEnergy = fourier.getEnergy("bass");
    let pulse =
      bassEnergy > bassThreshold
        ? 1.5
        : map(bassEnergy, 0, 255, 1, 1 + pulseScale / 100);

    // Apply rotation for spinning effect
    rotate(frameCount * rotationSpeed);

    // Create circular bars
    let numBars = 256;
    let repeats = 3;
    let angleStep = TWO_PI / numBars;

    for (let i = 0; i < numBars; i++) {
      let repeatedIndex = i % spectrum.length;
      let angle = i * angleStep;
      let freqValue = spectrum[repeatedIndex];

      // Adjust bar height
      let sensitivity =
        i < numBars * 0.3 ? 0.35 : i < numBars * 0.6 ? 0.525 : 0.7;
      let barHeight = map(freqValue * sensitivity, 0, 255, 5, 150) * pulse;

      // Calculate points
      let x1 = radiusBase * pulse * cos(angle);
      let y1 = radiusBase * pulse * sin(angle);
      let x2 = (radiusBase * pulse + barHeight) * cos(angle);
      let y2 = (radiusBase * pulse + barHeight) * sin(angle);

      // Dynamic colors
      let col;
      if (barHeight < 50) {
        col = lerpColor(
          colorsLow[i % 3],
          colorsLow[(i + 1) % 3],
          barHeight / 50
        );
      } else if (barHeight < 100) {
        col = lerpColor(
          colorsMid[i % 3],
          colorsMid[(i + 1) % 3],
          (barHeight - 50) / 50
        );
      } else {
        col = lerpColor(
          colorsHigh[i % 3],
          colorsHigh[(i + 1) % 3],
          (barHeight - 100) / 50
        );
      }

      // Draw bars
      stroke(col);
      strokeWeight(2);
      line(x1, y1, x2, y2);

      // Generate particles
      if (bassEnergy > 150 && random() > 0.9) {
        let shape =
          barHeight < 50 ? "circle" : barHeight < 100 ? "square" : "triangle";
        let lifetime = barHeight > 145 ? 60 : 30; // 1-second for high bars
        let sizeMultiplier = bassEnergy > bassThreshold ? 4 : 1; // 4x size for bass spikes
        particles.push(
          new Particle(x2, y2, angle, col, shape, lifetime, sizeMultiplier)
        );
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].display();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }

    pop();
  };
}
//End - Circular waveforms No Help//
