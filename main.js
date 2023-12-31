import * as THREE from "three";
import {
  createPlanetMaterial,
  createWaterMaterial,
} from "./functions/materials.js";
import { setupSceneAndControls } from "./functions/setupSceneAndControls.js";
import { createSceneObjects } from "./functions/sceneObjects.js";
import { createLODObjects } from "./functions/lodObjects.js";
import { setupGUI } from "./functions/gui.js";

// Boilerplate code - made into a function
const { scene, camera, renderer, controls } = setupSceneAndControls();
const clock = new THREE.Clock();

// Create scene objects (sun, stars, clouds)
const { sun, stars, clouds } = createSceneObjects();
scene.add(sun);
scene.add(stars);
scene.add(clouds);

// Create materials
let waterMaterial = createWaterMaterial();
let planetMaterial = createPlanetMaterial();

// Create LOD objects
const { planet, water } = createLODObjects(planetMaterial, waterMaterial);
scene.add(planet);
scene.add(water);

// Setup GUI
setupGUI(planetMaterial, waterMaterial);

function updateScene(deltaTime) {
  clouds.rotation.x += 0.02 * deltaTime;
  clouds.rotation.y += 0.04 * deltaTime;

  waterMaterial.uniforms.time.value += deltaTime;

  planet.update(camera);
  water.update(camera);
}

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  updateScene(deltaTime);
  controls.update();

  renderer.render(scene, camera);
}

animate();
