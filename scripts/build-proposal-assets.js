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
        ${text({ x: 74, y: 188, value: ["매일 아침,", "목이 다르다."], size: 72, weight: 900, max: 8, lh: 1.08 })}
        ${text({
          x: 78,
          y: 382,
          value: ["5년 반복 테스트로 설계한", "내 목에 맞춰지는 4단계 베개"],
          size: 31,
          weight: 700,
          color: C.sage,
          lh: 1.38,
        })}
        ${text({ x: 78, y: 510, value: "★★★★★ 5.0 · 후기 144개", size: 25, weight: 800, color: C.gold, max: 30 })}
        ${text({ x: 78, y: 562, value: "경추 맞춤 설계 · 4단계 높이 조절 · 안심 소재", size: 22, weight: 700, color: C.muted, max: 32 })}
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
        ${pill({ x: 70, y: 98, value: "문제 확인", w: 118, fill: C.clay })}
        ${text({ x: 70, y: 210, value: ["왜 매일 아침", "목이 무거울까?"], size: 58, weight: 900, lh: 1.12 })}
        ${text({
          x: 74,
          y: 392,
          value: ["베개는 머리만 받치는 물건이 아닙니다.", "목과 어깨 사이의 빈 공간까지 맞아야 합니다."],
          size: 27,
          weight: 650,
          color: C.muted,
          max: 24,
          lh: 1.5,
        })}
        ${rect({ x: 72, y: 620, w: 430, h: 228, fill: "#ffffff", rx: 22, opacity: 0.92, stroke: C.line })}
        ${text({ x: 105, y: 682, value: "잘 맞지 않는 베개가 남기는 것", size: 25, weight: 850, max: 20 })}
        ${text({ x: 105, y: 750, value: ["뒤척임", "목과 어깨 부담", "아침 컨디션 저하"], size: 22, weight: 700, color: C.sage, lh: 1.58 })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildAgitation() {
  const base = await makeBase(C.charcoal);
  return save("03-agitation.webp", base, [
    { input: await cover(path.join(GENERATED, "agitation-visual.png"), W, H, "center"), left: 0, top: 0 },
    {
      input: svg(`
        <defs>
          <linearGradient id="dark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#191816" stop-opacity=".9"/>
            <stop offset=".52" stop-color="#191816" stop-opacity=".58"/>
            <stop offset="1" stop-color="#191816" stop-opacity=".18"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${W}" height="${H}" fill="url(#dark)"/>
        ${pill({ x: 70, y: 95, value: "반복되는 아침", w: 158, fill: "#715f52" })}
        ${text({ x: 70, y: 218, value: ["베개 하나는", "365번의 아침입니다."], size: 58, weight: 900, color: C.white, lh: 1.12 })}
        ${text({
          x: 74,
          y: 400,
          value: ["하루의 불편이 반복되면", "수면 리듬과 아침 컨디션도 흔들립니다."],
          size: 28,
          weight: 650,
          color: "#e9e1d6",
          max: 24,
          lh: 1.48,
        })}
        ${rect({ x: 72, y: 610, w: 250, h: 170, fill: "#ffffff", rx: 18, opacity: 0.9 })}
        ${rect({ x: 374, y: 610, w: 250, h: 170, fill: "#ffffff", rx: 18, opacity: 0.9 })}
        ${rect({ x: 676, y: 610, w: 250, h: 170, fill: "#ffffff", rx: 18, opacity: 0.9 })}
        ${text({ x: 197, y: 680, value: "1일", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 499, y: 680, value: "30일", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 801, y: 680, value: "365일", size: 34, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 197, y: 735, value: "작은 불편", size: 21, weight: 700, color: C.muted, anchor: "middle" })}
        ${text({ x: 499, y: 735, value: "반복되는 피로", size: 21, weight: 700, color: C.muted, anchor: "middle" })}
        ${text({ x: 801, y: 735, value: "바뀌지 않는 아침", size: 21, weight: 700, color: C.muted, anchor: "middle" })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildSolution() {
  const base = await makeBase(C.ivory);
  return save("04-solution.webp", base, [
    { input: await contain(path.join(ORIGINAL, "09_3_story.webp"), 440, 620, C.ivory), left: 520, top: 120 },
    { input: await contain(path.join(ORIGINAL, "08_2_main.webp"), 360, 430, C.ivory), left: 88, top: 835 },
    { input: await contain(path.join(ORIGINAL, "15_4_point3_1.webp"), 360, 430, C.ivory), left: 552, top: 835 },
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
        ${rect({ x: 70, y: 555, w: 370, h: 170, fill: "#ffffff", rx: 18, opacity: 0.96, stroke: C.line })}
        ${text({ x: 100, y: 615, value: "구매 전 확인할 핵심 3가지", size: 25, weight: 850 })}
        ${text({ x: 100, y: 682, value: "4단계 높이 · 4분할 구조 · 안심 소재", size: 22, weight: 750, color: C.sage, max: 24 })}
        ${text({ x: 250, y: 1320, value: "제품 이미지", size: 23, weight: 800, color: C.muted, anchor: "middle" })}
        ${text({ x: 730, y: 1320, value: "구조 이미지", size: 23, weight: 800, color: C.muted, anchor: "middle" })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildHeight() {
  const base = await makeBase(C.blue);
  return save("05-height.webp", base, [
    { input: await contain(path.join(ORIGINAL, "13_4_point2_2.webp"), 430, 640, C.blue), left: 74, top: 500 },
    { input: await contain(path.join(ORIGINAL, "14_4_point2_3.webp"), 430, 640, C.blue), left: 500, top: 500 },
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
    { input: await contain(path.join(ORIGINAL, "15_4_point3_1.webp"), 440, 560, C.ivory), left: 56, top: 480 },
    { input: await contain(path.join(ORIGINAL, "19_4_point4_1.webp"), 440, 560, C.ivory), left: 505, top: 480 },
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
    { input: await contain(path.join(ORIGINAL, "21_4_point5_2.webp"), 265, 410, "#f7f8f5"), left: 68, top: 520 },
    { input: await contain(path.join(ORIGINAL, "23_4_point6_1.webp"), 265, 410, "#f7f8f5"), left: 367, top: 520 },
    { input: await contain(path.join(ORIGINAL, "24_4_point6_2.webp"), 265, 410, "#f7f8f5"), left: 666, top: 520 },
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
        ${rect({ x: 68, y: 990, w: 265, h: 150, fill: "#ffffff", rx: 18, stroke: C.line })}
        ${rect({ x: 367, y: 990, w: 265, h: 150, fill: "#ffffff", rx: 18, stroke: C.line })}
        ${rect({ x: 666, y: 990, w: 265, h: 150, fill: "#ffffff", rx: 18, stroke: C.line })}
        ${text({ x: 200, y: 1065, value: "FITI 인증", size: 26, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 500, y: 1065, value: "소재 안전성", size: 26, weight: 900, color: C.sage, anchor: "middle" })}
        ${text({ x: 798, y: 1065, value: "내구성 검증", size: 26, weight: 900, color: C.sage, anchor: "middle" })}
      `),
      left: 0,
      top: 0,
    },
  ]);
}

async function buildGuide() {
  const base = await makeBase(C.ivory);
  return save("08-guide.webp", base, [
    { input: await contain(path.join(ORIGINAL, "29_7_guide.webp"), 290, 560, C.ivory), left: 72, top: 500 },
    { input: await contain(path.join(ORIGINAL, "30_7_guide_1.webp"), 290, 560, C.ivory), left: 356, top: 500 },
    { input: await contain(path.join(ORIGINAL, "32_9_careguide.webp"), 290, 560, C.ivory), left: 640, top: 500 },
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
        ${rect({ x: 72, y: 1130, w: 856, h: 160, fill: "#ffffff", rx: 20, stroke: C.line })}
        ${text({ x: 500, y: 1218, value: "사용 가이드 · 케어 가이드 · 제품 스펙", size: 30, weight: 850, color: C.sage, anchor: "middle", max: 34 })}
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
        ${text({ x: 70, y: 198, value: ["이런 분께", "추천합니다"], size: 58, weight: 900, lh: 1.12 })}
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
        ${text({ x: 500, y: 150, value: ["오늘 밤의 베개가", "내일 아침을 바꿉니다"], size: 52, weight: 850, color: C.white, anchor: "middle", lh: 1.16 })}
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
    rule: "Image cuts may include customer-facing Korean copy rendered by this script. Clickable UI, GTM explanation overlays, reviews, comparison, FAQ, and sticky CTA are HTML.",
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
