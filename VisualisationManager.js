const VisualisationManager = {
  populateVisualisationDropdown: function () {
    const visRadioGroup = document.getElementById("visRadioGroup");
    visRadioGroup.innerHTML = ""; // Clear existing options

    // Store previously selected visualisation to prevent overriding user choice
    const previousSelection = vis.selectedVisual
      ? vis.selectedVisual.name
      : null;

    vis.visuals.forEach((visual, index) => {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "visualRadio";
      radio.value = visual.name;
      radio.id = "radio_" + visual.name;

      // If there's a previous selection, retain it; otherwise, select the first by default
      if (
        visual.name === previousSelection ||
        (previousSelection === null && index === 0)
      ) {
        radio.checked = true;
        vis.selectVisual(visual.name); // Ensures the correct visual is active
      }

      radio.addEventListener("change", () => {
        vis.selectVisual(visual.name);
        console.log("Visualisation Selected:", visual.name);
      });

      const label = document.createElement("label");
      label.htmlFor = "radio_" + visual.name;
      label.innerText = visual.name;

      visRadioGroup.appendChild(radio);
      visRadioGroup.appendChild(label);
      visRadioGroup.appendChild(document.createElement("br"));
    });
  },
};
