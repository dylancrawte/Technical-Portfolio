import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Computer } from "./components/Computer";
import { createTextTexture, resetTypewriter, isTypingComplete } from "./components/Text";
import {
  createLoadingTexture,
  resetLoading,
  isLoadingComplete,
} from "./components/LoadingBar";
import { vertexShader, fragmentShader } from "./components/BackgroundShader";
import "./style.css";

// ------------------------------ Scene setup ------------------------------
const scene = new THREE.Scene();

// animated background
const uniforms = {
  time: { value: 0 },
};

const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
const backgroundMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
  depthWrite: false,
});

const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
const backgroundScene = new THREE.Scene();
backgroundScene.add(backgroundMesh);

// ------------------------------ Renderer setup ------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.autoClear = false; // Important for rendering background
document.body.appendChild(renderer.domElement);

// Track mobile/desktop up front so we can configure layout/controls
let isMobile = window.innerWidth < 768;

// ------------------------------ Camera and controls  ------------------------------
const camera = new THREE.PerspectiveCamera(
  65, // Slightly wider FOV for better framing
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = true;
controls.minPolarAngle = Math.PI / 4; // Limit rotation
controls.maxPolarAngle = Math.PI / 2; // Limit rotation

camera.position.set(0, 1.5, 3);
controls.target.set(0, 1.2, 0);
controls.update();

// ------------------------------ Scroll animation  ------------------------------
// Track mobile/desktop responsively instead of once at load
// Start zooming from the camera's initial position
const ZOOM_START = camera.position.z;
let ZOOM_MID = isMobile ? 4 : 3;
let ZOOM_MID2 = isMobile ? 6 : 5;
let ZOOM_END = isMobile ? 10 : 8;

let SCROLL_START = 0; // Start zooming immediately on scroll
let SCROLL_MID = window.innerHeight * 0;
let SCROLL_MID2 = window.innerHeight * 2.2;
let SCROLL_END = window.innerHeight * 3.0;

// Helper to recompute responsive values on load + resize
function updateResponsiveSettings() {
  isMobile = window.innerWidth < 768;

  ZOOM_MID = isMobile ? 4 : 3;
  ZOOM_MID2 = isMobile ? 6 : 5;
  ZOOM_END = isMobile ? 10 : 8;

  SCROLL_START = 0;
  SCROLL_MID = window.innerHeight * 0;
  SCROLL_MID2 = window.innerHeight * 2.2;
  SCROLL_END = window.innerHeight * 3.0;
}

// Initialise once
updateResponsiveSettings();

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const aboutSection = document.querySelector(".about");
  const aboutPos = aboutSection.getBoundingClientRect();

  // Only run scroll‑driven zoom on non‑mobile
  if (!isMobile && scrollY > SCROLL_START) {
    let currentZoom;

    //multiple zoom stages
    if (scrollY <= SCROLL_MID) {
      // First phase of zoom (START to MID)
      const progress = (scrollY - SCROLL_START) / (SCROLL_MID - SCROLL_START);
      currentZoom = ZOOM_START + (ZOOM_MID - ZOOM_START) * progress;
      console.log("Scroll phase 1");
    } else if (scrollY <= SCROLL_MID2) {
      // Second phase of zoom (MID to MID2)
      const progress = (scrollY - SCROLL_MID) / (SCROLL_MID2 - SCROLL_MID);
      currentZoom = ZOOM_MID + (ZOOM_MID2 - ZOOM_MID) * progress;
      console.log("Scroll phase 2");
    } else if (scrollY <= SCROLL_END) {
      // Final phase of zoom (MID2 to END)
      const progress = (scrollY - SCROLL_MID2) / (SCROLL_END - SCROLL_MID2);
      currentZoom = ZOOM_MID2 + (ZOOM_END - ZOOM_MID2) * progress;
      console.log("Scroll phase 3");
    } else {
      currentZoom = ZOOM_END;
    }

    // Update camera position
    camera.position.z = currentZoom;
    camera.position.y = 1.5 + (currentZoom - ZOOM_START) * 0.1; // Slight upward tilt
  }

  // -- blur effect  --
  const canvas = renderer.domElement;
  const maxBlur = 15; // Reduced max blur for better visibility
  const maxOpacity = 1;

  // if about section top is entering view ...
  if (aboutPos.top < window.innerHeight) {
    const visibleAmount =
      (window.innerHeight - aboutPos.top) / window.innerHeight;

    const blurStart = 0.1; // Start when 10% of about section is visible
    const blurEnd = 0.6; // Full blur when 60% is visible

    const blurProgress = Math.max(
      0,
      Math.min(1, (visibleAmount - blurStart) / (blurEnd - blurStart))
    );

    // ... apply blur and fade effect
    canvas.style.filter = `blur(${blurProgress * maxBlur}px)`;
    canvas.style.opacity = Math.max(maxOpacity - blurProgress * 0.8, 0.2); // Keep some visibility

    // Only hide canvas when almost completely overlapped
    if (blurProgress > 0.95) {
      canvas.style.visibility = "hidden";
    } else {
      canvas.style.visibility = "visible";
    }
  } else {
    // Reset effects when about section is not visible
    canvas.style.filter = "none";
    canvas.style.opacity = maxOpacity;
    canvas.style.visibility = "visible";
  }

  // Ensure camera always looks at target
  camera.lookAt(0, 1.2, 0);
});

