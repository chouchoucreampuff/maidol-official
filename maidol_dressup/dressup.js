"use strict";

// ========================================
// 基本設定
// ========================================

const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 3000;

const CATEGORY_NAMES = {
  SK: "肌",
  HB: "後ろ髪",
  HF: "前髪",
  HFE: "前髪エフェクト",
  HBE: "後ろ髪エフェクト",
  HA: "髪飾り",
  ES: "目の形",
  IC: "瞳の色",
  ICH: "瞳ハイライト",
  BR: "眉毛",
  MO: "口",
  MK: "メイク",
  DR: "ワンピース",
  TP: "トップス",
  BT: "ボトムス",
  SH: "靴"
};

const GRADIENT_POSITIONS = [0.10, 0.30, 0.65, 1.00];

const DEFAULT_HAIR_COLORS = {
  shadow: "#666666",
  main: "#AAAAAA",
  highlight: "#EEEEEE"
};

const DEFAULT_EFFECT_COLORS = {
  shadow: "#666666",
  main: "#AAAAAA",
  highlight: "#EEEEEE"
};

const DEFAULT_EYE_COLORS = {
  shadow: "#666666",
  main: "#AAAAAA",
  highlight: "#EEEEEE"
};
const DEFAULT_BACKGROUND_COLORS = {
  shadow: "#FFB4D5",
  main: "#FFE8B8",
  highlight: "#B8E8FF"
};

const HAIR_HUES = [
  { name: "赤", base: "#D94355", hue: 355 },
  { name: "橙", base: "#E97835", hue: 30 },
  { name: "黄", base: "#EBC34B", hue: 55 },
  { name: "黄緑", base: "#9ABF3E", hue: 85 },
  { name: "緑", base: "#329765", hue: 135 },
  { name: "ミント", base: "#65C8B0", hue: 165 },
  { name: "水色", base: "#68BCE5", hue: 195 },
  { name: "青", base: "#456FC9", hue: 225 },
  { name: "濃紫", base: "#75418E", hue: 265 },
  { name: "淡紫", base: "#B49AD1", hue: 290 },
  { name: "濃桃", base: "#D84F91", hue: 325 },
  { name: "淡桃", base: "#F0A6C6", hue: 345 },
  { name: "ベージュ", base: "#C6A77A", hue: 45 },
  { name: "茶", base: "#805238", hue: 15 },
  { name: "モノトーン", base: "#A5A5A5", hue: null }
];

const HAIR_SATURATION_LEVELS = [0.30, 0.60, 0.90];
const HAIR_LIGHTNESS_LEVELS = [0.90, 0.70, 0.50, 0.30];

// ========================================
// HTML要素
// ========================================

