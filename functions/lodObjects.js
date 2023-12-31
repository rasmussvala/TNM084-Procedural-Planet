import * as THREE from "three";

export function createLODObjects(terrainMaterial, waterMaterial) {
  // Create different levels of detail
  const highDetail = new THREE.IcosahedronGeometry(1, 128);
  const mediumDetail = new THREE.IcosahedronGeometry(1, 32);
  const lowDetail = new THREE.IcosahedronGeometry(1, 16);

  // Create mesh for each level of detail for the terrain
  const highDetailMeshTerrain = new THREE.Mesh(highDetail, terrainMaterial);
  const mediumDetailMeshTerrain = new THREE.Mesh(mediumDetail, terrainMaterial);
  const lowDetailMeshTerrain = new THREE.Mesh(lowDetail, terrainMaterial);

  // Create mesh for each level of detail for the water
  const highDetailMeshWater = new THREE.Mesh(highDetail, waterMaterial);
  const mediumDetailMeshWater = new THREE.Mesh(mediumDetail, waterMaterial);
  const lowDetailMeshWater = new THREE.Mesh(lowDetail, waterMaterial);

  // Create LOD objects for the terrain and water
  const terrain = new THREE.LOD();
  const water = new THREE.LOD();

  // Add LOD levels for the terrain
  terrain.addLevel(highDetailMeshTerrain, 1); // closest
  terrain.addLevel(mediumDetailMeshTerrain, 6); // medium distance
  terrain.addLevel(lowDetailMeshTerrain, 15); // farthest

  // Add LOD levels for the water
  water.addLevel(highDetailMeshWater, 1); // closest
  water.addLevel(mediumDetailMeshWater, 6); // medium distance
  water.addLevel(lowDetailMeshWater, 15); // farthest

  return { terrain, water };
}
