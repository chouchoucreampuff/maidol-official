
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

// 17色相の基準色（以前のメインカラーを使用）
const HAIR_HUES = [
  { name: "赤", base: "#D94355" },
  { name: "オレンジ", base: "#E97835" },
  { name: "黄色", base: "#EBC34B" },
  { name: "緑", base: "#329765" },
  { name: "黄緑", base: "#9ABF3E" },
  { name: "ミント", base: "#65C8B0" },
  { name: "水色", base: "#68BCE5" },
  { name: "青", base: "#456FC9" },
  { name: "濃い紫", base: "#75418E" },
  { name: "薄紫", base: "#B49AD1" },
  { name: "濃いピンク", base: "#D84F91" },
  { name: "薄ピンク", base: "#F0A6C6" },
  { name: "ベージュ", base: "#C6A77A" },
  { name: "グレージュ", base: "#A49A91" },
  { name: "ブラウン", base: "#805238" },
  { name: "黒", base: "#343744" },
  { name: "白", base: "#C5C2C8" }
];

// 彩度：低・中・高
const HAIR_SATURATION_LEVELS = [0.30, 0.60, 0.90];

// 明度：明・中・暗
const HAIR_LIGHTNESS_LEVELS = [0.80, 0.55, 0.30];


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

// 現在選択中の色相
let currentHairHue = 0;

const selected = {
  SK: 1,
  HB: null,
  HF: null,
  HA: null,
  ES: null,
  IC: null,
  BR: null,
  MO: null,
  MK: null,
  DR: null,
  TP: null,
  BT: null,
  SH: null
};

// 前髪と後ろ髪は別々に反転
const hairFlip = {
  HF: false,
  HB: false
};

// 画像キャッシュ
const imageCache = new Map();
const coloredImageCache = new Map();

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
// 髪色変更
// ========================================

function hexToRgb(hex) {
  const value = hex.replace("#", "");

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

// 2色間を補間
function interpolateColor(color1, color2, amount) {
  return {
    r: color1.r + (color2.r - color1.r) * amount,
    g: color1.g + (color2.g - color1.g) * amount,
    b: color1.b + (color2.b - color1.b) * amount
  };
}

// 現在の髪色からグラデーションを作成
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

// HEX → RGB
function hexToRgb(hex) {
  const value = hex.replace("#", "");

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

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

// 色相ごとに3×3の色を自動生成
function generateHairPalette(hueIndex) {
  const base = hexToRgb(HAIR_HUES[hueIndex].base);
  const hsl = rgbToHsl(base.r, base.g, base.b);

  const palette = [];

  HAIR_LIGHTNESS_LEVELS.forEach(lightness => {
    HAIR_SATURATION_LEVELS.forEach(saturation => {
      palette.push(
        hslToHex(
          hsl.h,
          saturation,
          lightness
        )
      );
    });
  });

  return palette;
}

// パレット画面を作成
function createHairColorButtons() {
  const container = document.getElementById("hair-color-list");
  if (!container) return;

  // 色相ボタン
  const hueList = document.getElementById("hair-hue-list");

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
  const shadeList = document.getElementById("hair-shade-list");

  if (!hueList || !shadeList) return;

  // 色相ボタンの選択状態
  hueList.querySelectorAll(".hair-hue-button").forEach((button, index) => {
    button.classList.toggle(
      "active",
      index === currentHairHue
    );
  });

  // 色相名
  document.getElementById("hair-hue-name").textContent =
    HAIR_HUES[currentHairHue].name;

  // 色の一覧を生成
  const colors = generateHairPalette(currentHairHue);

  shadeList.innerHTML = "";

  colors.forEach((color, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "hair-shade-button";
    button.style.backgroundColor = color;
    button.title = color;

    button.classList.toggle(
      "active",
      hairColors[currentHairStop] === color
    );

    button.addEventListener("click", async () => {
      hairColors[currentHairStop] = color;

      coloredImageCache.clear();

      updateHairPalette();
      await renderCharacter();

      updateStatus(
        `${currentHairStop === "shadow" ? "影" :
          currentHairStop === "main" ? "メイン" :
          "ハイライト"}の色を変更しました。`
      );
    });

    shadeList.appendChild(button);
  });

  // 色の表示
  document.getElementById("hair-selected-color").textContent =
    hairColors[currentHairStop];

  // 編集中のタブ
  document.querySelectorAll(".hair-color-tab").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.stop === currentHairStop
    );
  });
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
  await drawFillAndLine(
    "HB",
    selected.HB,
    true,
    1,
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
  await drawFillAndLine(
    "HF",
    selected.HF,
    true,
    1,
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

  if (!count) {
    itemList.textContent = "このカテゴリにはまだアイテムがありません。";
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

      document.querySelectorAll(".item-button").forEach(el => {
        el.classList.remove("active");
      });

      button.classList.add("active");

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
  document.getElementById("reset-button").addEventListener("click", async () => {
    Object.keys(selected).forEach(key => {
      selected[key] = null;
    });

    selected.SK = 1;

  // 髪色を初期グレースケールに戻す
hairColors = { ...DEFAULT_HAIR_COLORS };
currentHairStop = "shadow";
currentHairHue = 0;
coloredImageCache.clear();

    hairFlip.HF = false;
    hairFlip.HB = false;

    faceOverlayEnabled = false;
    document.getElementById("face-overlay").checked = false;

    const zoomSlider = document.getElementById("preview-zoom");

    zoomSlider.value = 1;
    canvas.style.transform = "scale(1)";
    document.getElementById("zoom-value").textContent = "100%";

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
    categoryTitle.textContent = CATEGORY_NAMES.HF;

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
  document.getElementById("download-button").addEventListener("click", async () => {
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