const canvas = document.getElementById("character-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const itemList = document.getElementById("item-list");
const categoryTitle = document.getElementById("category-title");
const statusMessage = document.getElementById("status-message");

// ========================================
// 状態管理
// ========================================

let manifest = null;
let currentCategory = "HF";
let faceOverlayEnabled = false;

let hairColors = { ...DEFAULT_HAIR_COLORS };
let backgroundColors = {...DEFAULT_BACKGROUND_COLORS};
let effectColors = {
  HFE: { ...DEFAULT_EFFECT_COLORS },
  HBE: { ...DEFAULT_EFFECT_COLORS }
};

// 左右の瞳色を完全に独立して管理
let eyeColors = {
  left: { ...DEFAULT_EYE_COLORS },
  right: { ...DEFAULT_EYE_COLORS }
};

let currentHairStop = "shadow";
let currentColorMode = "hair";
let currentHairHue = 0;

const selected = {
  SK: 1,
  HB: 1,
  HF: 1,
  HFE: null,
  HBE: null,
  HA: null,
  ES: 1,
  IC: 1,
  ICH: 1,
  BR: 1,
  MO: 1,
  MK: null,
  DR: 1,
  TP: null,
  BT: null,
  SH: 1
};

const hairFlip = {
  HF: false,
  HB: false,
  HFE: false,
  HBE: false
};

const imageCache = new Map();
const coloredImageCache = new Map();
const hairEffectCache = new Map();

// ========================================
// 共通処理
// ========================================

function updateStatus(message) {
  if (statusMessage) {
    statusMessage.textContent = message;
  }
}

function assetPath(category, number, suffix = "") {
  const id = String(number).padStart(5, "0");
  return `assets/${category}/${category}${id}${suffix}.png`;
}

function getItemPath(category, number, suffix = "") {
  return assetPath(category, number, suffix);
}

function getCategoryCount(category) {
  return manifest?.categories?.[category]?.count || 0;
}

function getSelectedNumber(category) {
  return selected[category];
}

function clearColorCaches() {
  coloredImageCache.clear();
  hairEffectCache.clear();
}

// ========================================
// 画像読み込み
// ========================================

function loadImage(path) {
  if (imageCache.has(path)) {
    return imageCache.get(path);
  }

  const promise = new Promise(resolve => {
    const img = new Image();

    img.onload = () => resolve(img);

    img.onerror = () => {
      console.warn("画像を読み込めませんでした:", path);
      resolve(null);
    };

    img.src = path;
  });

  imageCache.set(path, promise);
  return promise;
}

async function drawAsset(path, alpha = 1, flip = false, colorize = false) {
  if (!path) return;

  let img = await loadImage(path);
  if (!img) return;

  if (colorize) {
    img = await getColoredImage(path, colorize);
    if (!img) return;
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  if (flip) {
    ctx.translate(CANVAS_WIDTH, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
}

// ========================================
// 色変換
// ========================================

function hexToRgb(hex) {
  const value = hex.replace("#", "");

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function interpolateColor(color1, color2, amount) {
  return {
    r: color1.r + (color2.r - color1.r) * amount,
    g: color1.g + (color2.g - color1.g) * amount,
    b: color1.b + (color2.b - color1.b) * amount
  };
}

function getGradientColors(colorSet) {
  return [
    hexToRgb(colorSet.shadow),
    hexToRgb(colorSet.main),
    hexToRgb(colorSet.highlight),
    { r: 255, g: 255, b: 255 }
  ];
}

// ========================================
// グレースケール画像の着色
// ========================================

async function getColoredImage(path, colorSet) {
  const cacheKey = [
    path,
    colorSet.shadow,
    colorSet.main,
    colorSet.highlight
  ].join("_");

  if (coloredImageCache.has(cacheKey)) {
    return coloredImageCache.get(cacheKey);
  }

  const original = await loadImage(path);
  if (!original) return null;

  const temp = document.createElement("canvas");
  temp.width = CANVAS_WIDTH;
  temp.height = CANVAS_HEIGHT;

  const tempCtx = temp.getContext("2d", {
    willReadFrequently: true
  });

  tempCtx.drawImage(original, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const imageData = tempCtx.getImageData(
    0, 0, CANVAS_WIDTH, CANVAS_HEIGHT
  );

  const pixels = imageData.data;
  const colors = getGradientColors(colorSet);

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) continue;

    const brightness = (
      0.299 * pixels[i] +
      0.587 * pixels[i + 1] +
      0.114 * pixels[i + 2]
    ) / 255;

    let segment = 0;

    while (
      segment < GRADIENT_POSITIONS.length - 2 &&
      brightness > GRADIENT_POSITIONS[segment + 1]
    ) {
      segment++;
    }

    const start = GRADIENT_POSITIONS[segment];
    const end = GRADIENT_POSITIONS[segment + 1];

    const amount = Math.max(
      0,
      Math.min(1, (brightness - start) / (end - start))
    );

    const result = interpolateColor(
      colors[segment],
      colors[segment + 1],
      amount
    );

    pixels[i] = Math.round(result.r);
    pixels[i + 1] = Math.round(result.g);
    pixels[i + 2] = Math.round(result.b);
  }

  tempCtx.putImageData(imageData, 0, 0);
  coloredImageCache.set(cacheKey, temp);

  return temp;
}

// ========================================
// RGB・HSL変換
// ========================================

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = diff / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = 60 * (((g - b) / diff) % 6);
        break;
      case g:
        h = 60 * ((b - r) / diff + 2);
        break;
      case b:
        h = 60 * ((r - g) / diff + 4);
        break;
    }
  }

  if (h < 0) h += 360;

  return { h, s, l };
}

function hslToHex(h, s, l) {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - chroma / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = chroma;
    g = x;
  } else if (h < 120) {
    r = x;
    g = chroma;
  } else if (h < 180) {
    g = chroma;
    b = x;
  } else if (h < 240) {
    g = x;
    b = chroma;
  } else if (h < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const toHex = value =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return (
    "#" +
    toHex(r) +
    toHex(g) +
    toHex(b)
  ).toUpperCase();
}

// ========================================
// パレット生成
// ========================================

function generateHairPalette(hueIndex) {
  const selectedHue = HAIR_HUES[hueIndex];

  if (selectedHue.hue === null) {
    return [
      "#FFFFFF", "#F5F5F5", "#EBEBEB",
      "#DCDCDC", "#CCCCCC", "#BBBBBB",
      "#AAAAAA", "#999999", "#858585",
      "#707070", "#505050", "#303030"
    ];
  }

  const palette = [];

  HAIR_LIGHTNESS_LEVELS.forEach(lightness => {
    HAIR_SATURATION_LEVELS.forEach(saturation => {
      palette.push(
        hslToHex(selectedHue.hue, saturation, lightness)
      );
    });
  });

  return palette;
}

// ========================================
// 現在編集中のカラーセット
// ========================================

function getCurrentColorSet() {
  if (currentColorMode === "background") {
    return backgroundColors;
  }

  if (currentColorMode === "effect") {
    return currentCategory === "HBE"
      ? effectColors.HBE
      : effectColors.HFE;
  }

  if (currentColorMode === "eyeLeft") return eyeColors.left;
  if (currentColorMode === "eyeRight") return eyeColors.right;

  return hairColors;
}

function getCurrentModeName() {
  switch (currentColorMode) {
    case "effect":
      return "エフェクトカラー";
    case "eyeLeft":
      return "左目アイカラー";
    case "eyeRight":
      return "右目アイカラー";
    case "background":
      return "背景";
    default:
      return "ヘアカラー";
  }
}

// ========================================
// カラーパレット作成
// ========================================

function createHairColorButtons() {
  const container = document.getElementById("hair-color-list");
  const hueList = document.getElementById("hair-hue-list");

  if (!container || !hueList) return;

  hueList.innerHTML = "";

  HAIR_HUES.forEach((hue, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "hair-hue-button";

    const swatch = document.createElement("span");
    swatch.className = "hair-hue-swatch";
    swatch.style.background = hue.base;

    const label = document.createElement("span");
    label.textContent = hue.name;

    button.append(swatch, label);

    button.addEventListener("click", () => {
      currentHairHue = index;
      updateHairPalette();
    });

    hueList.appendChild(button);
  });

  container.querySelectorAll(".hair-color-tab").forEach(button => {
    button.addEventListener("click", () => {
      currentHairStop = button.dataset.stop;
      updateHairPalette();
    });
  });

  const resetButton = document.createElement("button");

  resetButton.type = "button";
  resetButton.className = "hair-color-reset";
  resetButton.textContent = "♡ このカラーを初期状態に戻す";

  resetButton.addEventListener("click", async () => {
    const defaults = { ...DEFAULT_HAIR_COLORS };

    if (currentColorMode === "effect") {
      if (currentCategory === "HBE") {
        effectColors.HBE = { ...DEFAULT_EFFECT_COLORS };
      } else {
        effectColors.HFE = { ...DEFAULT_EFFECT_COLORS };
      }
    } else if (currentColorMode === "eyeLeft") {
      eyeColors.left = { ...DEFAULT_EYE_COLORS };
    } else if (currentColorMode === "eyeRight") {
      eyeColors.right = { ...DEFAULT_EYE_COLORS };
    } else {
      hairColors = defaults;
    }

    clearColorCaches();
    updateHairPalette();
    await renderCharacter();

    updateStatus(`${getCurrentModeName()}を初期状態に戻しました。`);
  });

  container.appendChild(resetButton);

  updateHairPalette();
}

// ========================================
// パレット表示更新
// ========================================

function updateHairPalette() {
  const hueList = document.getElementById("hair-hue-list");
  const shadeList = document.getElementById("hair-shade-list");

  if (!hueList || !shadeList) return;

  const colorsSet = getCurrentColorSet();

  hueList.querySelectorAll(".hair-hue-button").forEach((button, index) => {
    button.classList.toggle("active", index === currentHairHue);
  });

  const hueName = document.getElementById("hair-hue-name");

  if (hueName) {
    hueName.textContent = HAIR_HUES[currentHairHue].name;
  }

  const colors = generateHairPalette(currentHairHue);

  shadeList.innerHTML = "";

  colors.forEach(color => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "hair-shade-button";
    button.style.backgroundColor = color;
    button.title = color;

    button.classList.toggle(
      "active",
      colorsSet[currentHairStop] === color
    );

    button.addEventListener("click", async () => {
      colorsSet[currentHairStop] = color;

      clearColorCaches();
      updateHairPalette();

      await renderCharacter();

      const stopName =
        currentHairStop === "shadow" ? "影" :
        currentHairStop === "main" ? "メイン" :
        "ハイライト";

      updateStatus(
        `${getCurrentModeName()}の${stopName}色を変更しました。`
      );
    });

    shadeList.appendChild(button);
  });

  const selectedColor = document.getElementById("hair-selected-color");

  if (selectedColor) {
    selectedColor.textContent = colorsSet[currentHairStop];
  }

  document.querySelectorAll(".hair-color-tab").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.stop === currentHairStop
    );
  });
}

