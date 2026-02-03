import * as THREE from "three";

let currentProgress = 0;
let targetProgress = 100;
let lastUpdateTime = 0;
// Make the loading feel faster on mobile so users aren't waiting as long.
const isMobile =
  typeof window !== "undefined" && window.innerWidth < 768;
const updateSpeed = isMobile ? 3 : 1; // ms between progress updates (faster)
const progressIncrement = isMobile ? 3 : 2; // how much progress to add each update (faster)

export function createLoadingTexture(options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = options.width || 1024;
  canvas.height = options.height || 768;
  const ctx = canvas.getContext("2d");

  // Clear background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text style
  ctx.fillStyle = "#ffdab3"; // Peachy color like in the image
  ctx.font = `${options.fontSize || 48}px VT323, monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Draw "Booting..." text
  const bootText = "Booting...";
  ctx.fillText(bootText, 50, canvas.height / 4);

  // Draw progress bar border (dotted style)
  const barWidth = canvas.width - 100;
  const barHeight = 40;
  const barX = 50;
  const barY = canvas.height / 3;

  // Draw dotted border
  ctx.strokeStyle = "#ffdab3";
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  // Draw progress bar fill
  const fillWidth = (barWidth * currentProgress) / 100;
  ctx.fillStyle = "#ffdab3";
  ctx.fillRect(barX, barY, fillWidth, barHeight);

  // Draw "Nearly There..." text when progress is past 75%
  if (currentProgress > 75) {
    ctx.fillText("Nearly There...", 50, barY + barHeight + 60);
  }

  // Update progress
  const currentTime = Date.now();
  if (currentTime - lastUpdateTime > updateSpeed) {
    if (currentProgress < targetProgress) {
      currentProgress += progressIncrement;
      lastUpdateTime = currentTime;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

export function resetLoading() {
  currentProgress = 0;
  lastUpdateTime = 0;
}

export function isLoadingComplete() {
  return currentProgress >= targetProgress;
}
