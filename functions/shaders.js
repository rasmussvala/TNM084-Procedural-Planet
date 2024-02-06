import { random3, rot3, perlin3DNoise, noise } from "./shaderUtils";

export const waterVertexShader =
  /*glsl*/ `
varying vec3 vNormal;
varying vec3 vPosition;
 
uniform float time; 
uniform float timeScale; ` +
  rot3 +
  random3 +
  perlin3DNoise +
  /*glsl*/ `

float fbm(vec3 st) {

  float height = 1.0;
  float amplitude = 0.2;
  float frequency = 0.4;
  float octaves = 6.0;
  float depthGain = 0.12;
  float lacunarity = 8.0;
  
  for (float i = 0.0; i < octaves; i++) {
      height += perlin3DNoise(st * frequency, time * timeScale) * amplitude;
      amplitude *= depthGain;
      frequency *= lacunarity + (time * 0.0001);
  }

  return height;
}

void main() {    

  // Shader uses Triangle method to calculate normals
  vec3 p = position;

  // Calculate nearby points for the normal
  vec3 pN = normalize(p);

  p = pN * fbm(pN);
  
  vec3 v1 = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), step(0.9, abs(dot(pN, vec3(1.0, 0.0, 0.0)))));
  
  float deltaStep = 0.00001;
  
  v1 = cross(pN, v1);
  vec3 p1 = pN + v1 * deltaStep;
  p1 = p1 * fbm(p1);

  vec3 v2 = cross(pN, v1);
  vec3 p2 = pN + v2 * deltaStep;
  p2 = p2 * fbm(p2);

  // Compute new normal
  vec3 newNormal = normalize(cross((p1 - p), (p2 - p)));

  // Pass the new normal and position to the fragment shader
  vNormal = newNormal;
  vPosition = p;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const waterFragmentShader =
  /*glsl*/ `
varying vec3 vNormal;  
varying vec3 vPosition; 

uniform float time;
uniform float timeScale;
uniform float waveAmplitude;

uniform vec3 waterAmbient;
uniform vec3 waterDiffuse; 
uniform vec3 waterSpecular; 
uniform float waterKa; ` +
  rot3 +
  random3 +
  perlin3DNoise +
  /*glsl*/ `

void main() { 

  float waterKd = 1.0;
  float waterKs = 1.0;
  float waterShininess = 60.0;

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
  specular = pow(specularAngle, waterShininess);
  }
  // Calculate wave pattern using the time and position, adjusting by amplitude
  float waveDisplacement = perlin3DNoise(vPosition, time) * waveAmplitude;

  float waterAlpha = 0.99 + 0.01 * sin(waveDisplacement * 10.0 + time);

  // Example: Apply wave pattern to color
  vec3 waveColor = waterDiffuse + waterDiffuse * abs(sin(waveDisplacement * 0.5 + time * timeScale));

  gl_FragColor = vec4(waterKa * waterAmbient +
                      waterKd * lambertian * waveColor +
                      waterKs * specular * waterSpecular, waterAlpha);
  
}
`;

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
  /*glsl*/ `



// Fractal Brownian Noise for surface texture
float fbm(vec3 st) {

  float height = 1.0;
  float localAmplitude = amplitude;
  float localFrequency = frequency;
  
  for (int i = 0; i < octaves; i++) {
      height += noise(st * localFrequency) * localAmplitude;
      localAmplitude *= depthGain;
      localFrequency *= lacunarity;
  }

  return height;
}

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