// ========================================
// カラーモード切り替え
// ========================================

function setupColorModeButtons() {
  const buttons = document.querySelectorAll(".color-mode-button");

  buttons.forEach(button => {
    button.addEventListener("click", async () => {
      const mode = button.dataset.colorMode;

if (!["hair", "effect", "eyeLeft", "eyeRight", "background"].includes(mode)) return;

      currentColorMode = mode;

      buttons.forEach(btn => {
        btn.classList.toggle(
          "active",
          btn.dataset.colorMode === currentColorMode
        );
      });

      updateHairPalette();
      await renderCharacter();

      updateStatus(`${getCurrentModeName()}を編集中です。`);
    });
  });
}

// ========================================
// 髪エフェクト描画
// ========================================

async function drawHairEffect(
  baseCategory,
  baseNumber,
  effectCategory,
  effectNumber,
  alpha = 1,
  flip = false
) {
  if (!baseNumber || !effectNumber) return;

  const basePath = getItemPath(baseCategory, baseNumber);
  const effectPath = getItemPath(effectCategory, effectNumber);

  const colors = effectColors[effectCategory] || DEFAULT_EFFECT_COLORS;

  const cacheKey = [
    basePath,
    effectPath,
    colors.shadow,
    colors.main,
    colors.highlight
  ].join("_");

  let effectCanvas = hairEffectCache.get(cacheKey);

  if (!effectCanvas) {
    const baseImage = await loadImage(basePath);
    const maskImage = await loadImage(effectPath);

    if (!baseImage || !maskImage) return;

    const temp = document.createElement("canvas");
    temp.width = CANVAS_WIDTH;
    temp.height = CANVAS_HEIGHT;

    const tempCtx = temp.getContext("2d", {
      willReadFrequently: true
    });

    tempCtx.drawImage(
      baseImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT
    );

    const baseData = tempCtx.getImageData(
      0, 0, CANVAS_WIDTH, CANVAS_HEIGHT
    );

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = CANVAS_WIDTH;
    maskCanvas.height = CANVAS_HEIGHT;

    const maskCtx = maskCanvas.getContext("2d", {
      willReadFrequently: true
    });

    maskCtx.drawImage(
      maskImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT
    );

    const maskData = maskCtx.getImageData(
      0, 0, CANVAS_WIDTH, CANVAS_HEIGHT
    );

    const basePixels = baseData.data;
    const maskPixels = maskData.data;

    const gradientColors = getGradientColors(colors);

    for (let i = 0; i < basePixels.length; i += 4) {
      const baseAlpha = basePixels[i + 3];
      const maskAlpha = maskPixels[i + 3];

      if (baseAlpha === 0) {
        basePixels[i + 3] = 0;
        continue;
      }

      const maskBrightness = (
        0.299 * maskPixels[i] +
        0.587 * maskPixels[i + 1] +
        0.114 * maskPixels[i + 2]
      ) / 255;

      const effectAmount = maskBrightness * (maskAlpha / 255);

      if (effectAmount <= 0) {
        basePixels[i + 3] = 0;
        continue;
      }

      const brightness = (
        0.299 * basePixels[i] +
        0.587 * basePixels[i + 1] +
        0.114 * basePixels[i + 2]
      ) / 255;

      let segment = 0;

      while (
        segment < GRADIENT_POSITIONS.length - 2 &&
        brightness > GRADIENT_POSITIONS[segment + 1]
      ) {
        segment++;
      }

      const start = GRADIENT_POSITIONS[segment];
      const end = GRADIENT_POSITIONS[segment + 1];

      const amount = Math.max(
        0,
        Math.min(1, (brightness - start) / (end - start))
      );

      const result = interpolateColor(
        gradientColors[segment],
        gradientColors[segment + 1],
        amount
      );

      basePixels[i] = Math.round(result.r);
      basePixels[i + 1] = Math.round(result.g);
      basePixels[i + 2] = Math.round(result.b);

      basePixels[i + 3] = Math.round(
        baseAlpha * effectAmount
      );
    }

    tempCtx.putImageData(baseData, 0, 0);

    effectCanvas = temp;
    hairEffectCache.set(cacheKey, effectCanvas);
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  if (flip) {
    ctx.translate(CANVAS_WIDTH, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    effectCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT
  );

  ctx.restore();
}

// ========================================
// エフェクト付き髪
// ========================================

async function drawHairWithEffect(
  category,
  number,
  effectCategory,
  effectNumber,
  flip = false,
  alpha = 1
) {
  if (!number) return;

  const fillPath = getItemPath(category, number);
  const linePath = getItemPath(category, number, "_LN");

  const effectFlip = hairFlip[effectCategory] || false;

  // 髪の塗り
  await drawAsset(fillPath, alpha, flip, hairColors);

  // 髪のエフェクト
  if (effectNumber) {
    await drawHairEffect(
      category,
      number,
      effectCategory,
      effectNumber,
      alpha,
      effectFlip
    );
  }

  // 髪の線画
  await drawAsset(linePath, alpha, flip);
}

// ========================================
// 塗りと線画
// ========================================

async function drawFillAndLine(
  category,
  number,
  colorize = false,
  alpha = 1,
  flip = false
) {
  if (!number) return;

  const fillPath = getItemPath(category, number);
  const linePath = getItemPath(category, number, "_LN");

  await drawAsset(
    fillPath,
    alpha,
    flip,
    colorize ? hairColors : false
  );

  await drawAsset(linePath, alpha, flip);
}

// ========================================
// 顔パーツ
// ========================================

async function drawFaceParts(alpha = 1) {
  // 1. 白目：両目が入った共通画像
  await drawAsset(
    "assets/IC/IC00001_WH.png",
    alpha
  );

  // 2. 左目：元画像を左目位置に描画
  if (selected.IC) {
    await drawAsset(
      getItemPath("IC", selected.IC),
      alpha,
      false,
      eyeColors.left
    );

    // 3. 右目：同じ画像を左右反転
    await drawAsset(
      getItemPath("IC", selected.IC),
      alpha,
      true,
      eyeColors.right
    );
  }

  // 4. ハイライト：両目入りの共通画像
  if (selected.ICH) {
    await drawAsset(
      getItemPath("ICH", selected.ICH),
      alpha
    );
  }

  // 5. その他の顔パーツ
  await drawFillAndLine("ES", selected.ES, false, alpha);
  await drawFillAndLine("MO", selected.MO, false, alpha);
  await drawFillAndLine("BR", selected.BR, true, alpha);
}

// ========================================
// 袖
// ========================================

async function drawSleeves(category, number) {
  if (!number) return;

  const leftPath = getItemPath(category, number, "_AL");
  const rightPath = getItemPath(category, number, "_AR");

  const left = await loadImage(leftPath);
  const right = await loadImage(rightPath);

  if (left && right) {
    await drawAsset(leftPath);
    await drawAsset(rightPath);
  } else if (left) {
    await drawAsset(leftPath);
    await drawAsset(leftPath, 1, true);
  } else if (right) {
    await drawAsset(rightPath, 1, true);
    await drawAsset(rightPath);
  }
}

// ========================================
// 服
// ========================================

async function drawClothing() {
  if (selected.DR) {
    const number = selected.DR;

    await drawSleeves("DR", number);
    await drawAsset(getItemPath("DR", number));

  } else {
    if (selected.TP) {
      await drawSleeves("TP", selected.TP);
      await drawAsset(getItemPath("TP", selected.TP));
    }

    if (selected.BT) {
      await drawAsset(getItemPath("BT", selected.BT));
    }
  }
}

// ========================================
// 背面装飾
// ========================================

async function drawBackDecoration() {
  if (selected.DR) {
    const groupName = manifest?.categories?.DR?.group;
    const group = groupName ? manifest?.groups?.[groupName] : null;

    if (group?.sharedParts?.BK) {
      await drawAsset(`assets/DR/${group.sharedParts.BK}`);
    } else {
      await drawAsset(
        getItemPath("DR", selected.DR, "_BK")
      );
    }

  } else if (selected.TP) {
    await drawAsset(
      getItemPath("TP", selected.TP, "_BK")
    );
  }
}

function drawBackground() {
  if (!ctx || !canvas) return;

  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    CANVAS_HEIGHT
  );

  gradient.addColorStop(0, backgroundColors.shadow);
  gradient.addColorStop(0.5, backgroundColors.main);
  gradient.addColorStop(1, backgroundColors.highlight);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// ========================================
// キャラクター描画
// ========================================

async function renderCharacter(includeOverlay = true) {
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // 背景を描画
drawBackground();

// その後、キャラクターを描画

  // 1. 後ろ髪
  await drawHairWithEffect(
    "HB",
    selected.HB,
    "HBE",
    selected.HBE,
    hairFlip.HB
  );

  // 2. 背面装飾
  await drawBackDecoration();

  // 3. ボディ
  if (selected.SK) {
    await drawAsset(getItemPath("SK", selected.SK));
  }

  // 4. メイク
  if (selected.MK) {
    await drawAsset(getItemPath("MK", selected.MK));
  }

  // 5. 靴
  if (selected.SH) {
    await drawAsset(getItemPath("SH", selected.SH));
  }

  // 6. 服
  await drawClothing();

  if (includeOverlay && faceOverlayEnabled) {

    // 7. 前髪を通常表示（目の後ろ）
    await drawHairWithEffect(
      "HF",
      selected.HF,
      "HFE",
      selected.HFE,
      hairFlip.HF
    );

    // 8. 顔パーツを通常の濃さで描画
    await drawFaceParts();

    // 9. 前髪を60%の不透明度で重ねる
    await drawHairWithEffect(
      "HF",
      selected.HF,
      "HFE",
      selected.HFE,
      hairFlip.HF,
      0.6
    );

  } else {

    // 通常表示：顔パーツの上に前髪を描画
    await drawFaceParts();

    await drawHairWithEffect(
      "HF",
      selected.HF,
      "HFE",
      selected.HFE,
      hairFlip.HF
    );
  }

  // 10. 髪飾り
  if (selected.HA) {
    await drawAsset(getItemPath("HA", selected.HA));
  }
}

// ========================================
// 髪の左右反転
// ========================================

function updateHairFlipButton() {
  const container = document.getElementById("hair-flip-controls");
  const button = document.getElementById("hair-flip-button");

  if (!container || !button) return;

  const flipCategories = ["HF", "HB", "HFE", "HBE"];
  const isHairCategory = flipCategories.includes(currentCategory);

  container.style.display = isHairCategory ? "flex" : "none";

  if (!isHairCategory) return;

  button.textContent = hairFlip[currentCategory]
    ? "↔ 反転中（元に戻す）"
    : "↔ 左右反転";

  button.style.background = hairFlip[currentCategory]
    ? "#ffe4f1"
    : "#fffafd";
}

function setupHairFlipButtons() {
  const container = document.createElement("div");
  container.id = "hair-flip-controls";

  container.style.display = "none";
  container.style.gap = "8px";
  container.style.margin = "10px 0";
  container.style.justifyContent = "center";
  container.style.flexWrap = "wrap";

  const button = document.createElement("button");
  button.type = "button";
  button.id = "hair-flip-button";
  button.textContent = "↔ 左右反転";

  button.style.padding = "10px 18px";
  button.style.borderRadius = "20px";
  button.style.border = "1px solid #edb7d0";
  button.style.background = "#fffafd";
  button.style.color = "#bd6792";
  button.style.cursor = "pointer";

  container.appendChild(button);
  categoryTitle.after(container);

  button.addEventListener("click", async () => {
    const flipCategories = ["HF", "HB", "HFE", "HBE"];

    if (!flipCategories.includes(currentCategory)) {
      return;
    }

    hairFlip[currentCategory] = !hairFlip[currentCategory];

    updateHairFlipButton();
    await renderCharacter();
  });

  updateHairFlipButton();
}

// ========================================
// カテゴリ選択
// ========================================

function createCategoryButtons() {
  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", async () => {
      currentCategory = button.dataset.category;

      document.querySelectorAll("[data-category]").forEach(el => {
        el.classList.remove("active");
      });

      button.classList.add("active");

      categoryTitle.textContent =
        CATEGORY_NAMES[currentCategory] || currentCategory;

      updateHairFlipButton();
      renderItemList();

      await renderCharacter();
    });
  });
}

