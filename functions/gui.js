import * as THREE from "three";
import dat from "dat.gui";
import { terrainConfig, waterConfig } from "./config";

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

  // terrainFolder
  //   .add(terrainConfig.fbm, "depthGain", 0, 1.0)
  //   .name("Depth Gain")
  //   .onChange((value) => {
  //     terrainMaterial.uniforms.depthGain.value = value;
  //     terrainConfig.fbm.depthGain = value; // Update config
  //   });

  terrainFolder
    .addColor(terrainConfig.layers, "layer1Color")
    .name("Color 1")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      terrainMaterial.uniforms.layer1Color.value = vecColor;
    });

  terrainFolder
    .addColor(terrainConfig.layers, "layer2Color")
    .name("Color 2")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      terrainMaterial.uniforms.layer2Color.value = vecColor;
    });

  terrainFolder
    .addColor(terrainConfig.layers, "layer3Color")
    .name("Color 3")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      terrainMaterial.uniforms.layer3Color.value = vecColor;
    });

  terrainFolder
    .addColor(terrainConfig.layers, "layer4Color")
    .name("Color 4")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      terrainMaterial.uniforms.layer4Color.value = vecColor;
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

  // waterFolder
  //   .addColor(waterConfig.water, "waterSpecular")
  //   .name("Water Specular")
  //   .onChange((value) => {
  //     const vecColor = new THREE.Color(
  //       value.r / 255.0,
  //       value.g / 255.0,
  //       value.b / 255.0
  //     );

  //     waterMaterial.uniforms.waterSpecular.value = vecColor;
  //   });

  terrainFolder.open();
  waterFolder.open();
}
