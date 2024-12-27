//Start - Particle Mask No Help//
// Geometric Portals Visualizer
function ParticleMask() {
  // Name of the visualization
  this.name = "particleMask";

  // Configuration variables
  this.capture = null; // Global to persist across methods
  this.faceMesh = null;
  this.portals = []; // Stores geometric portals
  this.isCaptureReady = false; // Flag to check webcam readiness
  this.webcamActivated = false; // Track if webcam is activated
  this.faceScanned = false; // Tracks whether face has been scanned
  this.showLoading = false; // Shows loading animation
  this.loadingProgress = 0; // Loading progress tracker
  this.findingFace = true; // Tracks finding face stage

  // Setup method for initialization
  this.setup = function () {
    // Initialize FFT for audio analysis
    fourier = new p5.FFT();

    // Display activation message
    push();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Press 'X' to Turn On Webcam", width / 2, height / 2);
    pop();
  };

  //CHATGPT HELP and STACK OVERFLOW//
  // Activate Webcam
  this.activateWebcam = function () {
    if (!this.webcamActivated) {
      this.capture = createCapture(VIDEO);
      this.capture.size(640, 480); // Explicit size for webcam feed
      this.capture.elt.setAttribute("playsinline", ""); // Fix for mobile devices
      this.isCaptureReady = true;
      this.webcamActivated = true;
      this.showLoading = true; // Show loading animation after activation

      this.faceMesh = ml5.facemesh(this.capture, this.modelReady);
      this.faceMesh.on("predict", this.gotFaces);
    } else {
      console.log("Webcam is already activated.");
    }
  };
  //CHATGPT HELP and STACK OVERFLOW//

  // Model is ready callback
  this.modelReady = () => {
    console.log("Face tracking ready!");
  };

  // Process detected faces
  this.gotFaces = (results) => {
    if (results.length > 0) {
      let face = results[0].scaledMesh;

      // Transition from 'Finding a Face' to scanning
      if (this.findingFace) {
        this.findingFace = false;
        this.loadingProgress = 0; // Reset progress for scanning
      }

      // Progress loading animation while scanning face
      if (!this.faceScanned) {
        this.loadingProgress += 0.5;
        if (this.loadingProgress > 100) {
          this.faceScanned = true;
          this.showLoading = false; // Hide loading animation
        }
      }

      let spectrum = fourier.analyze();
      let maxFreqValue = max(spectrum);
      spectrum = spectrum.map((v) => (v / maxFreqValue) * 255);

      let bass = spectrum.slice(0, 85).reduce((a, b) => a + b, 0) / 85;
      let mid = spectrum.slice(86, 170).reduce((a, b) => a + b, 0) / 85;
      let high = spectrum.slice(171, 255).reduce((a, b) => a + b, 0) / 85;

      if (this.portals.length === 0) {
        for (let i = 0; i < face.length; i++) {
          let point = face[i];
          let x = map(point[0], 0, 640, 0, width);
          let y = map(point[1], 0, 480, 0, height);
          this.portals.push({
            x,
            y,
            size: 5,
            rotation: 0,
            scale: 1,
            col: color(255),
            targetCol: color(255),
          });
        }
      }

      // Update portals based on frequency bands
      for (let i = 0; i < this.portals.length; i++) {
        let portal = this.portals[i];
        let point = face[i];
        let x = map(point[0], 0, 640, 0, width);
        let y = map(point[1], 0, 480, 0, height);

        // Smoothly move portals to detected landmarks
        portal.x = lerp(portal.x, x, 0.1);
        portal.y = lerp(portal.y, y, 0.1);

        // Bass effect - Adjust portal size based on bass intensity
        let targetScale = map(bass, 0, 255, 0.8, 2); // Scale grows with bass
        portal.scale = lerp(portal.scale, targetScale, 0.1);

        // Mid effect - Rotate portals based on mid frequencies
        portal.rotation += map(mid, 0, 255, 0.01, 0.2); // Rotation speed changes

        // High effect - Pulse and color shift based on high frequencies
        let targetSize = map(high, 0, 255, 2, 9); // Pulses dynamically
        portal.size = lerp(portal.size, targetSize, 0.1);

        // Change color if high frequency exceeds threshold
        if (high > 110) {
          portal.targetCol = color(
            random(100, 255), // R value for vibrant purple
            random(50, 150), // G value for cool tones
            random(150, 255) // B value for blue shades
          );
        } else {
          portal.targetCol = color(255); // Default color (white)
        }

        // Smoothly transition to target color
        portal.col = lerpColor(portal.col, portal.targetCol, 0.1);
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
      text("Press 'X' to Turn On Webcam", width / 2, height / 2);
      pop();
    } else {
      let aspectRatio = 640 / 480;
      let h = height;
      let w = h * aspectRatio;
      if (w > width) {
        w = width;
        h = w / aspectRatio;
      }
      image(this.capture, (width - w) / 2, (height - h) / 2, w, h);

      if (this.findingFace) {
        push();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("Finding a Face...", width / 2, height / 2);
        pop();
      } else if (this.showLoading) {
        push();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(
          "Scanning Your Face... " + int(this.loadingProgress) + "%",
          width / 2,
          height / 2
        );
        pop();
      } else if (this.faceScanned) {
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
      }
    }
  };

  this.onResize = function () {
    resizeCanvas(windowWidth, windowHeight);
  };

  this.keyPressed = function (keyCode) {
    if (keyCode === 88) this.activateWebcam();
  };
}
//END - Particle Mask No Help//
