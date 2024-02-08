import * as THREE from "three";

// Central Configuration Object
export const terrainConfig = {
  phong: {
    Ka: 0.03,
    Kd: 0.8,
    Ks: 0.01,
    shininess: 30.0,
    ambientColor: new THREE.Color(1.0, 1.0, 1.0),
    diffuseColor: new THREE.Color(1.0, 1.0, 1.0),
    specularColor: new THREE.Color(1.0, 1.0, 1.0),
  },
  fbm: {
    octaves: 4.0,
    lacunarity: 3.0,
    frequency: 1.6,
    amplitude: 0.5,
    depthGain: 0.4,
  },
  layers: {
    layer1Threshold: 0.68,
    layer2Threshold: 0.66,
    layer3Threshold: 0.58,
    layer4Threshold: 0.52,
    layer5Threshold: 0.47,
    maxTerrainRadius: 2.0,
    layer1Color: new THREE.Color(1.0, 0.0, 0.0),
    layer2Color: new THREE.Color(0.0, 1.0, 0.0),
    layer3Color: new THREE.Color(0.0, 0.0, 1.0),
    layer4Color: new THREE.Color(1.0, 1.0, 0.0),
    layer5Color: new THREE.Color(1.0, 1.0, 1.0),
  },
};

export const waterConfig = {
  water: {
    timeScale: 0.0001,
    waveAmplitude: 1.0,
    waterAmbient: new THREE.Color(1.0, 1.0, 1.0),
    waterDiffuse: new THREE.Color(0.1, 0.3, 0.8),
    waterSpecular: new THREE.Color(1.0, 1.0, 1.0),
  },
};
