import * as THREE from "three";
import {
  waterVertexShader,
  waterFragmentShader,
  planetVertexShader,
  planetFragmentShader,
} from "./shaders";
import { planetConfig, waterConfig } from "./config";

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
      waterKa: { value: planetConfig.phong.Ka },
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

export function createPlanetMaterial() {
  const vertexShader = planetVertexShader;
  const fragmentShader = planetFragmentShader;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      Ka: { value: planetConfig.phong.Ka },
      Kd: { value: planetConfig.phong.Kd },
      Ks: { value: planetConfig.phong.Ks },
      shininess: { value: planetConfig.phong.shininess },
      ambientColor: { value: planetConfig.phong.ambientColor },
      diffuseColor: { value: planetConfig.phong.diffuseColor },
      specularColor: { value: planetConfig.phong.specularColor },

      octaves: { value: planetConfig.fbm.octaves },
      lacunarity: { value: planetConfig.fbm.lacunarity },
      frequency: { value: planetConfig.fbm.frequency },
      amplitude: { value: planetConfig.fbm.amplitude },
      depthGain: { value: planetConfig.fbm.depthGain },

      layer1Threshold: { value: planetConfig.layers.layer1Threshold },
      layer2Threshold: { value: planetConfig.layers.layer2Threshold },
      layer3Threshold: { value: planetConfig.layers.layer3Threshold },
      layer4Threshold: { value: planetConfig.layers.layer4Threshold },
      layer5Threshold: { value: planetConfig.layers.layer5Threshold },
      maxPlanetRadius: { value: planetConfig.layers.maxPlanetRadius },
      layer1Color: { value: planetConfig.layers.layer1Color },
      layer2Color: { value: planetConfig.layers.layer2Color },
      layer3Color: { value: planetConfig.layers.layer3Color },
      layer4Color: { value: planetConfig.layers.layer4Color },
      layer5Color: { value: planetConfig.layers.layer5Color },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  return material;
}
