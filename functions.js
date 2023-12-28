import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import dat from "dat.gui";
import { Noise } from "noisejs"; // https://github.com/josephg/noisejs - stegu noise

// Initialize a random seed for the noise
const noise = new Noise(Math.random());

// Central Configuration Object
const planetConfig = {
  phong: {
    Ka: 0.05,
    Kd: 0.8,
    Ks: 0.01,
    shininess: 30.0,
    ambientColor: new THREE.Color(0.7, 0.3, 0.0),
    diffuseColor: new THREE.Color(0.7, 0.3, 0.0),
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
    layer1Threshold: 0.8,
    layer2Threshold: 0.5,
    layer3Threshold: 0.3,
    layer4Threshold: 0.2,
    layer5Threshold: 0.1,
    maxPlanetRadius: 3.0,
    layer1Color: new THREE.Color(1.0, 1.0, 1.0),
    layer2Color: new THREE.Color(0.02, 0.4, 0.02),
    layer3Color: new THREE.Color(1.0, 1.0, 1.0),
    layer4Color: new THREE.Color(1.0, 1.0, 1.0),
    layer5Color: new THREE.Color(1.0, 1.0, 1.0),
  },
};

const waterConfig = {
  water: {
    timeScale: 0.0001,
    waveAmplitude: 1.0,
    waterAmbient: new THREE.Color(0.1, 0.3, 0.8),
    waterDiffuse: new THREE.Color(0.1, 0.3, 0.8),
    waterSpecular: new THREE.Color(1.0, 1.0, 1.0),
  },
};

export function setupSceneAndControls() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  // controls.autoRotate = true;
  // controls.autoRotateSpeed = 0.2;
  controls.enableDamping = true;

  // Set initial camera position and update controls
  camera.position.z = 5;
  controls.update();

  return { scene, camera, renderer, controls };
}

export function createSun(position, size) {
  const lightGeometry = new THREE.SphereGeometry(size, 16, 16);
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
  });
  const sun = new THREE.Mesh(lightGeometry, lightMaterial);

  // Place in (0, 0, 0) if negative values
  if (position) {
    sun.position.set(position.x, position.y, position.z);
  }

  return sun;
}

export function createWaterSphere(position, size) {
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
    vertexShader: /*glsl*/ `
      varying vec3 vNormal;
      varying vec3 vPosition;
       
      uniform float time; 
      uniform float timeScale;
  
      vec3 random3(vec3 st) {
        st = vec3(dot(st, vec3(127.1, 311.7, 171.3)),
                  dot(st, vec3(269.5, 183.3, 331.6)),
                  dot(st, vec3(419.2, 371.9, 241.8)));
        return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
      }

      vec3 rot3(vec3 v, float r) {
        vec3 res;

        res.x = cos(r)*v.x + sin(r)*v.y;
        res.y = -sin(r)*v.x + cos(r)*v.y;
        res.z = -cos(r)*v.x + sin(r)*v.y;

        return res;
      }

      float perlin3DNoise(vec3 st, float r) {
        vec3 i = floor(st);
        vec3 f = fract(st);
        vec3 u = f*f*(3.0-2.0*f);

        return mix(        
        mix( mix( dot( rot3(random3(i + vec3(0.0,0.0,0.0)), r), f - vec3(0.0,0.0,0.0)),
        dot( rot3(random3(i + vec3(1.0,0.0,0.0)), r), f - vec3(1.0,0.0,0.0) ), u.x),
        mix( dot( rot3(random3(i + vec3(0.0,1.0,0.0)), r), f - vec3(0.0,1.0,0.0) ),
        dot( rot3(random3(i + vec3(1.0,1.0,0.0)), r), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
        
        mix( mix( dot( rot3(random3(i + vec3(0.0,0.0,1.0)), r), f - vec3(0.0,0.0,1.0) ),
        dot( rot3(random3(i + vec3(1.0,0.0,1.0)), r), f - vec3(1.0,0.0,1.0) ), u.x),
        mix( dot( rot3(random3(i + vec3(0.0,1.0,1.0)), r), f - vec3(0.0,1.0,1.0) ),
        dot( rot3(random3(i + vec3(1.0,1.0,1.0)), r), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z);
      }

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
    `,
    fragmentShader: /*glsl*/ `
      varying vec3 vNormal;  
      varying vec3 vPosition; 

      uniform float time;
      uniform float timeScale;
      uniform float waveAmplitude;

      uniform vec3 waterAmbient;
      uniform vec3 waterDiffuse; 
      uniform vec3 waterSpecular; 
      uniform float waterKa;
  
      vec3 random3(vec3 st) {
        st = vec3(dot(st, vec3(127.1, 311.7, 171.3)),
                  dot(st, vec3(269.5, 183.3, 331.6)),
                  dot(st, vec3(419.2, 371.9, 241.8)));
        return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
      }

      vec3 rot3(vec3 v, float r) {
        vec3 res;

        res.x = cos(r)*v.x + sin(r)*v.y;
        res.y = -sin(r)*v.x + cos(r)*v.y;
        res.z = -cos(r)*v.x + sin(r)*v.y;

        return res;
      }

      float perlin3DNoise(vec3 st, float r) {
        vec3 i = floor(st);
        vec3 f = fract(st);
        vec3 u = f*f*(3.0-2.0*f);

        return mix(        
        mix( mix( dot( rot3(random3(i + vec3(0.0,0.0,0.0)), r), f - vec3(0.0,0.0,0.0)),
        dot( rot3(random3(i + vec3(1.0,0.0,0.0)), r), f - vec3(1.0,0.0,0.0) ), u.x),
        mix( dot( rot3(random3(i + vec3(0.0,1.0,0.0)), r), f - vec3(0.0,1.0,0.0) ),
        dot( rot3(random3(i + vec3(1.0,1.0,0.0)), r), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
        
        mix( mix( dot( rot3(random3(i + vec3(0.0,0.0,1.0)), r), f - vec3(0.0,0.0,1.0) ),
        dot( rot3(random3(i + vec3(1.0,0.0,1.0)), r), f - vec3(1.0,0.0,1.0) ), u.x),
        mix( dot( rot3(random3(i + vec3(0.0,1.0,1.0)), r), f - vec3(0.0,1.0,1.0) ),
        dot( rot3(random3(i + vec3(1.0,1.0,1.0)), r), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z);
      }  

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
    `,
  };

  const waterGeometry = new THREE.IcosahedronGeometry(size, 128);

  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: waterShader.uniforms,
    vertexShader: waterShader.vertexShader,
    fragmentShader: waterShader.fragmentShader,
    transparent: true,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: true,
  });

  const waterSphere = new THREE.Mesh(waterGeometry, waterMaterial);
  waterSphere.renderOrder = 0; // Set render order

  // Place at provided position or (0, 0, 0) if not specified
  if (position) {
    waterSphere.position.set(position.x, position.y, position.z);
  }

  return waterSphere;
}

