import * as THREE from "three";
import {
  createSun,
  createPlanet,
  setupSceneAndControls,
  setupGUI,
} from "./functions.js";

// Boilerplate code - made into a function
const { scene, camera, renderer, controls } = setupSceneAndControls();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Create the sun
const sunPosition = new THREE.Vector3(1, 1, 1);
const sunSize = 0.3;
const sunStrength = 5;
const sun = createSun(sunPosition, sunSize, sunStrength);
scene.add(sun);

// Create the planet
let planet = createPlanet(0.5);
scene.add(planet);

function updatePlanetGeometry(planet, mountainHeight) {
  scene.remove(planet);
  planet.geometry.dispose();
  planet = createPlanet(mountainHeight);
  scene.add(planet);
}

setupGUI(updatePlanetGeometry);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop
animate();