// ========================================
// アイテム一覧
// ========================================

function renderItemList() {
  itemList.innerHTML = "";

  const count = getCategoryCount(currentCategory);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "item-remove-button";
  removeButton.textContent = "× このパーツを外す";

  removeButton.addEventListener("click", async () => {
    selected[currentCategory] = null;

    if (currentCategory === "DR") {
      selected.TP = null;
      selected.BT = null;
    } else if (
      currentCategory === "TP" ||
      currentCategory === "BT"
    ) {
      selected.DR = null;
    }

    renderItemList();
    await renderCharacter();
  });

  itemList.appendChild(removeButton);

  if (!count) {
    const message = document.createElement("p");
    message.textContent =
      "このカテゴリにはまだアイテムがありません。";

    itemList.appendChild(message);
    return;
  }

  for (let number = 1; number <= count; number++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item-button";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = getItemPath(currentCategory, number);
    img.alt = `${CATEGORY_NAMES[currentCategory]} ${number}`;

    const label = document.createElement("span");
    label.textContent = String(number).padStart(2, "0");

    button.append(img, label);

    if (getSelectedNumber(currentCategory) === number) {
      button.classList.add("active");
    }

    button.addEventListener("click", async () => {
      selectItem(currentCategory, number);
      renderItemList();
      await renderCharacter();
    });

    itemList.appendChild(button);
  }
}

