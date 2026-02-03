import * as THREE from "three";

export class Keyboard {
  constructor() {
    this.group = new THREE.Group();

    // Materials
    this.plasticMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      specular: 0x222222,
      shininess: 30,
    });

    
    this.keyMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x999999,
      shininess: 100,
    });

    this.createKeyboard();
  }

  createKey(x, z) {
    const keyGeometry = new THREE.BoxGeometry(0.08, 0.05, 0.08);
    const key = new THREE.Mesh(keyGeometry, this.keyMaterial);
    key.position.set(x, 0, z + 1.3); // Adjusted to match base position
    return key;
  }

  createKeyboard() {
    // Main Keyboard Body
    const keyboardBaseGeometry = new THREE.BoxGeometry(2.2, 0.15, 0.8);
    const keyboardBase = new THREE.Mesh(
      keyboardBaseGeometry,
      this.plasticMaterial
    );
    keyboardBase.position.set(0, -0.1, 1.3);
    this.group.add(keyboardBase);

    // Add keyboard keys in a grid
    for (let i = -10; i <= 10; i++) {
      for (let j = -4; j <= 4; j++) {
        const key = this.createKey(i * 0.1, j * 0.08);
        this.group.add(key);
      }
    }
  }

  getGroup() {
    return this.group;
  }
}
