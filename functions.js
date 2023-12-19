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

export function createPlanet() {
  const vertexShader = /*glsl*/ `
    
  varying vec3 vNormal;
  uniform float terrainHeight;
  uniform float terrainFreq;

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
    
  void main() {
    vNormal = normal;

    // Simple planet-like displacement
    float displacement = noise(position * terrainFreq) * terrainHeight;
    vec3 modifiedPosition = position + normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(modifiedPosition, 1.0);
  }`;

  const fragmentShader = /*glsl*/ `
    varying vec3 vNormal;

    void main() {
        // Simple lighting effect
        vec3 light = vec3(1.0, 1.0, 1.0); // light direction
        float brightness = dot(normalize(vNormal), light);
        gl_FragColor = vec4(brightness, brightness, brightness, 1.0);
    }`;

  let terrainHeightVal = 0.2;
  let terrianFreqVal = 5.0;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      terrainHeight: { value: terrainHeightVal },
      terrainFreq: { value: terrianFreqVal },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  const geometry = new THREE.SphereGeometry(1, 128, 128);
  const planet = new THREE.Mesh(geometry, material);

  return planet;
}

export function setupGUI(material) {
  const gui = new dat.GUI();
  const controlsFolder = gui.addFolder("Controls");

  let terrainHeightVal = 0.5;
  let terrainFreqVal = 5.0;

  controlsFolder
    .add({ terrainHeight: terrainHeightVal }, "terrainHeight", 0, 2)
    .name("Terrain Height")
    .onChange((value) => {
      material.uniforms.terrainHeight.value = value;
    });

  controlsFolder
    .add({ terrainFreq: terrainFreqVal }, "terrainFreq", 0, 10)
    .name("Terrain Frequency")
    .onChange((value) => {
      material.uniforms.terrainFreq.value = value;
    });

  controlsFolder.open();
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
