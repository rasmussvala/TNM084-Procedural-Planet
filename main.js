import * as THREE from "three";
import {
  createSun,
  createPlanet,
  setupSceneAndControls,
  setupGUI,
  createStars,
  createWaterSphere,
} from "./functions.js";

// Boilerplate code - made into a function
const { scene, camera, renderer, controls } = setupSceneAndControls();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

let clock = new THREE.Clock();

// Create the sun
const sunPosition = new THREE.Vector3(10, 10, 10);
const sunSize = 0.8;
const sun = createSun(sunPosition, sunSize);
scene.add(sun);

// Create water
const waterSize = 1.0;
const water = createWaterSphere(new THREE.Vector3(0.0, 0.0, 0.0), waterSize);
scene.add(water);

// Creates stars
const stars = createStars();
scene.add(stars);

// Create the planet (parameters will be changed in gui)
let planet = createPlanet();
scene.add(planet);

// Creates the UI for interaction
setupGUI(planet.material, water.material);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Update 'time' uniform for the water material
  water.material.uniforms.time.value += clock.getDelta(); // Use 'water.material' to access the water material

  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop
animate();
