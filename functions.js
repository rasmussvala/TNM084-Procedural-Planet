import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import dat from "dat.gui";

// Central Configuration Object
const planetConfig = {
  phong: {
    Ka: 0.05,
    Kd: 0.7,
    Ks: 0.3,
    shininess: 50.0,
    ambientColor: new THREE.Color(0.7, 0.3, 0.0),
    diffuseColor: new THREE.Color(0.7, 0.3, 0.0),
    specularColor: new THREE.Color(1.0, 1.0, 1.0),
  },
  fbm: {
    octaves: 5.0,
    lacunarity: 3.0,
    frequency: 0.9,
    amplitude: 0.2,
    depthGain: 0.4,
  },
  layers: {
    layer1Threshold: 0.8,
    layer2Threshold: 0.7,
    layer3Threshold: 0.6,
    maxPlanetRadius: 3.0,
    layer1Color: new THREE.Color(1.0, 0.0, 0.0),
    layer2Color: new THREE.Color(0.0, 1.0, 0.0),
    layer3Color: new THREE.Color(0.0, 0.0, 1.0),
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

    vec3 offset = vec3(1.0, 1.0, 1.0);
    float height = 1.0;
    float localAmplitude = amplitude;
    float localFrequency = frequency;
    
    for (int i = 0; i < octaves; i++) {
        height += noise(st * localFrequency + offset) * localAmplitude;
        localAmplitude *= depthGain;
        localFrequency *= lacunarity;
    }

    return height;
  }

  void main() {
    // Shader uses Triangle method to calculate normals
    vec3 p = position;

    // Calculate nearby points for the normal
    vec3 pN = normalize(normalMatrix * normal); // normalize(p);

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
  uniform float maxPlanetRadius;
  
  // Define colors for different layers
  uniform vec3 layer1Color; 
  uniform vec3 layer2Color; 
  uniform vec3 layer3Color; 

  vec3 layerColor() {
    
    float distanceToCore = length(vec3(0.0, 0.0, 0.0) - vPosition);

    // Normalize the distance to be between 0 and 1
    float normalizedDistance = distanceToCore / maxPlanetRadius;

    // Determine the blend factors based on distance for each layer
    float layer1Factor = smoothstep(layer2Threshold, layer1Threshold, normalizedDistance);
    float layer2Factor = smoothstep(layer3Threshold, layer2Threshold, normalizedDistance);
    float layer3Factor = smoothstep(0.0, layer3Threshold, normalizedDistance);   

    // Interpolate between different layers based on distance
    vec3 finalColor = mix(layer3Color, layer2Color, layer3Factor);
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
      maxPlanetRadius: { value: planetConfig.layers.maxPlanetRadius },
      layer1Color: { value: planetConfig.layers.layer1Color },
      layer2Color: { value: planetConfig.layers.layer2Color },
      layer3Color: { value: planetConfig.layers.layer3Color },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  const geometry = new THREE.SphereGeometry(1, 512, 512);
  const planet = new THREE.Mesh(geometry, material);

  return planet;
}

export function setupGUI(material) {
  const gui = new dat.GUI();
  const phongFolder = gui.addFolder("Phong Illumination");
  const terrainFolder = gui.addFolder("Terrain Parameters");
  const layersFolder = gui.addFolder("Layer Controls");

  phongFolder
    .add(planetConfig.phong, "Ka", 0, 1.0)
    .name("Ka")
    .onChange((value) => {
      material.uniforms.Ka.value = value;
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
    .add(planetConfig.layers, "layer2Threshold", 0, 1.0)
    .name("Threshold 1")
    .onChange((value) => {
      material.uniforms.layer2Threshold.value = value;
      planetConfig.layers.layer2Threshold = value; // Update config
    });

  layersFolder
    .add(planetConfig.layers, "layer3Threshold", 0, 1.0)
    .name("Threshold 2")
    .onChange((value) => {
      material.uniforms.layer3Threshold.value = value;
      planetConfig.layers.layer3Threshold = value; // Update config
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


  phongFolder.open();
  terrainFolder.open();
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
  // Loads a texture for the clouds
  const textureLoader = new THREE.TextureLoader();
  const cloudTexture = textureLoader.load("images/starBillboard.png");

  // Creates the main group for all clouds
  const clouds = new THREE.Group();

  // Number of clouds and sets
  const numberOfClouds = 100;
  const cloudsPerSet = 10;
  const numberOfSets = numberOfClouds / cloudsPerSet;

  const cloudGeometry = new THREE.SphereGeometry(1, 16, 16); // Adjust the resolution as needed

  // Create groups for each set of clouds
  for (let setIndex = 0; setIndex < numberOfSets; setIndex++) {
    const cloudSet = new THREE.Group();

    // Add clouds to the set
    for (let i = 0; i < cloudsPerSet; i++) {
      const cloudMaterial = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.scale.set(0.1, 0.1, 0.1);

      // Set random positions for clouds within the set
      const theta = (20 * Math.PI * i * Math.random()) / cloudsPerSet;
      const phi = Math.acos(2 * Math.random() - 1);

      // Convert spherical coordinates to Cartesian coordinates
      const radius = 1; // Adjust the radius for individual clouds within the set
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      cloud.position.set(x, y, z);

      cloudSet.add(cloud);
    }

    // Add the set to the main clouds group
    clouds.add(cloudSet);
  }

  return clouds;
}