// ========================================
// アイテム選択ルール
// ========================================

function selectItem(category, number) {
  if (category === "DR") {
    selected.DR = number;
    selected.TP = null;
    selected.BT = null;
    return;
  }

  if (category === "TP" || category === "BT") {
    selected.DR = null;
    selected[category] = number;
    return;
  }

  selected[category] = number;
}

// ========================================
// 顔パーツ半透明表示
// ========================================

function setupFaceOverlay() {
  const checkbox = document.getElementById("face-overlay");

  if (!checkbox) return;

  checkbox.addEventListener("change", async event => {
    faceOverlayEnabled = event.target.checked;
    await renderCharacter();
  });
}

// ========================================
// ズーム
// ========================================

function setupZoom() {
  const slider = document.getElementById("preview-zoom");
  const valueLabel = document.getElementById("zoom-value");
  const resetButton = document.getElementById("zoom-reset");

  if (!slider || !valueLabel || !resetButton || !canvas) return;

  function updateZoom() {
    const zoom = Number(slider.value);

    canvas.style.transform = `scale(${zoom})`;
    valueLabel.textContent = `${Math.round(zoom * 100)}%`;
  }

  slider.addEventListener("input", updateZoom);

  resetButton.addEventListener("click", () => {
    slider.value = 1;
    updateZoom();
  });

  updateZoom();
}

