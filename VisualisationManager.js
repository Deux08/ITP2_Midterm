const VisualisationManager = {
  populateVisualisationDropdown: function () {
    const visRadioGroup = document.getElementById("visRadioGroup");
    visRadioGroup.innerHTML = ""; // Clear existing options

    vis.visuals.forEach((visual, index) => {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "visualRadio";
      radio.value = visual.name;
      radio.id = "radio_" + visual.name;

      // Set first visualisation as default
      if (index === 0) {
        radio.checked = true;
        vis.selectVisual(visual.name); // Select first visualisation on load
      }

      radio.addEventListener("change", () => {
        vis.selectVisual(visual.name);
        console.log("🎨 Visualisation Selected:", visual.name);
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
