const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const ORIGINAL = path.join(ROOT, "original");
const GENERATED = path.join(ROOT, "assets/generated");
const OUT = path.join(ROOT, "proposal");

const W = 1000;
const H = 1500;
const FONT =
  "'Apple SD Gothic Neo', 'Pretendard', 'Noto Sans CJK KR', Arial, sans-serif";

const C = {
  ink: "#1f2421",
  muted: "#5f665f",
  white: "#ffffff",
  ivory: "#fbf8f2",
  paper: "#fffdf9",
  sage: "#3d4d43",
  clay: "#9a735f",
  sand: "#e6dccf",
  line: "#ded5c8",
  gold: "#a17b3d",
  blue: "#eef5f7",
  charcoal: "#24211e",
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(text, max) {
  const source = String(text);
  if (Array.isArray(text)) return text;
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

async function cover(file, width = W, height = H, position = "center") {
  return sharp(file).resize({ width, height, fit: "cover", position }).png().toBuffer();
}

async function contain(file, width, height, bg = C.ivory) {
  return sharp(file)
    .resize({ width, height, fit: "contain", background: bg })
    .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: bg,
    })
    .png()
    .toBuffer();
}

async function makeBase(bg = C.ivory) {
  return sharp({
    create: { width: W, height: H, channels: 4, background: bg },
  });
}

async function save(name, base, overlays = []) {
  fs.mkdirSync(OUT, { recursive: true });
  const output = path.join(OUT, name);
  await base.composite(overlays).webp({ quality: 90 }).toFile(output);
  const meta = await sharp(output).metadata();
  return { file: name, width: meta.width, height: meta.height };
}

function softTextPanel() {
  return rect({ x: 58, y: 70, w: 620, h: 470, fill: "#fffaf1", rx: 28, opacity: 0.88 });
}

