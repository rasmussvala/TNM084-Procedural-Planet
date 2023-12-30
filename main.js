import * as THREE from "three";
import {
  createSun,
  createPlanetMaterial as createPlanetMaterial,
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
let material = createPlanetMaterial();

// Create different levels of detail
const highDetail = new THREE.SphereGeometry(1, 512, 512); // byt till icosahedron
const mediumDetail = new THREE.SphereGeometry(1, 256, 256);
const lowDetail = new THREE.SphereGeometry(1, 16, 16);

// Create mesh for each level of detail
const highDetailMesh = new THREE.Mesh(highDetail, material);
const mediumDetailMesh = new THREE.Mesh(mediumDetail, material);
const lowDetailMesh = new THREE.Mesh(lowDetail, material);

// Create LOD object
const planet = new THREE.LOD();

// Add LOD levels
planet.addLevel(highDetailMesh, 1);
planet.addLevel(mediumDetailMesh, 6);
planet.addLevel(lowDetailMesh, 15);

// Add LOD object to the scene
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

  planet.update(camera);

  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop
animate();