// ========================================
// 全体リセット
// ========================================

function setupReset() {
  const resetButton = document.getElementById("reset-button");

  if (!resetButton) return;

  resetButton.addEventListener("click", async () => {
    Object.keys(selected).forEach(key => {
      selected[key] = 1;
    });

    selected.TP = null;
    selected.BT = null;
    selected.HA = null;
    selected.MK = null;
    selected.HBE = null;
    selected.HFE = null;

    hairColors = { ...DEFAULT_HAIR_COLORS };

    backgroundColors = { ...DEFAULT_BACKGROUND_COLORS };
    
    effectColors = {
      HFE: { ...DEFAULT_EFFECT_COLORS },
      HBE: { ...DEFAULT_EFFECT_COLORS }
    };

    eyeColors = {
      left: { ...DEFAULT_EYE_COLORS },
      right: { ...DEFAULT_EYE_COLORS }
    };

    currentColorMode = "hair";
    currentHairStop = "shadow";
    currentHairHue = 0;

    document.querySelectorAll(".color-mode-button").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.colorMode === "hair"
      );
    });

    clearColorCaches();

    hairFlip.HF = false;
    hairFlip.HB = false;
    hairFlip.HFE = false;
    hairFlip.HBE = false;

    faceOverlayEnabled = false;

    const faceOverlay = document.getElementById("face-overlay");

    if (faceOverlay) {
      faceOverlay.checked = false;
    }

    const zoomSlider = document.getElementById("preview-zoom");
    const zoomValue = document.getElementById("zoom-value");

    if (zoomSlider) {
      zoomSlider.value = 1;
    }

    if (canvas) {
      canvas.style.transform = "scale(1)";
    }

    if (zoomValue) {
      zoomValue.textContent = "100%";
    }

    updateHairPalette();

    document.querySelectorAll("[data-category]").forEach(el => {
      el.classList.remove("active");
    });

    const initialCategoryButton = document.querySelector(
      '[data-category="HF"]'
    );

    if (initialCategoryButton) {
      initialCategoryButton.classList.add("active");
    }

    currentCategory = "HF";

    if (categoryTitle) {
      categoryTitle.textContent = CATEGORY_NAMES.HF;
    }

    updateHairFlipButton();
    renderItemList();

    await renderCharacter();

    updateStatus("初期状態に戻しました。");
  });
}

