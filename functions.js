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
    specularColor: new THREE.Color(1.0, 0.5, 0.0),
  },
  fbm: {
    octaves: 5.0,
    lacunarity: 3.0,
    frequency: 0.9,
    amplitude: 0.2,
    depthGain: 0.4,
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
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
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

export function createPlanet(camera) {
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
    float deltaStep = 0.00001;
    vec3 pN = normalize(p);

    p = pN * fbm(pN);

    vec3 v1 = abs(dot(pN, vec3(1.0, 0.0, 0.0))) < 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);

    v1 = cross(pN, v1);
    vec3 p1 = pN + v1 * deltaStep;
    p1 = p1 * fbm(p1);

    vec3 v2 = cross(pN, v1);
    vec3 p2 = pN + v2 * deltaStep;
    p2 = p2 * fbm(p2);

    // Compute new normal
    vec3 newNormal = normalize(cross((p1 - p), (p2 - p)));

    // Pass the new normal to the fragment shader
    vNormal = newNormal;
    vPosition = pN;

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
                Kd * lambertian * diffuseColor +
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

  // Initial values when starting the program
  let KaVal = 0.05;
  let KdVal = 0.9;
  let KsVal = 0.5;
  let shininessVal = 50.0;

  let octavesVal = 5.0;
  let lacunarityVal = 2.5;
  let frequencyVal = 2.5;
  let amplitudeVal = 0.5;
  let depthGainVal = 0.5;

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
    .add(planetConfig.fbm, "amplitude", 0, 1.0)
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

  phongFolder.open();
  terrainFolder.open();
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
