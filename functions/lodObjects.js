import * as THREE from "three";

export function createObjects(terrainMaterial, waterMaterial) {
  // Create different levels of detail
  const geometry = new THREE.IcosahedronGeometry(1, 128);

  const terrain = new THREE.Mesh(geometry, terrainMaterial);
  const water = new THREE.Mesh(geometry, waterMaterial);

  return {
    terrain,
    water,
  };
}
