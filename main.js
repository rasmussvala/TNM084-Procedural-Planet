import * as THREE from "three";
import {
  createSun,
  createPlanet,
  setupSceneAndControls,
  setupGUI,
  createStars,
  createClouds,
  createWaterSphere,
} from "./functions.js";

// Boilerplate code - made into a function
const { scene, camera, renderer, controls } = setupSceneAndControls();

const clock = new THREE.Clock();

// Show axis
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

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

// Creates clouds
const clouds = createClouds();
scene.add(clouds);

// Creates the UI for interaction
setupGUI(planet.material, water.material);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  clouds.rotation.x += 0.02 * deltaTime;
  clouds.rotation.y += 0.04 * deltaTime;

  // Update 'time' uniform for the water material
  water.material.uniforms.time.value += deltaTime; // Use 'water.material' to access the water material

  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop
animate();
