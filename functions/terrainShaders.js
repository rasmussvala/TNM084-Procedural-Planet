import { random3, noise, fbm } from "./shaderUtils";

export const terrainVertexShader =
  /*glsl*/ `
    
// Variables
varying vec3 vNormal;
varying vec3 vPosition;

uniform int octaves;
uniform float lacunarity;
uniform float frequency;
uniform float amplitude;
uniform float depthGain; ` +
  random3 +
  noise +
  fbm +
  /*glsl*/ `

void main() {
  // Shader uses Triangle method to calculate normals
  vec3 p = position;

  // Calculate nearby points for the normal
  vec3 pN = normalize(p); // normalize(p);

  p = pN * fbm(pN);
  
  vec3 v1 = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), step(0.9, abs(dot(pN, vec3(1.0, 0.0, 0.0)))));
  
  float deltaStep = 0.00001;
  
  v1 = cross(pN, v1);
  vec3 p1 = pN + v1 * deltaStep;
  p1 *= fbm(p1);

  vec3 v2 = cross(pN, v1);
  vec3 p2 = pN + v2 * deltaStep;
  p2 *= fbm(p2);

  // Compute new normal and pass to fragment shader
  vNormal = normalize(cross((p1 - p), (p2 - p)));

  // Pass the new position to the fragment shader
  vPosition = p;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

export const terrainFragmentShader = /*glsl*/ `

varying vec3 vNormal;  // Surface normal
varying vec3 vPosition;  // Vertex position

uniform float Ka;   // Ambient reflection coefficient
uniform float Kd;   // Diffuse reflection coefficient
uniform float Ks;   // Specular reflection coefficient
uniform float shininess; // Shininess

// Material color
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;

// Define thresholds for elevation of different layers
uniform float layer1Threshold; 
uniform float layer2Threshold; 
uniform float layer3Threshold; 
uniform float layer4Threshold;
uniform float layer5Threshold;
uniform float maxTerrainRadius;

// Define colors for different layers
uniform vec3 layer1Color; 
uniform vec3 layer2Color; 
uniform vec3 layer3Color; 
uniform vec3 layer4Color;
uniform vec3 layer5Color;

vec3 layerColor() {
  
  float distanceToCore = length(vec3(0.0, 0.0, 0.0) - vPosition);

  // Normalize the distance to be between 0 and 1
  float normalizedDistance = distanceToCore / maxTerrainRadius;

  // Determine the blend factors based on distance for each layer
  float layer1Factor = smoothstep(layer2Threshold, layer1Threshold, normalizedDistance);
  float layer2Factor = smoothstep(layer3Threshold, layer2Threshold, normalizedDistance);
  float layer3Factor = smoothstep(layer4Threshold, layer3Threshold, normalizedDistance);
  float layer4Factor = smoothstep(layer5Threshold, layer4Threshold, normalizedDistance);
  float layer5Factor = smoothstep(0.0, layer5Threshold, normalizedDistance);   

   // Interpolate between different layers based on distance
   vec3 finalColor = mix(layer5Color, layer4Color, layer5Factor);
   finalColor = mix(finalColor, layer3Color, layer4Factor);
   finalColor = mix(finalColor, layer2Color, layer3Factor);
   finalColor = mix(finalColor, layer1Color, layer2Factor);

  return finalColor;
}

vec4 phongShading() {

  vec3 lightPosition = vec3(10.0, 10.0, 10.0); // Light position

  vec3 N = normalize(vNormal);
  vec3 L = normalize(lightPosition - vPosition);

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(cameraPosition - vPosition); // Vector to viewer
    // Compute the specular term
    float specularAngle = max(dot(R, V), 0.0);
    specular = pow(specularAngle, shininess);
  }

  return vec4(Ka * ambientColor +
              Kd * lambertian * layerColor() +
              Ks * specular * specularColor, 1.0);
}

void main() {    
  gl_FragColor = phongShading();
}`;
