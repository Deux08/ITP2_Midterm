// Geometric Portals Visualizer - ml5.js v0.4.3
function ParticleMask() {
  // Name of the visualization
  this.name = "particleMask";

  // Configuration variables
  this.capture = null; // Global to persist across methods
  this.faceMesh = null;
  this.portals = []; // Stores geometric portals
  this.isCaptureReady = false; // Flag to check webcam readiness
  this.webcamActivated = false; // Track if webcam is activated
  this.camWidth = 640; // Webcam native width
  this.camHeight = 480; // Webcam native height

  // Setup method for initialization
  this.setup = function () {
    // Initialize FFT for audio analysis
    fourier = new p5.FFT();

    // Display activation message
    push();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Press 'W' to Activate Webcam", width / 2, height / 2);
    pop();
  };

  // Activate Webcam
  this.activateWebcam = function () {
    if (!this.webcamActivated) {
      this.capture = createCapture(VIDEO);
      this.capture.size(this.camWidth, this.camHeight);
      this.capture.hide();

      this.capture.elt.addEventListener("loadedmetadata", () => {
        console.log("Webcam metadata loaded");
        this.isCaptureReady = true;
        this.webcamActivated = true;

        this.faceMesh = ml5.facemesh(this.capture, this.modelReady);
        this.faceMesh.on("predict", this.gotFaces);
      });
    } else {
      console.log("Webcam is already activated.");
    }
  };

  // Model is ready callback
  this.modelReady = () => {
    console.log("Face tracking ready!");
  };

  // Process detected faces
  this.gotFaces = (results) => {
    if (results.length > 0) {
      let face = results[0].scaledMesh;
      let spectrum = fourier.analyze();
      let maxFreqValue = max(spectrum);
      spectrum = spectrum.map((v) => (v / maxFreqValue) * 255);

      let bass = spectrum.slice(0, 85).reduce((a, b) => a + b, 0) / 85;
      let mid = spectrum.slice(86, 170).reduce((a, b) => a + b, 0) / 85;
      let high = spectrum.slice(171, 255).reduce((a, b) => a + b, 0) / 85;

      if (this.portals.length === 0) {
        for (let i = 0; i < face.length; i++) {
          let point = face[i];
          let x = map(point[0], 0, this.camWidth, 0, width);
          let y = map(point[1], 0, this.camHeight, 0, height);
          this.portals.push({
            x,
            y,
            size: 10,
            rotation: 0,
            scale: 1,
            col: color(255),
          });
        }
      }

      for (let i = 0; i < this.portals.length; i++) {
        let portal = this.portals[i];
        let point = face[i];
        let x = map(point[0], 0, this.camWidth, 0, width);
        let y = map(point[1], 0, this.camHeight, 0, height);

        portal.x = lerp(portal.x, x, 0.1);
        portal.y = lerp(portal.y, y, 0.1);

        // Bass effect - scale and shockwave
        portal.scale = map(bass, 0, 255, 0.8, 2);

        // Mid effect - rotation and warping
        portal.rotation += map(mid, 0, 255, 0.01, 0.05);

        // High effect - sharpness and reflections
        if (high > 150) {
          portal.col = color(
            random(150, 255),
            random(50, 150),
            random(200, 255)
          );
          portal.size = map(high, 0, 255, 10, 20);
        }
      }
    }
  };

  // Draw method for rendering
  this.draw = function () {
    background(0);

    if (!this.webcamActivated) {
      push();
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(20);
      text("Press 'W' to Activate Webcam", width / 2, height / 2);
      pop();
    } else if (this.capture && this.isCaptureReady) {
      let aspectRatio = this.camWidth / this.camHeight;
      let h = height;
      let w = h * aspectRatio;
      if (w > width) {
        w = width;
        h = w / aspectRatio;
      }
      image(this.capture, (width - w) / 2, (height - h) / 2, w, h);
    }

    for (let p of this.portals) {
      push();
      translate(p.x, p.y);
      rotate(p.rotation);
      scale(p.scale);
      fill(p.col);
      noStroke();
      beginShape();
      for (let a = 0; a < TWO_PI; a += PI / 3) {
        let sx = cos(a) * p.size;
        let sy = sin(a) * p.size;
        vertex(sx, sy);
      }
      endShape(CLOSE);
      pop();
    }
  };

  this.onResize = function () {
    resizeCanvas(windowWidth, windowHeight);
  };

  this.keyPressed = function (keyCode) {
    if (keyCode === 87) this.activateWebcam();
  };
}
