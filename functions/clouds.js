import * as THREE from "three";
import { Noise } from "noisejs"; // https://github.com/josephg/noisejs - stegu noise

// Initialize a random seed for the noise
const noise = new Noise(Math.random());

export function createClouds() {
  noise.seed(1);

  // Loads a texture for the clouds
  const textureLoader = new THREE.TextureLoader();
  const cloudTexture = textureLoader.load("images/cloudBillboard.png");

  // Creates the main group for all clouds
  const clouds = new THREE.Group();

  // Number of potential cloud positions
  const numberOfCloudPositions = 2000;
  let scale = 1.0; // init

  // Threshold for cloud spawning based on noise
  const cloudSpawnThreshold = 0.05; // Adjust this as needed

  // Add clouds based on noise threshold
  for (let i = 0; i < numberOfCloudPositions; i++) {
    const theta = Math.PI * Math.random();
    const phi = 2 * Math.PI * Math.random();

    const offset = 5.0; // Create different clouds with offset
    let noiseValue = noise.perlin2(theta + offset, phi + offset);

    // Only create a cloud if the noise value exceeds the threshold
    if (noiseValue > cloudSpawnThreshold) {
      const cloudMaterial = new THREE.SpriteMaterial({
        map: cloudTexture,
        color: 0xffffff,
        transparent: true,
        opacity: Math.random() * 0.7,
      });

      const cloud = new THREE.Sprite(cloudMaterial);

      scale = Math.random() * 0.1 + 0.2;
      cloud.scale.set(scale, scale, scale);

      // Convert spherical coordinates to Cartesian coordinates
      const radius = 1.1 + Math.random() * 0.1;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      cloud.position.set(x, y, z);

      // Add the cloud to the main clouds group
      clouds.add(cloud);
    }
  }

  return clouds;
}
