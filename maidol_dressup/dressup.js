
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
  BR: "眉毛",
  MO: "口",
  MK: "メイク",
  DR: "ワンピース",
  TP: "トップス",
  BT: "ボトムス",
  SH: "靴"
};

// グラデーション位置
const GRADIENT_POSITIONS = [0.10, 0.30, 0.65, 1.00];

// 初期カラー（グレースケール）
const DEFAULT_HAIR_COLORS = {
  shadow: "#666666",
  main: "#AAAAAA",
  highlight: "#EEEEEE"
};

// 14色相＋モノトーン
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

// ユーザーが設定する髪色
let hairColors = { ...DEFAULT_HAIR_COLORS };

// 現在編集中のグラデーション色
let currentHairStop = "shadow";

// ========================================
// カラーモード
// ========================================

// hair = 通常の髪色
// effect = 前髪・後ろ髪エフェクト共通色
let currentColorMode = "hair";

// エフェクト共通カラー
const DEFAULT_EFFECT_COLORS = {
  shadow: "#666666",
  main: "#AAAAAA",
  highlight: "#EEEEEE"
};

let effectColors = {
  ...DEFAULT_EFFECT_COLORS
};

// 現在選択中の色相
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
  BR: 1,
  MO: 1,
  MK: null,
  DR: 1,
  TP: null,
  BT: null,
  SH: 1
};

// 前髪と後ろ髪は別々に反転
const hairFlip = {
  HF: false,
  HB: false
};

// 画像キャッシュ
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
    img = await getColoredImage(path);
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
// 色変換・補間
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

// ========================================
// 髪色変更
// ========================================

function getGradientColors() {
  return [
    hexToRgb(hairColors.shadow),
    hexToRgb(hairColors.main),
    hexToRgb(hairColors.highlight),
    { r: 255, g: 255, b: 255 }
  ];
}

