// Constructor function to handle the onscreen menu, keyboard, and mouse controls
function ControlsAndInput() {
  this.menuDisplayed = false;

  // track whether the popup is displayed or not
  this.popupDisplayed = false; // Initially hidden

  // Disable mouse-based fullscreen toggling (do nothing on click)
  this.mousePressed = function () {
    // No fullscreen toggle on click
  };

  // responds to keyboard presses
  // @param keycode the ascii code of the key pressed
  this.keyPressed = function (keycode) {
    console.log(keycode);

    // Remove spacebar toggling the menu
    // if (keycode == 32) {
    //   this.menuDisplayed = !this.menuDisplayed;
    // }

    // Press 'E' -> Toggle fullscreen
    if (keycode === 69) {
      let fs = fullscreen();
      fullscreen(!fs);
      console.log("Toggled fullscreen =>", !fs);
    }

    // Press 'P' -> Toggle popup
    if (keycode === 80) {
      this.popupDisplayed = !this.popupDisplayed;
      console.log("Popup displayed:", this.popupDisplayed);
    }

    // 1-9 to change visual
    if (keycode > 48 && keycode < 58) {
      var visNumber = keycode - 49;
      vis.selectVisual(vis.visuals[visNumber].name);
    }
  };

  // draws the controls (like the old text menu)
  this.draw = function () {
    push();
    fill("white");
    stroke("black");
    strokeWeight(2);

    // Show a message about fullscreen + popup keys
    textSize(18);
    textAlign(CENTER, TOP);
    text("Press E to toggle fullscreen, P for popup", width / 2, 10);

    // If you no longer want *any* old menu display, simply remove these lines:
    if (this.menuDisplayed) {
      // (But if you want to keep it for debugging, you can leave it.)
      textSize(34);
      text("Select a visualisation:", 100, 30);
      this.menu();
    }
    pop();
  };

  // draw out menu items for each visualisation
  // If you don't need the old menu at all, you can remove or leave it for reference
  this.menu = function () {
    for (var i = 0; i < vis.visuals.length; i++) {
      var yLoc = 70 + i * 40;
      text(i + 1 + ":  " + vis.visuals[i].name, 100, yLoc);
    }
  };
}
