const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const GENERATED = path.join(ROOT, "assets/generated");
const OUT = path.join(ROOT, "proposal");

const W = 1000;
const H = 1500;
const FONT =
  "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans CJK KR', Arial, sans-serif";

const C = {
  ink: "#1f2421",
  muted: "#5f665f",
  white: "#ffffff",
  ivory: "#fbf8f2",
  paper: "#fffdf9",
  sage: "#3d4d43",
  clay: "#9a735f",
  line: "#ded5c8",
  gold: "#a17b3d",
  dark: "#1e211d",
};

const CUTS = [
  {
    file: "01-hero.webp",
    source: "01-hero-raw.png",
    position: "center",
    overlay: "hero",
    prompt_block: "Block 01 Hero",
  },
  {
    file: "02-problem.webp",
    source: "02-problem-raw.png",
    position: "center",
    overlay: "problem",
    prompt_block: "Block 02 Problem",
  },
  {
    file: "03-agitation.webp",
    source: "03-agitation-raw.png",
    position: "center",
    overlay: "agitation",
    prompt_block: "Block 03 Agitation",
  },
  {
    file: "04-solution.webp",
    source: "04-solution-raw.png",
    position: "center",
    overlay: "solution",
    prompt_block: "Block 04 Solution",
  },
  {
    file: "05-height.webp",
    source: "05-height-raw.png",
    position: "center",
    overlay: "height",
    prompt_block: "Block 05 Height",
  },
  {
    file: "06-structure.webp",
    source: "06-structure-raw.png",
    position: "center",
    overlay: "structure",
    prompt_block: "Block 06 Structure",
  },
  {
    file: "07-authority.webp",
    source: "07-authority-raw.png",
    position: "center",
    overlay: "authority",
    prompt_block: "Block 07 Authority",
  },
  {
    file: "08-guide.webp",
    source: "08-guide-raw.png",
    position: "center",
    overlay: "guide",
    prompt_block: "Block 08 Guide",
  },
  {
    file: "09-persona.webp",
    source: "09-persona-raw.png",
    position: "center",
    overlay: "persona",
    prompt_block: "Block 09 Persona",
  },
  {
    file: "10-final.webp",
    source: "10-final-raw.png",
    position: "center",
    overlay: "final",
    prompt_block: "Block 10 Final",
  },
];

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(text, max) {
  if (Array.isArray(text)) return text;
  const source = String(text);
  const tokens = source.split(/(\s+)/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const token of tokens) {
    const compactToken = token.trim();
    if (!compactToken) continue;
    const next = line ? `${line} ${compactToken}` : compactToken;
    if (next.length > max && line) {
      lines.push(line);
      line = compactToken;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function text({
  x,
  y,
  value,
  size = 40,
  weight = 700,
  color = C.ink,
  max = 18,
  lh = 1.25,
  anchor = "start",
  opacity = 1,
}) {
  const lines = Array.isArray(value) ? value : wrap(value, max);
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" opacity="${opacity}" letter-spacing="0">${lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : size * lh;
      return `<tspan x="${x}" dy="${i === 0 ? 0 : dy}">${esc(line)}</tspan>`;
    })
    .join("")}</text>`;
}

function rect({ x, y, w, h, fill, stroke = "none", rx = 0, opacity = 1 }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" opacity="${opacity}"/>`;
}

function pill({ x, y, value, fill = C.sage, color = C.white, w = 150 }) {
  return `${rect({ x, y, w, h: 42, rx: 21, fill })}
  ${text({ x: x + w / 2, y: y + 28, value: [value], size: 17, weight: 800, color, anchor: "middle" })}`;
}

function svg(content, bg = "none") {
  return Buffer.from(`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg !== "none" ? rect({ x: 0, y: 0, w: W, h: H, fill: bg }) : ""}
  ${content}
</svg>`);
}

