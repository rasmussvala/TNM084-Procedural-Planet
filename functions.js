import * as THREE from "three";

export function createPhongMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: /*glsl*/ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalMatrix * normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    fragmentShader: /*glsl*/ `
        varying vec3 vNormal;
        void main() {
            // Direction to the light source (WIP: right now the light follows the camera)
          vec3 lightDirection = normalize(vec3(0.0, 0.0, 1.0)); 
          
          vec3 ambientColor = vec3(0.2, 0.2, 0.2); // Ambient light color
          vec3 objectColor = vec3(1.0, 0.0, 0.0); // Object color
          vec3 lightColor = vec3(1.0, 1.0, 1.0); // Light color

          float ambientStrength = 0.2; // Ambient light strength
          float diffuseStrength = 0.5; // Diffuse light strength
          float specularStrength = 0.5; // Specular light strength
          float shininess = 32.0; // Shininess factor

          // Math
          vec3 ambient = ambientStrength * ambientColor;
          vec3 norm = normalize(vNormal);
          vec3 lightDir = normalize(lightDirection);
          float diff = max(dot(norm, lightDir), 0.0);
          vec3 diffuse = diffuseStrength * diff * lightColor;
          vec3 viewDir = normalize(-vec3(gl_FragCoord));
          vec3 reflectDir = reflect(-lightDir, norm);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
          vec3 specular = specularStrength * spec * lightColor;
          vec3 result = (ambient + diffuse + specular) * objectColor;
          gl_FragColor = vec4(result, 1.0);
        }
      `,
  });
}

export function createStars() {

  // Create a geometry for the billboard (e.g., a plane)
  const starGeometry = new THREE.PlaneGeometry(1, 1);

  // Load a texture for the star
  const textureLoader = new THREE.TextureLoader();
  const starTexture = textureLoader.load('images/starBillboard.png');

  // Create billboards (stars)
  const numberOfStars = 1000; // Change this to the desired number of stars
  const stars = new THREE.Group();

  const maxDistance = 1000; // Set the maximum distance from the center

  for (let i = 0; i < numberOfStars; i++) {
    const starMaterial = new THREE.SpriteMaterial({
      map: starTexture,
      color: 0xffffff, // You can set a color if needed
      transparent: true,
      blending: THREE.AdditiveBlending // Adjust blending mode as desired
    });

    const star = new THREE.Sprite(starMaterial);
    star.scale.set(1, 1, 1); // Set the initial scale of the stars

    // Set random positions for stars away from the center of the scene
    const x = (Math.random() - 0.5) * 2 * maxDistance;
    const y = (Math.random() - 0.5) * 2 * maxDistance;
    const z = (Math.random() - 0.5) * 2 * maxDistance;

    star.position.set(x, y, z);

    // Add the star to the group
    stars.add(star);
  }

  return stars;
}
