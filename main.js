import * as THREE from "three";
import {
  createSun,
  createPlanet,
  setupSceneAndControls,
  setupGUI,
  createStars,
} from "./functions.js";

// Boilerplate code - made into a function
const { scene, camera, renderer, controls } = setupSceneAndControls();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Ambient light
const ambientLight = new THREE.AmbientLight(new THREE.Vector3(1, 1, 1), 0.005); // Color, Intensity
scene.add(ambientLight);

// Create the sun
const sunPosition = new THREE.Vector3(10, 10, 10);
const sunSize = 0.2;
const sunStrength = 15;
const sun = createSun(sunPosition, sunSize, sunStrength);
scene.add(sun);

// Create the planet
let planet = createPlanet(0.5);
scene.add(planet);

// Creates stars
const stars = createStars();
scene.add(stars);

function updatePlanetGeometry(mountainHeight) {
  const oldPlanet = planet;

  scene.remove(oldPlanet);
  oldPlanet.geometry.dispose();

  // Create a new planet with the updated mountain height
  const newPlanet = createPlanet(mountainHeight);
  planet = newPlanet;
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