async function getColoredImage(path) {
  const cacheKey = [
    path,
    hairColors.shadow,
    hairColors.main,
    hairColors.highlight
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
  const colors = getGradientColors();

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
// パレット式ヘアカラー
// ========================================

// RGB → HSL
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

// HSL → HEX
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

// 色相ごとに3×4の色を自動生成
function generateHairPalette(hueIndex) {
  const selectedHue = HAIR_HUES[hueIndex];

  // モノトーン専用12色
  if (selectedHue.hue === null) {
    return [
      "#FFFFFF", "#F5F5F5", "#EBEBEB",
      "#DCDCDC", "#CCCCCC", "#BBBBBB",
      "#AAAAAA", "#999999", "#858585",
      "#707070", "#505050", "#303030"
    ];
  }

  // 通常色は彩度3段階×明度4段階
  const palette = [];
  const hue = selectedHue.hue;

  HAIR_LIGHTNESS_LEVELS.forEach(lightness => {
    HAIR_SATURATION_LEVELS.forEach(saturation => {
      palette.push(hslToHex(hue, saturation, lightness));
    });
  });

  return palette;
}

// ========================================
// パレット画面
// ========================================

function createHairColorButtons() {
  const container = document.getElementById("hair-color-list");
  if (!container) return;

  // 色相ボタン
  const hueList = document.getElementById("hair-hue-list");

  if (!hueList) return;

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

  // 影・メイン・ハイライト切り替え
  container.querySelectorAll(".hair-color-tab").forEach(button => {
    button.addEventListener("click", () => {
      currentHairStop = button.dataset.stop;
      updateHairPalette();
    });
  });

  // 初期状態に戻すボタン
  const resetButton = document.createElement("button");

  resetButton.type = "button";
  resetButton.className = "hair-color-reset";
  resetButton.textContent = "♡ 髪色を初期状態に戻す";

  resetButton.addEventListener("click", async () => {
    hairColors = { ...DEFAULT_HAIR_COLORS };

    currentHairStop = "shadow";
    currentHairHue = 0;

    coloredImageCache.clear();
    hairEffectCache.clear();

    updateHairPalette();

    await renderCharacter();

    updateStatus("髪色を初期状態に戻しました。");
  });

  container.appendChild(resetButton);

  updateHairPalette();
}

// パレットの表示更新
function updateHairPalette() {
  const hueList = document.getElementById("hair-hue-list");
// ========================================
// 現在編集中のカラー取得
// ========================================

function getCurrentColorSet() {
  return currentColorMode === "effect"
    ? effectColors
    : hairColors;
}

// ========================================
// パレットの表示更新
// ========================================

function updateHairPalette() {
  const hueList = document.getElementById("hair-hue-list");
  const shadeList = document.getElementById("hair-shade-list");

  if (!hueList || !shadeList) return;

  const colorsSet = getCurrentColorSet();

  // 色相ボタンの選択状態
  hueList.querySelectorAll(".hair-hue-button").forEach((button, index) => {
    button.classList.toggle(
      "active",
      index === currentHairHue
    );
  });

  // 色相名
  const hueName = document.getElementById("hair-hue-name");

  if (hueName) {
    hueName.textContent = HAIR_HUES[currentHairHue].name;
  }

  // 色の一覧を生成
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

      if (currentColorMode === "effect") {
        hairEffectCache.clear();
      } else {
        coloredImageCache.clear();
      }

      updateHairPalette();

      await renderCharacter();

      const stopName =
        currentHairStop === "shadow" ? "影" :
        currentHairStop === "main" ? "メイン" :
        "ハイライト";

      const modeName =
        currentColorMode === "effect" ? "エフェクトカラー" : "ヘアカラー";

      updateStatus(`${modeName}の${stopName}色を変更しました。`);
    });

    shadeList.appendChild(button);
  });

  // 選択色の表示
  const selectedColor = document.getElementById("hair-selected-color");

  if (selectedColor) {
    selectedColor.textContent = colorsSet[currentHairStop];
  }

  // 編集中のタブ
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

      if (currentColorMode === mode) return;

      currentColorMode = mode;

      // ボタンの選択状態を更新
      buttons.forEach(btn => {
        btn.classList.toggle(
          "active",
          btn.dataset.colorMode === currentColorMode
        );
      });

      // パレットを更新
      updateHairPalette();

      // キャラクターを再描画
      await renderCharacter();

      updateStatus(
        currentColorMode === "effect"
          ? "エフェクトカラーを編集中です。"
          : "ヘアカラーを編集中です。"
      );
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

 const colors = effectColors;

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

    // 元の髪画像を読み込む
    tempCtx.drawImage(
      baseImage,
      0, 0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    const baseData = tempCtx.getImageData(
      0, 0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    // マスク画像を読み込む
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = CANVAS_WIDTH;
    maskCanvas.height = CANVAS_HEIGHT;

    const maskCtx = maskCanvas.getContext("2d", {
      willReadFrequently: true
    });

    maskCtx.drawImage(
      maskImage,
      0, 0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    const maskData = maskCtx.getImageData(
      0, 0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    const basePixels = baseData.data;
    const maskPixels = maskData.data;

    const gradientColors = [
      hexToRgb(colors.shadow),
      hexToRgb(colors.main),
      hexToRgb(colors.highlight),
      { r: 255, g: 255, b: 255 }
    ];

    for (let i = 0; i < basePixels.length; i += 4) {
      const baseAlpha = basePixels[i + 3];
      const maskAlpha = maskPixels[i + 3];

      // 髪の外側は透明
      if (baseAlpha === 0) {
        basePixels[i + 3] = 0;
        continue;
      }

      // マスクの明るさを効果の強さとして使用
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

      // 元の髪画像の明るさでグラデーションを決定
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

      // マスクの明るさに応じて透明度を設定
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
    effectCanvas,
    0, 0,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );

  ctx.restore();
}

// ========================================
// エフェクト付き髪の描画
// ========================================

async function drawHairWithEffect(
  category,
  number,
  effectCategory,
  effectNumber,
  flip = false
) {
  if (!number) return;

  const fillPath = getItemPath(category, number);
  const linePath = getItemPath(category, number, "_LN");

  // 1. 髪の塗り
  await drawAsset(fillPath, 1, flip, true);

  // 2. エフェクト
  if (effectNumber) {
    await drawHairEffect(
      category,
      number,
      effectCategory,
      effectNumber,
      1,
      flip
    );
  }

  // 3. 線画
  await drawAsset(linePath, 1, flip);
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

  await drawAsset(fillPath, alpha, flip, colorize);
  await drawAsset(linePath, alpha, flip);
}

// ========================================
// 顔パーツ
// ========================================

async function drawFaceParts(alpha = 1) {
  if (selected.IC) {
    await drawAsset(getItemPath("IC", selected.IC), alpha);
  }

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
      await drawAsset(getItemPath("DR", selected.DR, "_BK"));
    }

  } else if (selected.TP) {
    await drawAsset(getItemPath("TP", selected.TP, "_BK"));
  }
}

// ========================================
// キャラクター描画
// ========================================

async function renderCharacter(includeOverlay = true) {
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

  // 7. 顔パーツ
  await drawFaceParts();

  // 8. 前髪
  await drawHairWithEffect(
    "HF",
    selected.HF,
    "HFE",
    selected.HFE,
    hairFlip.HF
  );

  // 9. 半透明の顔パーツ
  if (includeOverlay && faceOverlayEnabled) {
    await drawFaceParts(0.45);
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

  const isHairCategory =
    currentCategory === "HF" || currentCategory === "HB";

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
    if (currentCategory !== "HF" && currentCategory !== "HB") {
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

      categoryTitle.textContent = CATEGORY_NAMES[currentCategory];

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

  // パーツを外すボタン
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "item-remove-button";
  removeButton.textContent = "× このパーツを外す";

  removeButton.addEventListener("click", async () => {
    selected[currentCategory] = null;

    // 服のカテゴリは関連する選択も解除
    if (currentCategory === "DR") {
      selected.TP = null;
      selected.BT = null;
    } else if (currentCategory === "TP" || currentCategory === "BT") {
      selected.DR = null;
    }

    renderItemList();
    await renderCharacter();
  });

  itemList.appendChild(removeButton);

  if (!count) {
    const message = document.createElement("p");
    message.textContent = "このカテゴリにはまだアイテムがありません。";
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
// 顔パーツの半透明表示
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
// リセット
// ========================================

function setupReset() {
  const resetButton = document.getElementById("reset-button");

  if (!resetButton) return;

  resetButton.addEventListener("click", async () => {
    // 選択パーツを初期化
    Object.keys(selected).forEach(key => {
      selected[key] = 1;
    });

    selected.TP = null;
    selected.BT = null;
    selected.HA = null;
    selected.MK = null;
    selected.HBE = null;
    selected.HFE = null;

// 通常のヘアカラーを初期化
hairColors = { ...DEFAULT_HAIR_COLORS };

// エフェクトカラーを初期化
effectColors = { ...DEFAULT_EFFECT_COLORS };

// カラーモードを通常のヘアカラーに戻す
currentColorMode = "hair";

// カラーモードボタンの表示を更新
document.querySelectorAll(".color-mode-button").forEach(button => {
  button.classList.toggle(
    "active",
    button.dataset.colorMode === "hair"
  );
});

    currentHairStop = "shadow";
    currentHairHue = 0;

    // 色変更後の画像キャッシュを消去
    coloredImageCache.clear();
    hairEffectCache.clear();

    // 髪の反転を解除
    hairFlip.HF = false;
    hairFlip.HB = false;

    // 顔パーツの半透明表示を解除
    faceOverlayEnabled = false;

    const faceOverlay = document.getElementById("face-overlay");

    if (faceOverlay) {
      faceOverlay.checked = false;
    }

    // ズームを初期化
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

    // パレット表示を更新
    updateHairPalette();

    // カテゴリを前髪に戻す
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

    await renderCharacter(false);

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
