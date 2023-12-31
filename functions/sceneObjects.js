import * as THREE from "three";
import { createSun } from "./sun.js";
import { createClouds } from "./clouds.js";
import { createStars } from "./stars.js";

export function createSceneObjects() {
  const sunPosition = new THREE.Vector3(10, 10, 10);
  const sunSize = 0.8;
  const sun = createSun(sunPosition, sunSize);

  const stars = createStars();

  const clouds = createClouds();

  return { sun, stars, clouds };
}