async function buildHero() {
  const base = await makeBase();
  return save("01-hero.webp", base, [
    { input: await cover(path.join(GENERATED, "hero-lifestyle.png"), W, H, "center"), left: 0, top: 0 },
    {
      input: svg(`
        <defs>
          <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="#fff8ee" stop-opacity=".96"/>
            <stop offset=".64" stop-color="#fff8ee" stop-opacity=".72"/>
            <stop offset="1" stop-color="#fff8ee" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="760" height="650" fill="url(#fade)"/>
        ${pill({ x: 74, y: 84, value: "내 목의 베개", w: 136 })}
        ${text({ x: 74, y: 188, value: ["내 목에 맞춘", "편안함"], size: 72, weight: 900, max: 8, lh: 1.08 })}
        ${text({
          x: 78,
          y: 382,
          value: ["높이와 지지감을 내 몸에 맞게 조절하는", "4단계 경추 베개"],
          size: 31,
          weight: 700,
          color: C.sage,
          lh: 1.38,
        })}
        ${text({ x: 78, y: 510, value: "실제 사용 후기에서 확인한 편안함", size: 25, weight: 800, color: C.gold, max: 30 })}
        ${text({ x: 78, y: 562, value: "4단계 높이 조절 · 4분할 지지 · 안심 소재", size: 22, weight: 700, color: C.muted, max: 32 })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildProblem() {
  const base = await makeBase();
  return save("02-problem.webp", base, [
    { input: await cover(path.join(GENERATED, "problem-lifestyle.png"), W, H, "center"), left: 0, top: 0 },
    {
      input: svg(`
        <defs>
          <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="#fffaf2" stop-opacity=".96"/>
            <stop offset=".58" stop-color="#fffaf2" stop-opacity=".72"/>
            <stop offset="1" stop-color="#fffaf2" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="690" height="1500" fill="url(#fade)"/>
        ${pill({ x: 70, y: 98, value: "고민 확인", w: 118, fill: C.clay })}
        ${text({ x: 70, y: 210, value: ["아침마다", "목이 편하지 않았다면"], size: 58, weight: 900, lh: 1.12 })}
        ${text({
          x: 74,
          y: 392,
          value: ["베개 높이와 지지감이", "내 체형과 수면 자세에 맞지 않았을 수 있습니다."],
          size: 27,
          weight: 650,
          color: C.muted,
          max: 24,
          lh: 1.5,
        })}
        ${rect({ x: 72, y: 620, w: 430, h: 228, fill: "#ffffff", rx: 22, opacity: 0.92, stroke: C.line })}
        ${text({ x: 105, y: 682, value: "베개를 고를 때 확인할 것", size: 25, weight: 850, max: 20 })}
        ${text({ x: 105, y: 750, value: ["높이", "목과 머리 지지감", "세탁과 관리 편의성"], size: 22, weight: 700, color: C.sage, lh: 1.58 })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildAgitation() {
  const base = await makeBase(C.ivory);
  return save("03-agitation.webp", base, [
    { input: await cover(path.join(GENERATED, "agitation-visual.png"), W, H, "center"), left: 0, top: 0 },
    {
      input: svg(`
        <defs>
          <linearGradient id="soft" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="#fffaf2" stop-opacity=".96"/>
            <stop offset=".64" stop-color="#fffaf2" stop-opacity=".72"/>
            <stop offset="1" stop-color="#fffaf2" stop-opacity=".2"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="760" height="${H}" fill="url(#soft)"/>
        ${pill({ x: 70, y: 95, value: "매일 쓰는 침구", w: 158, fill: "#715f52" })}
        ${text({ x: 70, y: 218, value: ["하루의 쉼은", "베개에서 시작됩니다"], size: 58, weight: 900, color: C.ink, lh: 1.12 })}
        ${text({
          x: 74,
          y: 400,
          value: ["작은 높이 차이도 매일 반복되기 때문에", "처음부터 내 몸에 맞게 고르는 것이 중요합니다."],
          size: 28,
          weight: 650,
          color: C.muted,
          max: 24,
          lh: 1.48,
        })}
        ${rect({ x: 72, y: 610, w: 250, h: 170, fill: "#ffffff", rx: 18, opacity: 0.9 })}
        ${rect({ x: 374, y: 610, w: 250, h: 170, fill: "#ffffff", rx: 18, opacity: 0.9 })}
        ${rect({ x: 676, y: 610, w: 250, h: 170, fill: "#ffffff", rx: 18, opacity: 0.9 })}
        ${text({ x: 197, y: 680, value: "높이", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 499, y: 680, value: "자세", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 801, y: 680, value: "소재", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 197, y: 735, value: "내 체형에 맞게", size: 21, weight: 700, color: C.muted, anchor: "middle" })}
        ${text({ x: 499, y: 735, value: "옆잠까지 고려", size: 21, weight: 700, color: C.muted, anchor: "middle" })}
        ${text({ x: 801, y: 735, value: "안심하고 관리", size: 21, weight: 700, color: C.muted, anchor: "middle" })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildSolution() {
  const base = await makeBase(C.ivory);
  return save("04-solution.webp", base, [
    {
      input: svg(`
        ${pill({ x: 70, y: 98, value: "해결 방식", w: 118 })}
        ${text({ x: 70, y: 210, value: ["헬렌스타인이", "5년간 다시 만든 이유"], size: 54, weight: 900, lh: 1.12 })}
        ${text({
          x: 74,
          y: 380,
          value: ["높이 · 구조 · 소재를 따로 고민하지 않도록", "한 제품 안에서 균형 있게 맞췄습니다."],
          size: 27,
          weight: 650,
          color: C.muted,
          max: 24,
          lh: 1.48,
        })}
        ${rect({ x: 72, y: 600, w: 250, h: 250, fill: "#ffffff", rx: 22, opacity: 0.96, stroke: C.line })}
        ${rect({ x: 375, y: 600, w: 250, h: 250, fill: "#ffffff", rx: 22, opacity: 0.96, stroke: C.line })}
        ${rect({ x: 678, y: 600, w: 250, h: 250, fill: "#ffffff", rx: 22, opacity: 0.96, stroke: C.line })}
        ${text({ x: 197, y: 705, value: "높이", size: 38, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 500, y: 705, value: "구조", size: 38, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 803, y: 705, value: "소재", size: 38, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 197, y: 780, value: "4단계 조절", size: 22, weight: 750, color: C.muted, anchor: "middle" })}
        ${text({ x: 500, y: 780, value: "4분할 지지", size: 22, weight: 750, color: C.muted, anchor: "middle" })}
        ${text({ x: 803, y: 780, value: "안전성 검증", size: 22, weight: 750, color: C.muted, anchor: "middle" })}
        ${rect({ x: 72, y: 1055, w: 856, h: 170, fill: "#ffffff", rx: 22, stroke: C.line })}
        ${text({ x: 500, y: 1138, value: "아래에서 제품 구조와 개발 스토리를 크게 확인하세요", size: 28, weight: 850, color: C.sage, anchor: "middle", max: 30 })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildHeight() {
  const base = await makeBase(C.blue);
  return save("05-height.webp", base, [
    {
      input: svg(`
        ${pill({ x: 70, y: 92, value: "높이 조절", w: 118 })}
        ${text({ x: 70, y: 198, value: ["낮은 베개부터", "높은 베개까지 4단계"], size: 54, weight: 900, lh: 1.12 })}
        ${text({
          x: 74,
          y: 365,
          value: ["낮게도 높게도 쓸 수 있어", "체형과 수면 자세에 맞춰 세밀하게 조절합니다."],
          size: 27,
          weight: 650,
          color: C.muted,
          max: 24,
          lh: 1.45,
        })}
        ${rect({ x: 106, y: 600, w: 150, h: 170, fill: "#ffffff", rx: 20, stroke: C.line })}
        ${rect({ x: 316, y: 550, w: 150, h: 220, fill: "#ffffff", rx: 20, stroke: C.line })}
        ${rect({ x: 526, y: 500, w: 150, h: 270, fill: "#ffffff", rx: 20, stroke: C.line })}
        ${rect({ x: 736, y: 450, w: 150, h: 320, fill: "#ffffff", rx: 20, stroke: C.line })}
        ${text({ x: 181, y: 700, value: "1", size: 46, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 391, y: 675, value: "2", size: 46, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 601, y: 650, value: "3", size: 46, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 811, y: 625, value: "4", size: 46, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 500, y: 890, value: "낮게 시작하고, 내 체형에 맞게 한 단계씩 조절합니다", size: 28, weight: 800, color: C.sage, anchor: "middle", max: 32 })}
        ${rect({ x: 72, y: 1210, w: 856, h: 170, fill: "#ffffff", rx: 20, stroke: C.line })}
        ${text({ x: 180, y: 1284, value: "기능", size: 20, weight: 800, color: C.clay, anchor: "middle" })}
        ${text({ x: 180, y: 1332, value: "4단계 높이 조절", size: 24, weight: 850, anchor: "middle" })}
        ${text({ x: 500, y: 1284, value: "장점", size: 20, weight: 800, color: C.clay, anchor: "middle" })}
        ${text({ x: 500, y: 1332, value: "자세별 세밀 조절", size: 24, weight: 850, anchor: "middle" })}
        ${text({ x: 820, y: 1284, value: "체감", size: 20, weight: 800, color: C.clay, anchor: "middle" })}
        ${text({ x: 820, y: 1332, value: "내 목에 맞는 편안함", size: 24, weight: 850, anchor: "middle" })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildStructure() {
  const base = await makeBase(C.ivory);
  return save("06-structure.webp", base, [
    {
      input: svg(`
        ${pill({ x: 70, y: 92, value: "지지 구조", w: 118 })}
        ${text({ x: 70, y: 198, value: ["목과 머리를", "따로 받치는 4분할 구조"], size: 54, weight: 900, lh: 1.12 })}
        ${text({
          x: 74,
          y: 365,
          value: ["목 지지부와 머리 지지부를 나누어", "하중이 한 곳에 몰리지 않도록 받쳐줍니다."],
          size: 27,
          weight: 650,
          color: C.muted,
          max: 24,
          lh: 1.45,
        })}
        ${rect({ x: 145, y: 610, w: 710, h: 280, fill: "#ffffff", rx: 120, stroke: C.line })}
        ${rect({ x: 235, y: 665, w: 180, h: 145, fill: "#e7d7c4", rx: 72, opacity: 0.85 })}
        ${rect({ x: 585, y: 665, w: 180, h: 145, fill: "#e7d7c4", rx: 72, opacity: 0.85 })}
        ${rect({ x: 420, y: 630, w: 160, h: 190, fill: "#edf2ee", rx: 80, opacity: 0.95 })}
        ${rect({ x: 380, y: 805, w: 240, h: 64, fill: "#d9c1a8", rx: 32, opacity: 0.9 })}
        ${rect({ x: 72, y: 1125, w: 856, h: 210, fill: "#ffffff", rx: 20, stroke: C.line })}
        ${text({ x: 145, y: 1215, value: "목", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 360, y: 1215, value: "머리", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 590, y: 1215, value: "어깨", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 815, y: 1215, value: "옆잠", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 500, y: 1295, value: "각 부위를 따로 고려한 지지 구조", size: 24, weight: 750, color: C.muted, anchor: "middle", max: 28 })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildAuthority() {
  const base = await makeBase("#f7f8f5");
  return save("07-authority.webp", base, [
    {
      input: svg(`
        ${pill({ x: 70, y: 92, value: "신뢰 요소", w: 118 })}
        ${text({ x: 70, y: 198, value: ["인증과 테스트를", "한 번에 묶어 보여줍니다"], size: 54, weight: 900, lh: 1.12 })}
        ${text({
          x: 74,
          y: 365,
          value: ["소재 안전성과 내구성까지 확인할 수 있어", "매일 쓰는 침구로 더 안심할 수 있습니다."],
          size: 27,
          weight: 650,
          color: C.muted,
          max: 24,
          lh: 1.45,
        })}
        ${rect({ x: 82, y: 590, w: 250, h: 350, fill: "#ffffff", rx: 22, stroke: C.line })}
        ${rect({ x: 375, y: 590, w: 250, h: 350, fill: "#ffffff", rx: 22, stroke: C.line })}
        ${rect({ x: 668, y: 590, w: 250, h: 350, fill: "#ffffff", rx: 22, stroke: C.line })}
        ${text({ x: 207, y: 730, value: "통기성", size: 38, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 500, y: 730, value: "안전성", size: 38, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 793, y: 730, value: "내구성", size: 38, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 207, y: 820, value: "공기 투과도", size: 22, weight: 750, color: C.muted, anchor: "middle" })}
        ${text({ x: 500, y: 820, value: "소재 안전성", size: 22, weight: 750, color: C.muted, anchor: "middle" })}
        ${text({ x: 793, y: 820, value: "세탁 견뢰도", size: 22, weight: 750, color: C.muted, anchor: "middle" })}
        ${text({ x: 500, y: 1110, value: "아래에서 인증과 테스트 내용을 크게 확인하세요", size: 28, weight: 850, color: C.sage, anchor: "middle", max: 32 })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildGuide() {
  const base = await makeBase(C.ivory);
  return save("08-guide.webp", base, [
    {
      input: svg(`
        ${pill({ x: 70, y: 92, value: "사용 가이드", w: 128 })}
        ${text({ x: 70, y: 198, value: ["내 목에 맞게", "처음부터 조절하세요"], size: 54, weight: 900, lh: 1.12 })}
        ${text({
          x: 74,
          y: 365,
          value: ["처음 사용하는 날부터 내 몸에 맞게 조절하고", "세탁과 관리 방법까지 확인할 수 있습니다."],
          size: 27,
          weight: 650,
          color: C.muted,
          max: 25,
          lh: 1.45,
        })}
        ${rect({ x: 72, y: 590, w: 856, h: 170, fill: "#ffffff", rx: 22, stroke: C.line })}
        ${rect({ x: 72, y: 815, w: 856, h: 170, fill: "#ffffff", rx: 22, stroke: C.line })}
        ${rect({ x: 72, y: 1040, w: 856, h: 170, fill: "#ffffff", rx: 22, stroke: C.line })}
        ${text({ x: 150, y: 682, value: "01", size: 34, weight: 900, color: C.clay, anchor: "middle" })}
        ${text({ x: 150, y: 907, value: "02", size: 34, weight: 900, color: C.clay, anchor: "middle" })}
        ${text({ x: 150, y: 1132, value: "03", size: 34, weight: 900, color: C.clay, anchor: "middle" })}
        ${text({ x: 235, y: 682, value: "내 몸에 맞게 높이를 조절합니다", size: 28, weight: 850, color: C.sage, max: 28 })}
        ${text({ x: 235, y: 907, value: "커버와 충전재 관리법을 확인합니다", size: 28, weight: 850, color: C.sage, max: 28 })}
        ${text({ x: 235, y: 1132, value: "사이즈와 구성품을 구매 전 확인합니다", size: 28, weight: 850, color: C.sage, max: 28 })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildPersona() {
  const base = await makeBase();
  return save("09-persona.webp", base, [
    { input: await cover(path.join(GENERATED, "persona-gift-lifestyle.png"), W, H, "center"), left: 0, top: 0 },
    {
      input: svg(`
        <defs>
          <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#fffaf2" stop-opacity=".95"/>
            <stop offset=".48" stop-color="#fffaf2" stop-opacity=".62"/>
            <stop offset="1" stop-color="#fffaf2" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${W}" height="660" fill="url(#fade)"/>
        ${pill({ x: 70, y: 92, value: "추천 대상", w: 118 })}
        ${text({ x: 70, y: 198, value: ["이런 분께", "잘 맞습니다"], size: 58, weight: 900, lh: 1.12 })}
        ${rect({ x: 70, y: 390, w: 860, h: 210, fill: "#ffffff", rx: 22, opacity: 0.92, stroke: C.line })}
        ${text({ x: 140, y: 465, value: "오래 앉아 일하는 분", size: 25, weight: 800, color: C.sage })}
        ${text({ x: 140, y: 530, value: "옆으로 자는 시간이 긴 분", size: 25, weight: 800, color: C.sage })}
        ${text({ x: 560, y: 465, value: "베개를 자주 바꾸는 분", size: 25, weight: 800, color: C.sage })}
        ${text({ x: 560, y: 530, value: "부모님 선물을 찾는 분", size: 25, weight: 800, color: C.sage })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildFinal() {
  const base = await makeBase();
  return save("10-final.webp", base, [
    { input: await cover(path.join(GENERATED, "hero-lifestyle.png"), W, H, "center"), left: 0, top: 0 },
    {
      input: svg(`
        <defs>
          <linearGradient id="dark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#1e211d" stop-opacity=".72"/>
            <stop offset=".52" stop-color="#1e211d" stop-opacity=".2"/>
            <stop offset="1" stop-color="#1e211d" stop-opacity=".55"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${W}" height="${H}" fill="url(#dark)"/>
        ${text({ x: 500, y: 150, value: ["오늘 밤도", "내 목에 맞게 편안하게"], size: 52, weight: 850, color: C.white, anchor: "middle", lh: 1.16 })}
        ${text({ x: 500, y: 300, value: "내 목의 베개", size: 44, weight: 700, color: "#efe7dc", anchor: "middle" })}
        ${rect({ x: 72, y: 1230, w: 856, h: 150, fill: "#ffffff", rx: 24, opacity: 0.94 })}
        ${text({ x: 205, y: 1312, value: "4단계 높이", size: 25, weight: 850, color: C.sage, anchor: "middle" })}
        ${text({ x: 500, y: 1312, value: "4분할 지지", size: 25, weight: 850, color: C.sage, anchor: "middle" })}
        ${text({ x: 795, y: 1312, value: "안심 소재", size: 25, weight: 850, color: C.sage, anchor: "middle" })}
      `),
      left: 0,
      top: 0,
    },
  ]);
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
  for (const build of [
    buildHero,
    buildProblem,
    buildAgitation,
    buildSolution,
    buildHeight,
    buildStructure,
    buildAuthority,
    buildGuide,
    buildPersona,
    buildFinal,
  ]) {
    assets.push(await build());
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    source_deck: "hellenstein-pdp-redesign-v3.pptx",
    source_strategy: "docs/pptx-strategy.md",
    rule: "Image cuts may include customer-facing Korean copy rendered by this script. Original PDP images are not composited into proposal cuts; GTM inserts selected originals as standalone full-width image blocks. Clickable UI, GTM explanation overlays, reviews, comparison, purchase criteria, and sticky CTA are HTML.",
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
