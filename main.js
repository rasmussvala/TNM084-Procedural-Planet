import * as THREE from "three";
import { createPlanetMaterial, createWaterMaterial } from "./functions.js";
import { setupGUI } from "./functions/gui.js";
import { setupSceneAndControls } from "./functions/setupSceneAndControls.js";
import { createSun } from "./functions/createSun.js";
import { createClouds } from "./functions/createClouds.js";
import { createStars } from "./functions/createStars.js";

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

// Creates stars
const stars = createStars();
scene.add(stars);

// Create different levels of detail
const highDetail = new THREE.IcosahedronGeometry(1, 128); // byt till icosahedron
const mediumDetail = new THREE.IcosahedronGeometry(1, 32);
const lowDetail = new THREE.IcosahedronGeometry(1, 16);

// Create materials in shader
let waterMaterial = createWaterMaterial();
let planetMaterial = createPlanetMaterial();

// Create mesh for each level of detail
const highDetailMeshPlanet = new THREE.Mesh(highDetail, planetMaterial);
const mediumDetailMeshPlanet = new THREE.Mesh(mediumDetail, planetMaterial);
const lowDetailMeshPlanet = new THREE.Mesh(lowDetail, planetMaterial);

const highDetailMeshWater = new THREE.Mesh(highDetail, waterMaterial);
const mediumDetailMeshWater = new THREE.Mesh(mediumDetail, waterMaterial);
const lowDetailMeshWater = new THREE.Mesh(lowDetail, waterMaterial);

// Create LOD objects
const planet = new THREE.LOD();
const water = new THREE.LOD();

// Add LOD levels
planet.addLevel(highDetailMeshPlanet, 1);
planet.addLevel(mediumDetailMeshPlanet, 6);
planet.addLevel(lowDetailMeshPlanet, 15);

water.addLevel(highDetailMeshWater, 1);
water.addLevel(mediumDetailMeshWater, 6);
water.addLevel(lowDetailMeshWater, 15);

// Add LOD object to the scene
scene.add(planet);
scene.add(water);

// Creates clouds
const clouds = createClouds();
scene.add(clouds);

// Creates the UI for interaction
setupGUI(planetMaterial, waterMaterial);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  clouds.rotation.x += 0.02 * deltaTime;
  clouds.rotation.y += 0.04 * deltaTime;

  // Update 'time' uniform for the water material
  waterMaterial.uniforms.time.value += deltaTime; // Use 'water.material' to access the water material

  planet.update(camera);
  water.update(camera);

  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop
animate();
