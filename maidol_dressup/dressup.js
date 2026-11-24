
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
// 髪色設定画面
// ========================================

function createHairColorButtons() {
  const container = document.getElementById("hair-color-list");
  if (!container) return;

  container.innerHTML = "";

  const settings = [
    {
      key: "shadow",
      label: "シェーダー",
      description: "10%・影色"
    },
    {
      key: "main",
      label: "メイン",
      description: "30%・基本色"
    },
    {
      key: "highlight",
      label: "ハイライト",
      description: "65%・明るい色"
    }
  ];

  settings.forEach(setting => {
    const row = document.createElement("div");
    row.className = "hair-color-editor";

    const labelArea = document.createElement("div");
    labelArea.className = "hair-color-label";

    const title = document.createElement("strong");
    title.textContent = setting.label;

    const description = document.createElement("small");
    description.textContent = setting.description;

    labelArea.append(title, description);

    const picker = document.createElement("input");
    picker.type = "color";
    picker.className = "hair-color-picker";
    picker.value = hairColors[setting.key];
    picker.setAttribute("aria-label", setting.label + "の色");

    const code = document.createElement("input");
    code.type = "text";
    code.className = "hair-color-code";
    code.value = hairColors[setting.key];
    code.maxLength = 7;
    code.spellcheck = false;
    code.setAttribute("aria-label", setting.label + "のカラーコード");
    code.placeholder = "#FFFFFF";

    // カラーピッカーから変更
    picker.addEventListener("input", async () => {
      hairColors[setting.key] = picker.value.toUpperCase();
      code.value = picker.value.toUpperCase();

      coloredImageCache.clear();
      await renderCharacter();
    });

    // カラーコードから変更
    code.addEventListener("input", async () => {
      const value = code.value.trim();

      if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
        code.classList.add("invalid");
        return;
      }

      code.classList.remove("invalid");

      hairColors[setting.key] = value.toUpperCase();
      picker.value = value;

      coloredImageCache.clear();
      await renderCharacter();
    });

    row.append(labelArea, picker, code);
    container.appendChild(row);
  });

  // 初期カラーに戻す
  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "hair-color-reset";
  resetButton.textContent = "♡ 髪色を初期状態に戻す";

  resetButton.addEventListener("click", async () => {
    hairColors = { ...DEFAULT_HAIR_COLORS };
    coloredImageCache.clear();

    createHairColorButtons();
    await renderCharacter();

    updateStatus("髪色を初期状態に戻しました。");
  });

  container.appendChild(resetButton);
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
    coloredImageCache.clear();

    hairFlip.HF = false;
    hairFlip.HB = false;

    faceOverlayEnabled = false;
    document.getElementById("face-overlay").checked = false;

    const zoomSlider = document.getElementById("preview-zoom");

    zoomSlider.value = 1;
    canvas.style.transform = "scale(1)";
    document.getElementById("zoom-value").textContent = "100%";

    createHairColorButtons();

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