export function createPlanet() {
  // ********** VERTEX SHADER **********
  const vertexShader = /*glsl*/ `
    
  // Variables
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform int octaves;
  uniform float lacunarity;
  uniform float frequency;
  uniform float amplitude;
  uniform float depthGain;

  // Random noise
  vec3 random3(vec3 st) {
    st = vec3( dot(st,vec3(127.1,311.7, 543.21)),
              dot(st,vec3(269.5,183.3, 355.23)),
              dot(st,vec3(846.34,364.45, 123.65)) ); // Haphazard additional numbers by IR
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
  }

  // Gradient Noise by Inigo Quilez - iq/2013
  // https://www.shadertoy.com/view/XdXGW8
  // Trivially extended to 3D by Ingemar
  float noise(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);

    vec3 u = f*f*(3.0-2.0*f);

    return mix(
      mix( mix( dot( random3(i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ),
        dot( random3(i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
      mix( dot( random3(i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ),
        dot( random3(i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),

      mix( mix( dot( random3(i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ),
        dot( random3(i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
      mix( dot( random3(i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ),
        dot( random3(i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z
      );
  }

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

  // ********** FRAGMENT SHADER **********
  const fragmentShader = /*glsl*/ `

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
  uniform float maxPlanetRadius;
  
  // Define colors for different layers
  uniform vec3 layer1Color; 
  uniform vec3 layer2Color; 
  uniform vec3 layer3Color; 
  uniform vec3 layer4Color;
  uniform vec3 layer5Color;

  vec3 layerColor() {
    
    float distanceToCore = length(vec3(0.0, 0.0, 0.0) - vPosition);

    // Normalize the distance to be between 0 and 1
    float normalizedDistance = distanceToCore / maxPlanetRadius;

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

  const geometry = new THREE.IcosahedronGeometry(1, 256);
  const planet = new THREE.Mesh(geometry, material);

  return planet;
}

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

export function createStars() {
  // Loads a texture for the stars
  const textureLoader = new THREE.TextureLoader();
  const starTexture = textureLoader.load("images/starBillboard.png");

  // Creates billboards (stars)
  const numberOfStars = 2000;
  const stars = new THREE.Group();

  const maxDistance = 1000;

  for (let i = 0; i < numberOfStars; i++) {
    const starMaterial = new THREE.SpriteMaterial({
      map: starTexture,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const star = new THREE.Sprite(starMaterial);
    star.scale.set(1.1, 1.1, 1.1);

    // Set random positions for stars away from the center of the scene
    const x = (Math.random() - 0.5) * 2 * maxDistance;
    const y = (Math.random() - 0.5) * 2 * maxDistance;
    const z = (Math.random() - 0.5) * 2 * maxDistance;

    star.position.set(x, y, z);

    stars.add(star);
  }

  return stars;
}

export function createClouds() {
  noise.seed(1);

  // Loads a texture for the clouds
  const textureLoader = new THREE.TextureLoader();
  const cloudTexture = textureLoader.load("images/cloudBillboard.png");

  // Creates the main group for all clouds
  const clouds = new THREE.Group();

  // Number of potential cloud positions
  const numberOfCloudPositions = 2000;
  let scale = 1.0; // init

  // Threshold for cloud spawning based on noise
  const cloudSpawnThreshold = 0.05; // Adjust this as needed

  // Add clouds based on noise threshold
  for (let i = 0; i < numberOfCloudPositions; i++) {
    const theta = Math.PI * Math.random();
    const phi = 2 * Math.PI * Math.random();

    const offset = 5.0; // Create different clouds with offset
    let noiseValue = noise.perlin2(theta + offset, phi + offset);

    // Only create a cloud if the noise value exceeds the threshold
    if (noiseValue > cloudSpawnThreshold) {
      const cloudMaterial = new THREE.SpriteMaterial({
        map: cloudTexture,
        color: 0xffffff,
        transparent: true,
        opacity: Math.random() * 0.7,
      });

      const cloud = new THREE.Sprite(cloudMaterial);

      scale = Math.random() * 0.1 + 0.2;
      cloud.scale.set(scale, scale, scale);

      // Convert spherical coordinates to Cartesian coordinates
      const radius = 1.1 + Math.random() * 0.1;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      cloud.position.set(x, y, z);

      // Add the cloud to the main clouds group
      clouds.add(cloud);
    }
  }

  return clouds;
}
