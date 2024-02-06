import { random3, rot3, perlin3DNoise } from "./shaderUtils";

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
