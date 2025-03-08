//Start - Particle Mask No Help//
// Geometric Portals Visualizer
function ParticleMask() {
  // Name of the Visualisation
  this.name = "Particle Mask (Face Recognition)";

  // Configuration variables
  this.capture = null; // Webcam capture
  this.faceMesh = null;
  this.portals = []; // Stores geometric portals
  this.isCaptureReady = false; // Webcam readiness flag
  this.webcamActivated = false; // Tracks if webcam is activated
  this.faceScanned = false; // Ensures face is only scanned once
  this.showLoading = false; // Controls loading animation
  this.loadingProgress = 0; // Progress tracker for scanning
  this.findingFace = true; // Tracks if face is still being found

  // Setup method for initialization
  this.setup = function () {
    fourier = new p5.FFT();
    push();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Press 'X' to Turn On Webcam", width / 2, height / 2);
    pop();
  };

  // Activate Webcam (Called only once)
  this.activateWebcam = function () {
    if (!this.webcamActivated) {
      this.capture = createCapture(VIDEO);
      this.capture.size(640, 480);
      this.capture.elt.setAttribute("playsinline", "");
      this.isCaptureReady = true;
      this.webcamActivated = true;
      this.showLoading = true;

      this.faceMesh = ml5.facemesh(this.capture, this.modelReady);
      this.faceMesh.on("predict", this.gotFaces);
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
      this.findingFace = false; // Stop "Finding face" message

      // Only scan once, but allow updates after that
      if (!this.faceScanned) {
        this.loadingProgress += 0.5;
        if (this.loadingProgress > 100) {
          this.faceScanned = true; // Save face scan state
          this.showLoading = false; // Stop loading animation
        }

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
      }

      // Always update portals' positions even after scanning is done
      let spectrum = fourier.analyze();
      let bass = fourier.getEnergy("bass");
      let mid = fourier.getEnergy("lowMid");
      let high = fourier.getEnergy("highMid");

      for (let i = 0; i < this.portals.length; i++) {
        let portal = this.portals[i];
        let point = face[i];
        let x = map(point[0], 0, 640, 0, width);
        let y = map(point[1], 0, 480, 0, height);

        // Smoothly move portals to detected landmarks
        portal.x = lerp(portal.x, x, 0.1);
        portal.y = lerp(portal.y, y, 0.1);

        // Music interaction - Warp portals based on frequency energy
        let targetScale = map(bass, 0, 255, 0.8, 2);
        portal.scale = lerp(portal.scale, targetScale, 0.1);

        portal.rotation += map(mid, 0, 255, 0.01, 0.2);

        let targetSize = map(high, 0, 255, 2, 9);
        portal.size = lerp(portal.size, targetSize, 0.1);

        if (high > 110) {
          portal.targetCol = color(
            random(100, 255),
            random(50, 150),
            random(150, 255)
          );
        } else {
          portal.targetCol = color(255);
        }

        portal.col = lerpColor(portal.col, portal.targetCol, 0.1);
      }
    }
  };

  // Draw method for rendering
  this.draw = function () {
    background(0);

    // Ensure webcam stays active even after track change
    if (!this.webcamActivated) {
      console.log("Webcam inactive, reactivating...");
      this.activateWebcam();
    }

    // Only proceed if music is playing
    if (!sound || !sound.isPlaying()) {
      return;
    }

    // Draw webcam feed
    if (this.capture) {
      let aspectRatio = 640 / 480;
      let h = height;
      let w = h * aspectRatio;
      if (w > width) {
        w = width;
        h = w / aspectRatio;
      }
      image(this.capture, (width - w) / 2, (height - h) / 2, w, h);
    }

    // Show face scanning messages
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
    }

    // If face is scanned and music is playing, draw the portals
    if (this.faceScanned && sound.isPlaying()) {
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
  };

  this.onResize = function () {
    resizeCanvas(windowWidth, windowHeight);
  };

  this.keyPressed = function (keyCode) {
    if (keyCode === 88) this.activateWebcam();
  };
}
//END - Particle Mask No Help//
