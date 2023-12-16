import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createPhongMaterial } from "./functions.js";

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;
controls.enableDamping = true;

// Add axis helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Create a lightSource, so we can see where the light is coming from (WIP)
const lightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const lightMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
});
const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
lightMesh.position.set(1, 1, 1);
scene.add(lightMesh);

// Create a mesh using Phong material
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = createPhongMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Set initial camera position and update controls
camera.position.z = 5;
controls.update();

// Animation function
function animate() {
  requestAnimationFrame(animate);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop
animate();