// ------------------------------ Intersection observer ------------------------------
//watches for element entering view
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -10% 0px", // Reduced from -20% to trigger earlier
  }
);

// Observe the about section itself and its contents
const aboutSection = document.querySelector(".about");
observer.observe(aboutSection);
document.querySelectorAll(".about h1, .about p").forEach((el) => {
  observer.observe(el);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 2, 3);
scene.add(pointLight);

// ------------------------------ Retro computer ------------------------------
const computer = new Computer();

const computerGroup = new THREE.Group();
computerGroup.add(computer.getGroup());

scene.add(computerGroup);

// Helper to lay out computer + camera nicely per device/orientation
function applyLayoutForDevice() {
  if (isMobile) {
    computerGroup.scale.setScalar(0.7);
    camera.position.z = 3.5;
    camera.position.y = 1.6;
    controls.target.set(0, 1.3, 0);
  } else {
    computerGroup.scale.setScalar(1.0);
    camera.position.z = 3;
    camera.position.y = 1.5;
    controls.target.set(0, 1.2, 0);
  }
  controls.update();
}

// Apply initial layout based on current viewport
applyLayoutForDevice();

// Reset animations
resetLoading();
resetTypewriter();

let isLoading = true;

// ------------------------------ Animation loop ------------------------------
function animate() {
  requestAnimationFrame(animate);

  // for mouse controls
  controls.update();

  // speed of animation
  uniforms.time.value += 0.1;

  // Rendering
  renderer.clear();
  renderer.render(backgroundScene, backgroundCamera);
  renderer.render(scene, camera);

  // if isLoading, show loading bar...
  if (isLoading) {
    computer.updateScreenTexture(
      createLoadingTexture({
        width: 2048,
        height: 1536,
        fontSize: 96,
      })
    );

    // Check if loading is complete
    if (isLoadingComplete()) {
      isLoading = false;
      resetTypewriter();
    }
  } else {
    // ... else, show typing animation
    computer.updateScreenTexture(
      createTextTexture({
        width: 2048,
        height: 1536,
        fontSize: 96,
      })
    );
    // When typing is complete, show site title overlay
    const siteTitle = document.getElementById("site-title");
    if (siteTitle && isTypingComplete()) {
      siteTitle.classList.add("visible");
    }
  }
}

// ------------------------------ Window resize ------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update responsive flags + scroll / zoom values
  updateResponsiveSettings();

  // Re-apply layout for updated device/orientation
  applyLayoutForDevice();
});

animate();
