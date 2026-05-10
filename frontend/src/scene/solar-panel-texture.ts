import * as THREE from "three";

export function createSolarPanelTexture() {
  const width = 512;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create solar panel texture canvas");
  }

  const bodyGrad = ctx.createLinearGradient(0, 0, width, height);
  bodyGrad.addColorStop(0, "#12285d");
  bodyGrad.addColorStop(0.5, "#0d1a3c");
  bodyGrad.addColorStop(1, "#081126");
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(0, 0, width, height);

  const frame = 12;
  const pad = frame + 6;
  const cellAreaW = width - pad * 2;
  const cellAreaH = height - pad * 2;
  const cols = 6;
  const rows = 10;
  const cellW = cellAreaW / cols;
  const cellH = cellAreaH / rows;
  const gap = 2;

  const frameGrad = ctx.createLinearGradient(0, 0, width, width);
  frameGrad.addColorStop(0, "#c8d0d8");
  frameGrad.addColorStop(0.38, "#7f8b98");
  frameGrad.addColorStop(0.7, "#e4e8ec");
  frameGrad.addColorStop(1, "#6f7984");
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = frame;
  ctx.strokeRect(frame / 2, frame / 2, width - frame, height - frame);

  ctx.fillStyle = "#061026";
  ctx.fillRect(frame, frame, width - frame * 2, height - frame * 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = pad + col * cellW + gap;
      const y = pad + row * cellH + gap;
      const w = cellW - gap * 2;
      const h = cellH - gap * 2;

      const cellGrad = ctx.createLinearGradient(x, y, x + w, y + h);
      cellGrad.addColorStop(0, "#173477");
      cellGrad.addColorStop(0.28, "#0f2458");
      cellGrad.addColorStop(0.68, "#0b1a43");
      cellGrad.addColorStop(1, "#071128");
      ctx.fillStyle = cellGrad;
      ctx.fillRect(x, y, w, h);

      const glare = ctx.createLinearGradient(x, y, x + w, y);
      glare.addColorStop(0, "rgba(255,255,255,0.08)");
      glare.addColorStop(0.16, "rgba(255,255,255,0.02)");
      glare.addColorStop(0.52, "rgba(98,178,255,0.08)");
      glare.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glare;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = "rgba(2, 8, 24, 0.9)";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x, y, w, h);
    }
  }

  ctx.strokeStyle = "rgba(214, 225, 236, 0.42)";
  ctx.lineWidth = 1.15;
  for (let col = 0; col < cols; col++) {
    const x = pad + col * cellW;
    for (let bar = 1; bar <= 3; bar++) {
      const bx = x + (bar * cellW) / 4;
      ctx.beginPath();
      ctx.moveTo(bx, pad + 1);
      ctx.lineTo(bx, height - pad - 1);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = "rgba(186, 205, 226, 0.16)";
  ctx.lineWidth = 0.55;
  for (let row = 0; row < rows; row++) {
    const y = pad + row * cellH;
    for (let finger = 1; finger < 8; finger++) {
      const fy = y + (finger * cellH) / 8;
      ctx.beginPath();
      ctx.moveTo(pad + 2, fy);
      ctx.lineTo(width - pad - 2, fy);
      ctx.stroke();
    }
  }

  const reflection = ctx.createLinearGradient(54, 0, width - 72, height);
  reflection.addColorStop(0, "rgba(255,255,255,0)");
  reflection.addColorStop(0.42, "rgba(255,255,255,0.13)");
  reflection.addColorStop(0.48, "rgba(255,255,255,0.05)");
  reflection.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = reflection;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}