function svgBox(width, height, content, bg = "none") {
  return Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${bg !== "none" ? rect({ x: 0, y: 0, w: width, h: height, fill: bg }) : ""}
  ${content}
</svg>`);
}

function gradient({ id, direction = "left", color = "#fff8ee", opacity = 0.95 }) {
  if (direction === "top") {
    return `<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/>
      <stop offset=".62" stop-color="${color}" stop-opacity=".62"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>`;
  }
  if (direction === "dark") {
    return `<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#171814" stop-opacity=".66"/>
      <stop offset=".45" stop-color="#171814" stop-opacity=".08"/>
      <stop offset="1" stop-color="#171814" stop-opacity=".62"/>
    </linearGradient>`;
  }
  return `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/>
    <stop offset=".62" stop-color="${color}" stop-opacity=".68"/>
    <stop offset="1" stop-color="${color}" stop-opacity="0"/>
  </linearGradient>`;
}

function benefitChip({ x, y, value, w = 240 }) {
  return `${rect({ x, y, w, h: 54, fill: "#ffffff", rx: 27, opacity: 0.92 })}
  ${text({ x: x + w / 2, y: y + 36, value: [value], size: 22, weight: 850, color: C.sage, anchor: "middle" })}`;
}

function smallCard({ x, y, title, body, w = 260, h = 150 }) {
  return `${rect({ x, y, w, h, fill: "#ffffff", rx: 20, opacity: 0.92, stroke: C.line })}
  ${text({ x: x + 24, y: y + 50, value: title, size: 25, weight: 900, color: C.sage, max: 14 })}
  ${text({ x: x + 24, y: y + 96, value: body, size: 18, weight: 700, color: C.muted, max: 13, lh: 1.35 })}`;
}

function overlayFor(type) {
  const overlays = {
    hero: `
      <defs>${gradient({ id: "heroFade", color: "#fff8ee" })}</defs>
      <rect x="0" y="0" width="720" height="680" fill="url(#heroFade)"/>
      ${pill({ x: 74, y: 84, value: "내 목의 베개", w: 136 })}
      ${text({ x: 74, y: 188, value: ["베개가", "나에게 맞춰집니다"], size: 64, weight: 900, max: 12, lh: 1.08 })}
      ${text({ x: 78, y: 392, value: ["체형·자세·연령에 맞춰", "4단계로 조절하는 경추 베개"], size: 30, weight: 700, color: C.sage, lh: 1.38 })}
      ${benefitChip({ x: 74, y: 510, value: "4단계 높이", w: 190 })}
      ${benefitChip({ x: 282, y: 510, value: "4분할 지지", w: 190 })}
      ${benefitChip({ x: 490, y: 510, value: "안심 소재", w: 170 })}
    `,
    problem: `
      <defs>${gradient({ id: "problemFade", color: "#fffaf2" })}</defs>
      <rect x="0" y="0" width="690" height="1500" fill="url(#problemFade)"/>
      ${pill({ x: 70, y: 98, value: "오늘 아침", w: 118, fill: C.clay })}
      ${text({ x: 70, y: 210, value: ["오늘 아침에도", "목부터 무거우셨습니까?"], size: 54, weight: 900, lh: 1.12 })}
      ${text({ x: 74, y: 392, value: ["베개가 내 체형에 맞지 않으면,", "잠 8시간이 아니라 부담 8시간입니다."], size: 26, weight: 700, color: C.muted, max: 26, lh: 1.5 })}
      ${rect({ x: 72, y: 620, w: 460, h: 252, fill: "#ffffff", rx: 22, opacity: 0.92, stroke: C.line })}
      ${text({ x: 105, y: 682, value: "베개를 바꾸기 전, 이 3가지부터", size: 24, weight: 850, max: 22 })}
      ${text({ x: 105, y: 750, value: ["내 체형의 높이", "옆잠 자세의 지지", "매일 닿는 소재"], size: 22, weight: 700, color: C.sage, lh: 1.6 })}
    `,
    agitation: `
      <defs>${gradient({ id: "agitationFade", direction: "top", color: "#fffaf2" })}</defs>
      <rect x="0" y="0" width="${W}" height="480" fill="url(#agitationFade)"/>
      ${pill({ x: 70, y: 74, value: "365번의 아침", w: 150, fill: "#715f52" })}
      ${text({ x: 70, y: 170, value: ["베개 하나가,", "1년의 아침을 바꿉니다."], size: 52, weight: 900, color: C.ink, lh: 1.13 })}
      ${text({ x: 74, y: 340, value: ["잘 자고도 피곤한 진짜 이유는,", "매일 같은 베개에 매일 같은 부담이기 때문입니다."], size: 25, weight: 700, color: C.muted, max: 28, lh: 1.42 })}
      ${smallCard({ x: 72, y: 1180, title: "365번", body: "반복되는 아침", w: 260, h: 150 })}
      ${smallCard({ x: 370, y: 1180, title: "8시간", body: "매일 같은 부담", w: 260, h: 150 })}
      ${smallCard({ x: 668, y: 1180, title: "1년", body: "쌓이는 컨디션", w: 260, h: 150 })}
    `,
    solution: `
      <defs>${gradient({ id: "solutionFade", direction: "top", color: "#fff8ee" })}</defs>
      <rect x="0" y="0" width="${W}" height="560" fill="url(#solutionFade)"/>
      ${pill({ x: 70, y: 84, value: "5년의 결과", w: 118 })}
      ${text({ x: 70, y: 190, value: ["5년 동안 다시,", "다시, 다시 만들었습니다."], size: 50, weight: 900, lh: 1.12 })}
      ${text({ x: 74, y: 372, value: ["높이·구조·소재.", "한 베개가 하나의 답이 될 때까지."], size: 27, weight: 700, color: C.muted, max: 26, lh: 1.48 })}
      ${benefitChip({ x: 70, y: 1224, value: "높이", w: 180 })}
      ${benefitChip({ x: 280, y: 1224, value: "구조", w: 180 })}
      ${benefitChip({ x: 490, y: 1224, value: "소재", w: 180 })}
    `,
    height: `
      <defs>${gradient({ id: "heightFade", direction: "top", color: "#fffaf2" })}</defs>
      <rect x="0" y="0" width="${W}" height="560" fill="url(#heightFade)"/>
      ${pill({ x: 70, y: 84, value: "높이 조절", w: 118 })}
      ${text({ x: 70, y: 190, value: ["베개 4개를,", "베개 1개로."], size: 56, weight: 900, lh: 1.12 })}
      ${text({ x: 74, y: 362, value: ["솔루션 패드로 1단계부터 4단계까지,", "내 체형에 정확히 맞춥니다."], size: 27, weight: 700, color: C.muted, max: 26, lh: 1.45 })}
      ${rect({ x: 72, y: 1220, w: 856, h: 112, fill: "#ffffff", rx: 22, opacity: 0.92, stroke: C.line })}
      ${text({ x: 500, y: 1292, value: "낮게 시작해서, 내 몸이 좋아하는 단계에서 멈춥니다", size: 26, weight: 850, color: C.sage, anchor: "middle", max: 36 })}
    `,
    structure: `
      <defs>${gradient({ id: "structureFade", direction: "top", color: "#fffaf2" })}</defs>
      <rect x="0" y="0" width="${W}" height="570" fill="url(#structureFade)"/>
      ${pill({ x: 70, y: 84, value: "4분할 지지", w: 118 })}
      ${text({ x: 70, y: 190, value: ["한 면이 아니라,", "네 부위가 따로 받칩니다."], size: 50, weight: 900, lh: 1.12 })}
      ${text({ x: 74, y: 372, value: ["목·머리·어깨·옆잠.", "하중이 한 곳에 몰리지 않도록 분산됩니다."], size: 27, weight: 700, color: C.muted, max: 26, lh: 1.45 })}
      ${benefitChip({ x: 72, y: 1232, value: "목", w: 176 })}
      ${benefitChip({ x: 282, y: 1232, value: "머리", w: 176 })}
      ${benefitChip({ x: 492, y: 1232, value: "어깨", w: 176 })}
      ${benefitChip({ x: 702, y: 1232, value: "옆잠", w: 176 })}
    `,
    authority: `
      <defs>${gradient({ id: "authorityFade", direction: "top", color: "#fffaf2" })}</defs>
      <rect x="0" y="0" width="${W}" height="570" fill="url(#authorityFade)"/>
      ${pill({ x: 70, y: 84, value: "검증된 소재", w: 118 })}
      ${text({ x: 70, y: 190, value: ["매일 닿는 면이라,", "더 까다롭게 봤습니다."], size: 54, weight: 900, lh: 1.12 })}
      ${text({ x: 74, y: 362, value: ["통기성, 안전성, 세탁 견뢰도.", "침구 표준 검증을 모두 통과했습니다."], size: 27, weight: 700, color: C.muted, max: 26, lh: 1.45 })}
      ${smallCard({ x: 72, y: 1188, title: "통기성", body: "공기 투과도 검증", w: 260, h: 150 })}
      ${smallCard({ x: 370, y: 1188, title: "안전성", body: "유해물질 검증", w: 260, h: 150 })}
      ${smallCard({ x: 668, y: 1188, title: "내구성", body: "세탁 견뢰도 검증", w: 260, h: 150 })}
    `,
    guide: `
      <defs>${gradient({ id: "guideFade", direction: "top", color: "#fffaf2" })}</defs>
      <rect x="0" y="0" width="${W}" height="570" fill="url(#guideFade)"/>
      ${pill({ x: 70, y: 84, value: "사용 가이드", w: 128 })}
      ${text({ x: 70, y: 190, value: ["처음 베는 밤부터,", "내 몸에 맞춥니다."], size: 56, weight: 900, lh: 1.12 })}
      ${text({ x: 74, y: 362, value: ["높이 조절 → 커버 관리 → 스펙 확인.", "3단계로 끝납니다."], size: 27, weight: 700, color: C.muted, max: 26, lh: 1.45 })}
      ${rect({ x: 72, y: 1210, w: 856, h: 140, fill: "#ffffff", rx: 22, opacity: 0.92, stroke: C.line })}
      ${text({ x: 160, y: 1294, value: "1", size: 34, weight: 900, color: C.clay, anchor: "middle" })}
      ${text({ x: 320, y: 1294, value: "높이 조절", size: 25, weight: 850, color: C.sage, anchor: "middle" })}
      ${text({ x: 545, y: 1294, value: "커버 관리", size: 25, weight: 850, color: C.sage, anchor: "middle" })}
      ${text({ x: 760, y: 1294, value: "스펙 확인", size: 25, weight: 850, color: C.sage, anchor: "middle" })}
    `,
    persona: `
      <defs>${gradient({ id: "personaFade", direction: "top", color: "#fffaf2" })}</defs>
      <rect x="0" y="0" width="${W}" height="610" fill="url(#personaFade)"/>
      ${pill({ x: 70, y: 84, value: "이런 분께", w: 118 })}
      ${text({ x: 70, y: 190, value: ["높이를 몰라도,", "선물할 수 있는 베개."], size: 54, weight: 900, lh: 1.12 })}
      ${text({ x: 74, y: 362, value: ["받는 분이 직접 맞춥니다.", "사용 가이드로 설명도 끝납니다."], size: 27, weight: 700, color: C.muted, max: 26, lh: 1.45 })}
      ${rect({ x: 70, y: 1185, w: 860, h: 150, fill: "#ffffff", rx: 22, opacity: 0.92, stroke: C.line })}
      ${text({ x: 170, y: 1272, value: "사무직", size: 24, weight: 850, color: C.sage, anchor: "middle" })}
      ${text({ x: 380, y: 1272, value: "옆잠", size: 24, weight: 850, color: C.sage, anchor: "middle" })}
      ${text({ x: 590, y: 1272, value: "베개 교체", size: 24, weight: 850, color: C.sage, anchor: "middle" })}
      ${text({ x: 800, y: 1272, value: "부모님 선물", size: 24, weight: 850, color: C.sage, anchor: "middle" })}
    `,
    final: `
      <defs>${gradient({ id: "finalDark", direction: "dark" })}</defs>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#finalDark)"/>
      ${text({ x: 500, y: 150, value: ["오늘 밤이,", "첫 번째 아침입니다."], size: 56, weight: 900, color: C.white, anchor: "middle", lh: 1.16 })}
      ${text({ x: 500, y: 320, value: ["내 목에 맞춘 베개 하나가,", "365번의 아침을 바꿉니다."], size: 28, weight: 700, color: "#efe7dc", anchor: "middle", lh: 1.45 })}
      ${rect({ x: 72, y: 1230, w: 856, h: 150, fill: "#ffffff", rx: 24, opacity: 0.94 })}
      ${text({ x: 205, y: 1312, value: "4단계 높이", size: 25, weight: 850, color: C.sage, anchor: "middle" })}
      ${text({ x: 500, y: 1312, value: "4분할 지지", size: 25, weight: 850, color: C.sage, anchor: "middle" })}
      ${text({ x: 795, y: 1312, value: "안심 소재", size: 25, weight: 850, color: C.sage, anchor: "middle" })}
    `,
  };

  return svg(overlays[type]);
}

async function cover(file, width = W, height = H, position = "center") {
  return sharp(file).resize({ width, height, fit: "cover", position }).png().toBuffer();
}

async function makeBase(cut) {
  const sourcePath = path.join(GENERATED, cut.source);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing generated source image: ${cut.source}`);
  }
  return sharp(await cover(sourcePath, W, H, cut.position || "center"));
}

