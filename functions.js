import * as THREE from "three";
import { Noise } from "noisejs";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import dat from "dat.gui";

// Initialize a random seed for the noise
const noise = new Noise(Math.random());

export function setupSceneAndControls() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100000
  );
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;
  controls.enableDamping = true;

  // Set initial camera position and update controls
  camera.position.z = 5;
  controls.update();

  return { scene, camera, renderer, controls };
}

export function createSun(position, size, strength) {
  const sun = new THREE.Group();

  const lightGeometry = new THREE.SphereGeometry(size, 16, 16);
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
  });
  const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);

  const pointLight = new THREE.PointLight(0xff0000, strength, 0, 1);

  if (position) {
    sun.position.copy(position);
    lightMesh.position.set(position.x, position.y, position.z);
    pointLight.position.set(position.x, position.y, position.z);
  }

  sun.add(lightMesh);
  sun.add(pointLight);

  return sun;
}

export function createPlanet(mountainHeight) {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const vertices = geometry.attributes.position;

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
    );

    // Adjust vertex position based on noise value and mountain height
    const mountainOffset = mountainHeight * noiseValue;
    vertex.normalize().multiplyScalar(1 + mountainOffset);

    vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  const material = new THREE.MeshStandardMaterial();
  const planet = new THREE.Mesh(geometry, material);
  return planet;
}

export function setupGUI(updatePlanetGeometry) {
  const gui = new dat.GUI();
  const controlsFolder = gui.addFolder("Controls");

  let mountainHeight = 0.5;

  controlsFolder
    .add({ mountainHeight: mountainHeight }, "mountainHeight", 0, 2)
    .name("Mountain Height")
    .onChange((value) => {
      updatePlanetGeometry(value); // Pass only the mountainHeight
    });

  controlsFolder.open();
}

export function createStars() {
  // Load a texture for the star
  const textureLoader = new THREE.TextureLoader();
  const starTexture = textureLoader.load("images/starBillboard.png");

  // Create billboards (stars)
  const numberOfStars = 1000; // Change this to the desired number of stars
  const stars = new THREE.Group();

  const maxDistance = 2500; // Set the maximum distance from the center

  for (let i = 0; i < numberOfStars; i++) {
    const starMaterial = new THREE.SpriteMaterial({
      map: starTexture,
      color: 0xffffff, // You can set a color if needed
      transparent: true,
      blending: THREE.AdditiveBlending, // Adjust blending mode as desired
    });

    const star = new THREE.Sprite(starMaterial);
    star.scale.set(1.5, 1.5, 1.5); // Set the initial scale of the stars

    // Set random positions for stars away from the center of the scene
    const x = (Math.random() - 0.5) * 2 * maxDistance;
    const y = (Math.random() - 0.5) * 2 * maxDistance;
    const z = (Math.random() - 0.5) * 2 * maxDistance;

    star.position.set(x, y, z);

    // Add the star to the group
    stars.add(star);
  }

  return stars;
}
