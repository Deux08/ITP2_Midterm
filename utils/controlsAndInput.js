// Constructor function to handle onscreen menu, keyboard, and mouse controls
function controlsAndInput() {
  this.popupDisplayed = false; // Initially hidden

  // Disable mouse-based fullscreen toggling (clicking does nothing)
  this.mousePressed = function () {
    // No fullscreen toggle on click
  };

  // Responds to keyboard presses
  // @param keycode: the ASCII code of the key pressed
  this.keyPressed = function (keycode) {
    console.log("Key Pressed:", keycode);

    // Press 'E' -> Toggle fullscreen
    if (keycode === 69) {
      let fs = fullscreen();
      fullscreen(!fs);
      console.log("Fullscreen Mode:", !fs);
    }

    // Press 'P' -> Toggle popup
    if (keycode === 80) {
      this.popupDisplayed = !this.popupDisplayed;
      if (this.popupDisplayed) {
        popup.showUI();
      } else {
        popup.hideUI();
      }
      console.log("Popup Toggled:", this.popupDisplayed);
    }
  };

  // Draws control instructions
  this.draw = function () {
    push();
    fill("white");
    stroke("black");
    strokeWeight(2);

    // Show a message about fullscreen + popup keys
    textSize(18);
    textAlign(CENTER, TOP);
    text("Press E to toggle fullscreen, P for popup", width / 2, 10);
    pop();
  };
}
