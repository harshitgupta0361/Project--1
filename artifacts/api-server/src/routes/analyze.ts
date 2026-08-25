import { Router, type IRouter } from "express";
import multer from "multer";
import sharp from "sharp";

const router: IRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

type Detection = {
  id: string;
  class: string;
  confidence: number;
  artificiality_score: number;
  bounding_box: { x: number; y: number; width: number; height: number };
  evidence: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character] ?? character);
}

async function detectSonarAnomalies(buffer: Buffer) {
  const source = sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1000, fit: "inside", withoutEnlargement: true });

  const processed = await source.clone()
    .grayscale()
    .normalize()
    .blur(1)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = processed;
  const pixelCount = info.width * info.height;
  let sum = 0;
  for (const value of data) sum += value;
  const mean = sum / pixelCount;
  let variance = 0;
  for (const value of data) variance += (value - mean) ** 2;
  const deviation = Math.sqrt(variance / pixelCount);
  const threshold = clamp(mean + Math.max(16, deviation * 0.9), 120, 232);
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const candidates: Array<{
    x: number; y: number; width: number; height: number; area: number; contrast: number;
  }> = [];
  const directions = [-1, 0, 1];

  for (let start = 0; start < pixelCount; start += 1) {
    if (visited[start] || data[start] < threshold) continue;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    visited[start] = 1;
    let area = 0;
    let minX = info.width;
    let minY = info.height;
    let maxX = 0;
    let maxY = 0;
    let intensity = 0;

    while (head < tail) {
      const current = queue[head++];
      const x = current % info.width;
      const y = Math.floor(current / info.width);
      area += 1;
      intensity += data[current];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      for (const dy of directions) {
        for (const dx of directions) {
          if (dx === 0 && dy === 0) continue;
          const nextX = x + dx;
          const nextY = y + dy;
          if (nextX < 1 || nextY < 1 || nextX >= info.width - 1 || nextY >= info.height - 1) continue;
          const next = nextY * info.width + nextX;
          if (!visited[next] && data[next] >= threshold) {
            visited[next] = 1;
            queue[tail++] = next;
          }
        }
      }
    }

    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;
    const minArea = Math.max(24, pixelCount * 0.00012);
    if (area >= minArea && area <= pixelCount * 0.3 && boxWidth >= 8 && boxHeight >= 8) {
      candidates.push({
        x: minX,
        y: minY,
        width: boxWidth,
        height: boxHeight,
        area,
        contrast: intensity / area - mean,
      });
    }
  }

  candidates.sort((a, b) => (b.contrast * Math.sqrt(b.area)) - (a.contrast * Math.sqrt(a.area)));
  const detections: Detection[] = candidates.slice(0, 3).map((candidate, index) => {
    const fillRatio = candidate.area / (candidate.width * candidate.height);
    const contrastScore = clamp(candidate.contrast / 100, 0, 1);
    const confidence = Math.round(clamp(48 + contrastScore * 42 + Math.min(fillRatio, 0.8) * 14, 0, 99));
    const artificiality = Math.round(clamp(35 + contrastScore * 45 + (1 - Math.abs(fillRatio - 0.45)) * 20, 0, 99));
    const evidence = [
      `Local contrast +${Math.round(candidate.contrast)} intensity`,
      `Connected region ${candidate.area.toLocaleString()} px`,
    ];
    if (fillRatio > 0.2 && fillRatio < 0.8) evidence.push("Object-like occupied area");
    if (candidate.width / candidate.height > 1.35 || candidate.height / candidate.width > 1.35) evidence.push("Directional structure");
    return {
      id: `CV-${String(index + 1).padStart(3, "0")}`,
      class: "Potential Marine Debris",
      confidence,
      artificiality_score: artificiality,
      bounding_box: {
        x: Math.round((candidate.x / info.width) * 10000) / 10000,
        y: Math.round((candidate.y / info.height) * 10000) / 10000,
        width: Math.round((candidate.width / info.width) * 10000) / 10000,
        height: Math.round((candidate.height / info.height) * 10000) / 10000,
      },
      evidence,
    };
  });

  const basePng = await source.clone().grayscale().normalize().png().toBuffer();
  const overlay = detections.length === 0 ? undefined : Buffer.from(`
    <svg width="${info.width}" height="${info.height}">
      ${detections.map((d) => {
        const box = d.bounding_box;
        const x = box.x * info.width;
        const y = box.y * info.height;
        const width = box.width * info.width;
        const height = box.height * info.height;
        return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="#29C9B7" stroke-width="4"/><rect x="${x}" y="${Math.max(0, y - 27)}" width="120" height="27" fill="#07121E"/><text x="${x + 8}" y="${Math.max(19, y - 8)}" fill="#29C9B7" font-family="monospace" font-size="14">${escapeXml(d.id)}</text>`;
      }).join("")}
    </svg>
  `);
  const annotated = await sharp(basePng)
    .composite(overlay ? [{ input: overlay }] : [])
    .png()
    .toBuffer();

  return {
    processed_image: `data:image/png;base64,${annotated.toString("base64")}`,
    detections,
    image: { width: info.width, height: info.height, mean: Math.round(mean), threshold: Math.round(threshold) },
  };
}

router.post("/analyze", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "An image file is required." });
    return;
  }

  try {
    res.json(await detectSonarAnomalies(req.file.buffer));
  } catch (error) {
    req.log.error({ err: error }, "Sonar image analysis failed");
    res.status(422).json({ error: "The image could not be decoded or processed." });
  }
});

export default router;