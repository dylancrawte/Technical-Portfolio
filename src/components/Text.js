// components/Text.js
import * as THREE from "three";

let currentText = "";
let targetText =
"[Loading...]\n\nWelcome.\n\n→ Initialising portfolio\n→ Loading product history\n→ Verifying system outputs\n\nEnvironment ready.\nScroll to continue...";
let lastUpdateTime = 0;
// Use a slightly faster speed on mobile so the intro feels snappier.
const isMobile =
  typeof window !== "undefined" && window.innerWidth < 768;
const typingSpeed = isMobile ? 3 : 6; // ms between characters (faster)
const ellipsisPause = isMobile ? 80 : 150; // Pause duration for ellipsis in ms (faster)

// Find positions of first and last ellipses
const firstEllipsisIndex = targetText.indexOf("...");
const lastEllipsisIndex = targetText.lastIndexOf("...");

export function createTextTexture(options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = options.width || 1024;
  canvas.height = options.height || 768;

  const ctx = canvas.getContext("2d");

  // === Background ===
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // === Text Style ===
  const terminalGreen = "#4AF626"; // Bright terminal green
  ctx.fillStyle = terminalGreen;
  ctx.font = `bold ${options.fontSize || 48}px "VT323", monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Text glow effect
  ctx.shadowColor = terminalGreen;
  ctx.shadowBlur = 1;
  ctx.shadowOffsetX = 0.5;
  ctx.shadowOffsetY = 0.5;

  // Text position
  const margin = 50;
  const x = margin;
  const y = canvas.height / 14;

  // Update current text based on timing
  const currentTime = Date.now();

  // Check if we're at an ellipsis in first or last position
  const nextChar = targetText[currentText.length];
  const isAtDot = nextChar === ".";
  const isPreviousDot =
    currentText.length > 0 && targetText[currentText.length - 1] === ".";
  const isInEllipsis = isAtDot && isPreviousDot;
  const currentPosition = currentText.length;

  // Only pause for first and last ellipses
  const isFirstEllipsis =
    isInEllipsis &&
    (currentPosition === firstEllipsisIndex + 2 ||
      currentPosition === firstEllipsisIndex + 1);
  const isLastEllipsis =
    isInEllipsis &&
    (currentPosition === lastEllipsisIndex + 2 ||
      currentPosition === lastEllipsisIndex + 1);

  // Use longer delay if we're in first or last ellipsis, normal speed otherwise
  const currentDelay =
    isFirstEllipsis || isLastEllipsis ? ellipsisPause : typingSpeed;

  if (currentTime - lastUpdateTime > currentDelay) {
    if (currentText.length < targetText.length) {
      currentText = targetText.slice(0, currentText.length + 1);
      lastUpdateTime = currentTime;
    }
  }

  // Draw text with blinking cursor
  const cursorText = currentText + (currentTime % 1000 < 500 ? "_" : "");
  const lines = cursorText.split("\n");

  // Draw text with glow effect
  lines.forEach((line, index) => {
    const lineY = y + index * (options.fontSize || 48) * 1.5;
    ctx.fillText(line, x, lineY);
  });

  // Reset for cursor
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 3;

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

export function resetTypewriter() {
  currentText = "";
  lastUpdateTime = 0;
}

export function isTypingComplete() {
  return currentText.length >= targetText.length;
}
