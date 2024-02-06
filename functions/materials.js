import * as THREE from "three";
import { terrainVertexShader, terrainFragmentShader } from "./terrainShaders";
import { waterVertexShader, waterFragmentShader } from "./waterShader";
import { terrainConfig, waterConfig } from "./config";

export function createWaterMaterial() {
  // Custom shader for water effect
  const waterShader = {
    uniforms: {
      time: { value: 0 },
      timeScale: { value: waterConfig.water.timeScale },
      waveAmplitude: { value: waterConfig.water.waveAmplitude },
      waterAmbient: { value: waterConfig.water.waterAmbient },
      waterDiffuse: { value: waterConfig.water.waterDiffuse },
      waterSpecular: { value: waterConfig.water.waterSpecular },
      waterKa: { value: terrainConfig.phong.Ka },
    },
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
  };

  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: waterShader.uniforms,
    vertexShader: waterShader.vertexShader,
    fragmentShader: waterShader.fragmentShader,
    transparent: true,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: true,
  });

  return waterMaterial;
}

export function createTerrainMaterial() {
  const vertexShader = terrainVertexShader;
  const fragmentShader = terrainFragmentShader;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      Ka: { value: terrainConfig.phong.Ka },
      Kd: { value: terrainConfig.phong.Kd },
      Ks: { value: terrainConfig.phong.Ks },
      shininess: { value: terrainConfig.phong.shininess },
      ambientColor: { value: terrainConfig.phong.ambientColor },
      diffuseColor: { value: terrainConfig.phong.diffuseColor },
      specularColor: { value: terrainConfig.phong.specularColor },

      octaves: { value: terrainConfig.fbm.octaves },
      lacunarity: { value: terrainConfig.fbm.lacunarity },
      frequency: { value: terrainConfig.fbm.frequency },
      amplitude: { value: terrainConfig.fbm.amplitude },
      depthGain: { value: terrainConfig.fbm.depthGain },

      layer1Threshold: { value: terrainConfig.layers.layer1Threshold },
      layer2Threshold: { value: terrainConfig.layers.layer2Threshold },
      layer3Threshold: { value: terrainConfig.layers.layer3Threshold },
      layer4Threshold: { value: terrainConfig.layers.layer4Threshold },
      layer5Threshold: { value: terrainConfig.layers.layer5Threshold },
      maxTerrainRadius: { value: terrainConfig.layers.maxTerrainRadius },
      layer1Color: { value: terrainConfig.layers.layer1Color },
      layer2Color: { value: terrainConfig.layers.layer2Color },
      layer3Color: { value: terrainConfig.layers.layer3Color },
      layer4Color: { value: terrainConfig.layers.layer4Color },
      layer5Color: { value: terrainConfig.layers.layer5Color },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  return material;
}
