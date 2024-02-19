import * as THREE from "three";
import dat from "dat.gui";
import { terrainConfig, waterConfig } from "./config";

function convertColorToArray(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);

  return [r, g, b];
}

var palette = {
  color1: convertColorToArray(terrainConfig.layers.layer1Color),
  color2: convertColorToArray(terrainConfig.layers.layer2Color),
  color3: convertColorToArray(terrainConfig.layers.layer3Color),
  color4: convertColorToArray(terrainConfig.layers.layer4Color),
};

export function setupGUI(terrainMaterial, waterMaterial) {
  const gui = new dat.GUI();
  const terrainFolder = gui.addFolder("Terrain Parameters");
  const waterFolder = gui.addFolder("Water Parameters");

  terrainFolder
    .add(terrainConfig.fbm, "octaves", 1.0, 4.0)
    .name("Octaves")
    .onChange((value) => {
      terrainMaterial.uniforms.octaves.value = value;
      terrainConfig.fbm.octaves = value; // Update config
    });

  terrainFolder
    .add(terrainConfig.fbm, "lacunarity", 0.2, 3.0)
    .name("Lacunarity")
    .onChange((value) => {
      terrainMaterial.uniforms.lacunarity.value = value;
      terrainConfig.fbm.lacunarity = value; // Update config
    });

  terrainFolder
    .add(terrainConfig.fbm, "frequency", 1.0, 3.0)
    .name("Frequency")
    .onChange((value) => {
      terrainMaterial.uniforms.frequency.value = value;
      terrainConfig.fbm.frequency = value; // Update config
    });

  terrainFolder
    .add(terrainConfig.fbm, "amplitude", 0.2, 0.6)
    .name("Amplitude")
    .onChange((value) => {
      terrainMaterial.uniforms.amplitude.value = value;
      terrainConfig.fbm.amplitude = value; // Update config
    });

  terrainFolder
    .addColor(palette, "color1")
    .name("Color 1")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value[0] / 255.0,
        value[1] / 255.0,
        value[2] / 255.0
      );
      terrainMaterial.uniforms.layer1Color.value = vecColor;
      palette.color1 = value;
    });

  terrainFolder
    .addColor(palette, "color2")
    .name("Color 2")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value[0] / 255.0,
        value[1] / 255.0,
        value[2] / 255.0
      );
      terrainMaterial.uniforms.layer2Color.value = vecColor;
      palette.color2 = value;
    });

  terrainFolder
    .addColor(palette, "color3")
    .name("Color 3")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value[0] / 255.0,
        value[1] / 255.0,
        value[2] / 255.0
      );
      terrainMaterial.uniforms.layer3Color.value = vecColor;
      palette.color3 = value;
    });

  terrainFolder
    .addColor(palette, "color4")
    .name("Color 4")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value[0] / 255.0,
        value[1] / 255.0,
        value[2] / 255.0
      );
      terrainMaterial.uniforms.layer4Color.value = vecColor;
      palette.color4 = value;
    });

  waterFolder
    .addColor(waterConfig.water, "waterDiffuse")
    .name("Water Color")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      waterMaterial.uniforms.waterDiffuse.value = vecColor;
    });

  terrainFolder.open();
  waterFolder.open();
}
