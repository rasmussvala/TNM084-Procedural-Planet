import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Noise } from "noisejs"; // https://github.com/josephg/noisejs - stegu noise
import { createPhongMaterial } from "./functions.js";

// Initialize a ranodom seed for the noise
const noise = new Noise(Math.random());

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
// const lightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
// const lightMaterial = new THREE.MeshStandardMaterial({
//   color: 0xffffff,
//   emissive: 0xffffff,
// });
// const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
// lightMesh.position.set(1, 1, 1);
// scene.add(lightMesh);

// Create a mesh using Phong material
const geometry = new THREE.SphereGeometry(1, 64, 64);

// Get the vertices of the geometry
const vertices = geometry.attributes.position;

// Use noise to manipulate vertex positions
for (let i = 0; i < vertices.count; i++) {
  const vertex = new THREE.Vector3(
    vertices.getX(i),
    vertices.getY(i),
    vertices.getZ(i)
  );
  const noiseValue = noise.simplex3(
    vertex.x * 1.5,
    vertex.y * 1.5,
    vertex.z * 1.5
  ); // Adjust the scale as needed

  // Modify the vertex position based on noise value
  vertex.normalize().multiplyScalar(1 + 0.1 * noiseValue); // Adjust the multiplier for deformation
  vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
}

const material = createPhongMaterial();
const planet = new THREE.Mesh(geometry, material);
scene.add(planet);

// Set initial camera position and update controls
camera.position.z = 5;
controls.update();

// Animation function
function animate() {
  requestAnimationFrame(animate);
  // planet.rotation.x += 0.01;
  // planet.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop
animate();
