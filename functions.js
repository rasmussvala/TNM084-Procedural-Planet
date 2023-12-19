import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import dat from "dat.gui";

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
    int octaves = 10;
    float lancunarity = 2.0;
    float frequency = 1.0;
    vec3 offset = vec3(1.0, 1.0, 1.0);
    float amplitude = 0.3;
    float depthGain = 0.3;
    float height = 1.0;

    for(int i = 0; i < octaves; i++){
      height += noise(st * frequency + offset) * amplitude;
      amplitude *= depthGain;
      frequency *= lancunarity;
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

  // Camera Position
  uniform float cameraPositionX; 
  uniform float cameraPositionY; 
  uniform float cameraPositionZ; 

  vec4 phongShading() {
    float Ka = 0.1;   // Ambient reflection coefficient
    float Kd = 0.5;   // Diffuse reflection coefficient
    float Ks = 1.0;   // Specular reflection coefficient
    float shininessValue = 80.0; // Shininess

    // Material color
    vec3 ambientColor = vec3(1.0, 1.0, 1.0);
    vec3 diffuseColor = vec3(1.0, 1.0, 1.0);
    vec3 specularColor = vec3(1.0, 1.0, 1.0);
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
      specular = pow(specularAngle, shininessValue);
    }

    return vec4(Ka * ambientColor +
                Kd * lambertian * diffuseColor +
                Ks * specular * specularColor, 1.0);
  }
  
  void main() {

    vec3 cameraPosition = vec3(cameraPositionX, cameraPositionY, cameraPositionZ);
    
    gl_FragColor = phongShading();
  
  }`;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      cameraPositionX: { value: camera.position.x },
      cameraPositionY: { value: camera.position.y },
      cameraPositionZ: { value: camera.position.z },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  const geometry = new THREE.SphereGeometry(1, 256, 256);
  const planet = new THREE.Mesh(geometry, material);

  return planet;
}

// export function setupGUI(material) {
//   const gui = new dat.GUI();
//   const controlsFolder = gui.addFolder("Controls");

//   let terrainHeightVal = 0.5;
//   let terrainFreqVal = 5.0;

//   controlsFolder
//     .add({ terrainHeight: terrainHeightVal }, "terrainHeight", 0, 2)
//     .name("Terrain Height")
//     .onChange((value) => {
//       material.uniforms.terrainHeight.value = value;
//     });

//   controlsFolder
//     .add({ terrainFreq: terrainFreqVal }, "terrainFreq", 0, 10)
//     .name("Terrain Frequency")
//     .onChange((value) => {
//       material.uniforms.terrainFreq.value = value;
//     });

//   controlsFolder.open();
// }

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

export function updateSpecularReflection(planet, camera) {
  // Copy the value of camera to shader
  planet.material.uniforms.cameraPositionX.value = camera.position.x;
  planet.material.uniforms.cameraPositionY.value = camera.position.y;
  planet.material.uniforms.cameraPositionZ.value = camera.position.z;
}