// ========================================
// PNG保存
// ========================================


function setupDownload() {
  const downloadButton = document.getElementById("download-button");

  if (!downloadButton) return;

  downloadButton.addEventListener("click", async () => {
    updateStatus("画像を作成しています…");

    // 現在の表示設定を反映して描画
    await renderCharacter();

    canvas.toBlob(blob => {
      if (!blob) {
        updateStatus("画像の保存に失敗しました。");
        renderCharacter();
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "maidol_dressup.png";
      link.click();

      URL.revokeObjectURL(url);

      updateStatus("PNGを保存しました。");

      renderCharacter();
    }, "image/png");
  });
}


// ========================================
// 初期化
// ========================================

async function initialize() {
  try {
    if (!canvas || !ctx) {
      throw new Error("プレビュー用canvasが見つかりません。");
    }

    if (!itemList || !categoryTitle || !statusMessage) {
      throw new Error("HTML内の必要な要素が見つかりません。");
    }

    updateStatus("データを読み込んでいます…");

    const response = await fetch("manifest.json");

    if (!response.ok) {
      throw new Error(
        `manifest.jsonの読み込みに失敗しました（${response.status}）`
      );
    }

    manifest = await response.json();

    if (!manifest.categories) {
      throw new Error("manifest.jsonにcategoriesがありません。");
    }

    if (!manifest.categories.IC) {
      throw new Error("manifest.jsonにICカテゴリがありません。");
    }

    if (!manifest.categories.ICH) {
      throw new Error("manifest.jsonにICHカテゴリがありません。");
    }

    createHairColorButtons();
    setupColorModeButtons();
    createCategoryButtons();
    setupHairFlipButtons();
    setupZoom();
    setupFaceOverlay();
    setupReset();
    setupDownload();

    categoryTitle.textContent = CATEGORY_NAMES[currentCategory];

    renderItemList();

    await renderCharacter();

    updateStatus("読み込みが完了しました。");

  } catch (error) {
    console.error("きせかえ初期化エラー:", error);
    updateStatus("エラー：" + error.message);
  }
}

initialize();
