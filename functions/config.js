import * as THREE from "three";

// Function to generate HSL-based palette
function generateHSLPalette(
  baseHue,
  numColors,
  saturation = 0.8,
  lightness = 0.5
) {
  const palette = [];
  const hueIncrement = 25;

  for (let i = 0; i < numColors; i++) {
    const hue = (baseHue + i * hueIncrement) % 360;
    const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);
    palette.push(color);
  }

  return palette;
}

// Generate color palette
const colorRange = 360;
const baseHue = Math.random() * colorRange;
const numLayerColors = 4;
const layerPalette = generateHSLPalette(baseHue, numLayerColors);

// Generate terrain parameters
function generateTerrainValue() {
  const maxRange = 3.0;
  const minRange = 2.0;
  return Math.random() * (maxRange - minRange) + minRange;
}

function generateAmpValue() {
  const maxRange = 0.6;
  const minRange = 0.2;
  return Math.random() * (maxRange - minRange) + minRange;
}

export const terrainConfig = {
  phong: {
    Ka: 0.05,
    Kd: 0.8,
    Ks: 0.01,
    shininess: 100.0,
    ambientColor: layerPalette[2],
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
    layer1Color: layerPalette[0],
    layer2Color: layerPalette[1],
    layer3Color: layerPalette[2],
    layer4Color: layerPalette[3],
    layer5Color: new THREE.Color(0.0, 0.0, 0.0), // in the core of the planet, not visable
  },
};

export const waterConfig = {
  water: {
    timeScale: 0.0001,
    waveAmplitude: 1.0,
    waterAmbient: layerPalette[2],
    waterDiffuse: layerPalette[3],
    waterSpecular: new THREE.Color(1.0, 1.0, 1.0),
  },
};

// Assign random values to fbm properties after terrainConfig object initialization
terrainConfig.fbm.lacunarity = generateTerrainValue();
terrainConfig.fbm.frequency = generateTerrainValue();
terrainConfig.fbm.amplitude = generateAmpValue();
