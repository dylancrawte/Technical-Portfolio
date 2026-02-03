import * as THREE from "three";

export class Computer {
  constructor() {
    this.group = new THREE.Group(); //container
    this.screen = null;

    // different materials for computer and screen
    this.plasticMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      specular: 0x222222,
      shininess: 30,
    });

    this.screenMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      specular: 0x222222,
      shininess: 50,
    });

    this.createMonitor();
  }

  //util
  createRoundedBoxGeometry(width, height, depth, radius, segments = 4) {
    const shape = new THREE.Shape();
    const w = width / 2;
    const h = height / 2;
    const r = radius;

    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);

    const extrudeSettings = {
      steps: 1,
      depth: depth,
      bevelEnabled: true,
      bevelThickness: radius,
      bevelSize: radius,
      bevelSegments: segments,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  createMonitor() {
    const monitorBody = new THREE.Group();

    // monitor base
    const baseGeometry = this.createRoundedBoxGeometry(3.2, 1.6, 0.2, 0.1, 6);
    const base = new THREE.Mesh(baseGeometry, this.plasticMaterial);
    base.rotation.x = Math.PI / 2; // Rotate to lay flat
    base.position.y = -0.1;
    monitorBody.add(base);

    // monitor neck
    const neckGeometry = this.createRoundedBoxGeometry(0.4, 0.4, 0.4, 0.05, 4);
    const neck = new THREE.Mesh(neckGeometry, this.plasticMaterial);
    neck.position.y = 0.2;
    monitorBody.add(neck);

    // monitor head
    const monitorGeometry = this.createRoundedBoxGeometry(
      3.0,
      2.0,
      1.0,
      0.15,
      8
    );
    const monitor = new THREE.Mesh(monitorGeometry, this.plasticMaterial);
    monitor.position.y = 1.3;
    monitor.position.z = -0.5; // Center the depth
    monitor.rotation.x = -0.1; // Slight tilt
    monitorBody.add(monitor);

    // Create curved screen frame with rounded corners
    const frameShape = new THREE.Shape();
    const frameRadius = 0.5; // Radius for frame corners

    // Top left corner
    frameShape.moveTo(-1.2, -0.8);
    frameShape.quadraticCurveTo(
      -1.2,
      -0.8 + frameRadius,
      -1.2,
      -0.8 + frameRadius
    );
    // Left side
    frameShape.lineTo(-1.2, 0.8 - frameRadius);
    // Top edge
    frameShape.lineTo(1.2 - frameRadius, 0.8);
    // Top right corner
    frameShape.quadraticCurveTo(1.2, 0.8, 1.2, 0.8 - frameRadius);
    // Right side
    frameShape.lineTo(1.2, -0.8 + frameRadius);
    // Bottom right corner
    frameShape.quadraticCurveTo(1.2, -0.8, 1.2 - frameRadius, -0.8);
    // Bottom edge
    frameShape.lineTo(-1.2 + frameRadius, -0.8);
    // Bottom left corner
    frameShape.quadraticCurveTo(-1.2, -0.8, -1.2, -0.8 + frameRadius);

    const frameExtrudeSettings = {
      steps: 1,
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 5,
    };

    const frameGeometry = new THREE.ExtrudeGeometry(
      frameShape,
      frameExtrudeSettings
    );
    // Center of monitor head front face (head at y=1.3, tilt -0.1: front face center ≈ y=1.35)
    const screenCenterY = 1.35;

    const frame = new THREE.Mesh(frameGeometry, this.screenMaterial);
    frame.position.set(0, screenCenterY, 0.45);
    frame.rotation.x = -0.1; // Match monitor tilt
    monitorBody.add(frame);

    // Create screen (black display) — centered in monitor, in front of frame
    const screenGeometry = new THREE.PlaneGeometry(2.2, 1.4);
    const screenMaterial = new THREE.MeshBasicMaterial({
      map: null,
      color: 0xffffff, // Set to white to show texture colors
      transparent: true,
      opacity: 1,
    });

    this.screen = new THREE.Mesh(screenGeometry, screenMaterial);
    this.screen.position.set(0, screenCenterY, 0.7);
    this.screen.rotation.x = -0.1; // Match monitor tilt
    monitorBody.add(this.screen);

    this.group.add(monitorBody);
  }

  getGroup() {
    return this.group;
  }

  getScreen() {
    return this.screen;
  }

  updateScreenTexture(texture) {
    if (this.screen && texture) {
      this.screen.material.map = texture;
      this.screen.material.needsUpdate = true;
    }
  }
}