async function save(cut) {
  fs.mkdirSync(OUT, { recursive: true });
  const base = await makeBase(cut);
  const output = path.join(OUT, cut.file);
  await base
    .composite([{ input: overlayFor(cut.overlay), left: 0, top: 0 }])
    .webp({ quality: 90 })
    .toFile(output);
  const meta = await sharp(output).metadata();
  return {
    file: cut.file,
    raw_source: `assets/generated/${cut.source}`,
    prompt_block: cut.prompt_block,
    width: meta.width,
    height: meta.height,
  };
}

async function makeContactSheet(assets) {
  const tw = 190;
  const th = 285;
  const labelH = 30;
  const gap = 12;
  const cols = 5;
  const rows = Math.ceil(assets.length / cols);
  const base = sharp({
    create: {
      width: cols * (tw + gap) + gap,
      height: rows * (th + labelH + gap) + gap,
      channels: 4,
      background: "#f4f0e8",
    },
  }).png();
  const composites = [];
  for (let i = 0; i < assets.length; i += 1) {
    const asset = assets[i];
    const x = gap + (i % cols) * (tw + gap);
    const y = gap + Math.floor(i / cols) * (th + labelH + gap);
    const thumb = await sharp(path.join(OUT, asset.file))
      .resize({ width: tw, height: th, fit: "cover", position: "top" })
      .png()
      .toBuffer();
    const label = svgBox(
      tw,
      labelH,
      `${rect({ x: 0, y: 0, w: tw, h: labelH, fill: "#fff" })}
      ${text({ x: 8, y: 20, value: asset.file, size: 12, weight: 600, color: "#333", max: 26 })}`,
      "none"
    );
    composites.push({ input: thumb, left: x, top: y });
    composites.push({ input: label, left: x, top: y + th });
  }
  await base.composite(composites).toFile(path.join(OUT, "contact-sheet.png"));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const assets = [];
  for (const cut of CUTS) {
    assets.push(await save(cut));
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    source_deck: "hellenstein-pdp-redesign-v3.pptx",
    source_strategy: "docs/pptx-strategy.md",
    rule: "Raw imagegen cuts contain no embedded text, logos, fake marks, CTA, or UI. Korean customer-facing copy is rendered by this build script in Pretendard. Original PDP images are not composited into proposal cuts; GTM inserts selected originals as standalone full-width image blocks. Clickable UI, reviews, comparison, purchase criteria, sticky CTA, and detail=true explanations are HTML.",
    assets,
  };
  fs.writeFileSync(path.join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await makeContactSheet(assets);
  console.log(`Built ${assets.length} proposal assets.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
