import * as THREE from "three";
import {
  createSun,
  createPlanet,
  setupSceneAndControls,
  setupGUI,
  createStars,
  // updateSpecularReflection,
} from "./functions.js";

// Boilerplate code - made into a function
const { scene, camera, renderer, controls } = setupSceneAndControls();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Create the sun
const sunPosition = new THREE.Vector3(10, 10, 10);
const sunSize = 0.8;
const sun = createSun(sunPosition, sunSize);
scene.add(sun);

// Creates stars
const stars = createStars();
scene.add(stars);

// Create the planet (parameters will be changed in gui)
let planet = createPlanet(camera);
scene.add(planet);

// Creates the UI for interaction
setupGUI(planet.material);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop
animate();
