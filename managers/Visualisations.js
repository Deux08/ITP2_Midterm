// Container function for managing visualisations
function Visualisations() {
  // Array to store available visualisations
  this.visuals = [];
  // Currently selected visualisation (starts null until a visual is added)
  this.selectedVisual = null;

  // Add a new visualisation to the array
  // @param vis: a visualisation object
  this.add = function (vis) {
    this.visuals.push(vis);

    // If this is the first visualisation added, set it as default
    if (this.visuals.length === 1) {
      this.selectVisual(vis.name);
    }
  };

  // Select a visualisation using its name
  // @param visName: name property of the visualisation
  this.selectVisual = function (visName) {
    const foundVisual = this.visuals.find((vis) => vis.name === visName);

    if (foundVisual) {
      this.selectedVisual = foundVisual;
      console.log("Visualisation selected:", visName);
    } else {
      console.warn(`Visualisation "${visName}" not found.`);
    }
  };
}
