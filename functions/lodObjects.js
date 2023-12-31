import * as THREE from "three";

export function createLODObjects(planetMaterial, waterMaterial) {
  // Create different levels of detail
  const highDetail = new THREE.IcosahedronGeometry(1, 128);
  const mediumDetail = new THREE.IcosahedronGeometry(1, 32);
  const lowDetail = new THREE.IcosahedronGeometry(1, 16);

  // Create mesh for each level of detail for the planet
  const highDetailMeshPlanet = new THREE.Mesh(highDetail, planetMaterial);
  const mediumDetailMeshPlanet = new THREE.Mesh(mediumDetail, planetMaterial);
  const lowDetailMeshPlanet = new THREE.Mesh(lowDetail, planetMaterial);

  // Create mesh for each level of detail for the water
  const highDetailMeshWater = new THREE.Mesh(highDetail, waterMaterial);
  const mediumDetailMeshWater = new THREE.Mesh(mediumDetail, waterMaterial);
  const lowDetailMeshWater = new THREE.Mesh(lowDetail, waterMaterial);

  // Create LOD objects for the planet and water
  const planet = new THREE.LOD();
  const water = new THREE.LOD();

  // Add LOD levels for the planet
  planet.addLevel(highDetailMeshPlanet, 1); // closest
  planet.addLevel(mediumDetailMeshPlanet, 6); // medium distance
  planet.addLevel(lowDetailMeshPlanet, 15); // farthest

  // Add LOD levels for the water
  water.addLevel(highDetailMeshWater, 1); // closest
  water.addLevel(mediumDetailMeshWater, 6); // medium distance
  water.addLevel(lowDetailMeshWater, 15); // farthest

  return { planet, water };
}
