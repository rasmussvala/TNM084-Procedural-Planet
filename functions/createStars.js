import * as THREE from "three";

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
