import * as THREE from "three";
import {
  createSun,
  createPlanet,
  setupSceneAndControls,
  setupGUI,
  createStars,
  createClouds,
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
let planet = createPlanet();
scene.add(planet);

// Creates clouds
const clouds = createClouds();
scene.add(clouds);

// Creates the UI for interaction
setupGUI(planet.material);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  clouds.rotation.x += 0.001 * Math.random();
  clouds.rotation.y += 0.001 * Math.random();
  clouds.rotation.z += 0.001 * Math.random();

  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop
animate();
