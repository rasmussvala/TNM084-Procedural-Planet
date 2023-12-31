import * as THREE from "three";
import dat from "dat.gui";
import { planetConfig, waterConfig } from "./config";

export function setupGUI(material, waterMaterial) {
  const gui = new dat.GUI();
  const phongFolder = gui.addFolder("Phong Illumination");
  const terrainFolder = gui.addFolder("Terrain Parameters");
  const waterFolder = gui.addFolder("Water Parameters");
  const layersFolder = gui.addFolder("Layer Controls");

  phongFolder
    .add(planetConfig.phong, "Ka", 0, 1.0)
    .name("Ka")
    .onChange((value) => {
      material.uniforms.Ka.value = value;
      waterMaterial.uniforms.waterKa.value = value;
      planetConfig.phong.Ka = value; // Update config
    });

  phongFolder
    .add(planetConfig.phong, "Kd", 0, 1.0)
    .name("Kd")
    .onChange((value) => {
      material.uniforms.Kd.value = value;
      planetConfig.phong.Kd = value; // Update config
    });

  phongFolder
    .add(planetConfig.phong, "Ks", 0, 1.0)
    .name("Ks")
    .onChange((value) => {
      material.uniforms.Ks.value = value;
      planetConfig.phong.Ks = value; // Update config
    });

  phongFolder
    .add(planetConfig.phong, "shininess", 0.1, 100.0)
    .name("Shininess")
    .onChange((value) => {
      material.uniforms.shininess.value = value;
      planetConfig.phong.shininess = value; // Update config
    });

  phongFolder
    .addColor(planetConfig.phong, "ambientColor")
    .name("Ambient Color")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      material.uniforms.ambientColor.value = vecColor;
    });

  phongFolder
    .addColor(planetConfig.phong, "diffuseColor")
    .name("Diffuse Color")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      material.uniforms.diffuseColor.value = vecColor;
    });

  phongFolder
    .addColor(planetConfig.phong, "specularColor")
    .name("Specular Color")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      material.uniforms.specularColor.value = vecColor;
    });

  terrainFolder
    .add(planetConfig.fbm, "octaves", 0, 5.0)
    .name("Octaves")
    .onChange((value) => {
      material.uniforms.octaves.value = value;
      planetConfig.fbm.octaves = value; // Update config
    });

  terrainFolder
    .add(planetConfig.fbm, "lacunarity", 0, 5.0)
    .name("Lacunarity")
    .onChange((value) => {
      material.uniforms.lacunarity.value = value;
      planetConfig.fbm.lacunarity = value; // Update config
    });

  terrainFolder
    .add(planetConfig.fbm, "frequency", 0, 5.0)
    .name("Frequency")
    .onChange((value) => {
      material.uniforms.frequency.value = value;
      planetConfig.fbm.frequency = value; // Update config
    });

  terrainFolder
    .add(planetConfig.fbm, "amplitude", 0, 5.0)
    .name("Amplitude")
    .onChange((value) => {
      material.uniforms.amplitude.value = value;
      planetConfig.fbm.amplitude = value; // Update config
    });

  terrainFolder
    .add(planetConfig.fbm, "depthGain", 0, 1.0)
    .name("Depth Gain")
    .onChange((value) => {
      material.uniforms.depthGain.value = value;
      planetConfig.fbm.depthGain = value; // Update config
    });

  layersFolder
    .add(planetConfig.layers, "layer1Threshold", 0.0, 1.0)
    .name("Threshold 1")
    .onChange((value) => {
      material.uniforms.layer1Threshold.value = value;
      planetConfig.layers.layer1Threshold = value; // Update config
    });

  layersFolder
    .add(planetConfig.layers, "layer2Threshold", 0.0, 1.0)
    .name("Threshold 2")
    .onChange((value) => {
      material.uniforms.layer2Threshold.value = value;
      planetConfig.layers.layer2Threshold = value; // Update config
    });

  layersFolder
    .add(planetConfig.layers, "layer3Threshold", 0.0, 1.0)
    .name("Threshold 3")
    .onChange((value) => {
      material.uniforms.layer3Threshold.value = value;
      planetConfig.layers.layer3Threshold = value; // Update config
    });

  layersFolder
    .add(planetConfig.layers, "layer4Threshold", 0.0, 1.0)
    .name("Threshold 4")
    .onChange((value) => {
      material.uniforms.layer4Threshold.value = value;
      planetConfig.layers.layer4Threshold = value; // Update config
    });

  layersFolder
    .add(planetConfig.layers, "layer5Threshold", 0.0, 1.0)
    .name("Threshold 5")
    .onChange((value) => {
      material.uniforms.layer5Threshold.value = value;
      planetConfig.layers.layer5Threshold = value; // Update config
    });

  layersFolder
    .add(planetConfig.layers, "maxPlanetRadius", 0, 5.0)
    .name("Max Planet Radius")
    .onChange((value) => {
      material.uniforms.maxPlanetRadius.value = value;
      planetConfig.layers.maxPlanetRadius = value; // Update config
    });

  layersFolder
    .addColor(planetConfig.layers, "layer1Color")
    .name("Layer 1 Color")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      material.uniforms.layer1Color.value = vecColor;
    });

  layersFolder
    .addColor(planetConfig.layers, "layer2Color")
    .name("Layer 2 Color")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      material.uniforms.layer2Color.value = vecColor;
    });

  layersFolder
    .addColor(planetConfig.layers, "layer3Color")
    .name("Layer 3 Color")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      material.uniforms.layer3Color.value = vecColor;
    });

  layersFolder
    .addColor(planetConfig.layers, "layer4Color")
    .name("Layer 4 Color")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      material.uniforms.layer4Color.value = vecColor;
    });

  layersFolder
    .addColor(planetConfig.layers, "layer5Color")
    .name("Layer 5 Color")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      material.uniforms.layer5Color.value = vecColor;
    });

  waterFolder
    .add(waterConfig.water, "timeScale", 0, 0.1)
    .name("Time Scale")
    .onChange((value) => {
      waterMaterial.uniforms.timeScale.value = value;
      waterConfig.water.timeScale = value;
    });

  waterFolder
    .add(waterConfig.water, "waveAmplitude", 0, 5.0)
    .name("Wave Amplitude")
    .onChange((value) => {
      waterMaterial.uniforms.waveAmplitude.value = value;
      waterConfig.water.waveAmplitude = value;
    });

  waterFolder
    .addColor(waterConfig.water, "waterAmbient")
    .name("Water Ambient")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      waterMaterial.uniforms.waterAmbient.value = vecColor;
    });

  waterFolder
    .addColor(waterConfig.water, "waterDiffuse")
    .name("Water Diffuse")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      waterMaterial.uniforms.waterDiffuse.value = vecColor;
    });

  waterFolder
    .addColor(waterConfig.water, "waterSpecular")
    .name("Water Specular")
    .onChange((value) => {
      const vecColor = new THREE.Color(
        value.r / 255.0,
        value.g / 255.0,
        value.b / 255.0
      );

      waterMaterial.uniforms.waterSpecular.value = vecColor;
    });

  phongFolder.open();
  terrainFolder.open();
  waterFolder.open();
  layersFolder.open();
}
