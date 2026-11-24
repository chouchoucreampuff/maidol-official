
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

// 髪色の設定
const HAIR_COLORS = [
  { name: "赤", stops: ["#79212D", "#D94355", "#FF9A9F", "#FFFFFF"] },
  { name: "オレンジ", stops: ["#873B20", "#E97835", "#FFC08A", "#FFFFFF"] },
  { name: "黄色", stops: ["#8B671D", "#EBC34B", "#FFEBA0", "#FFFFFF"] },
  { name: "緑", stops: ["#174D35", "#329765", "#9ADBB2", "#FFFFFF"] },
  { name: "黄緑", stops: ["#4C641D", "#9ABF3E", "#D8EE9B", "#FFFFFF"] },
  { name: "ミント", stops: ["#28665C", "#65C8B0", "#B9F1DC", "#FFFFFF"] },
  { name: "水色", stops: ["#285A7C", "#68BCE5", "#BCEAFF", "#FFFFFF"] },
  { name: "青", stops: ["#263D7A", "#456FC9", "#A2BFFF", "#FFFFFF"] },
  { name: "濃い紫", stops: ["#42234F", "#75418E", "#C29BD8", "#FFFFFF"] },
  { name: "薄紫", stops: ["#675078", "#B49AD1", "#E5D5F4", "#FFFFFF"] },
  { name: "濃いピンク", stops: ["#79264D", "#D84F91", "#F6A6CB", "#FFFFFF"] },
  { name: "薄ピンク", stops: ["#92566F", "#F0A6C6", "#FFDAEA", "#FFFFFF"] },
  { name: "ベージュ", stops: ["#776044", "#C6A77A", "#EAD7B6", "#FFFFFF"] },
  { name: "グレージュ", stops: ["#514B48", "#A49A91", "#D9D1C9", "#FFFFFF"] },
  { name: "ブラウン", stops: ["#43291F", "#805238", "#C99A70", "#FFFFFF"] },
  { name: "黒", stops: ["#171923", "#343744", "#858A9A", "#FFFFFF"] },
  { name: "白", stops: ["#77747A", "#C5C2C8", "#EEEEF2", "#FFFFFF"] }
];

const GRADIENT_POSITIONS = [0.10, 0.30, 0.65, 1.00];


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
let currentHairColor = 0;
let faceOverlayEnabled = false;

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

// 読み込んだ画像を保存
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
    img = await getColoredImage(path, currentHairColor);
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

async function getColoredImage(path, colorIndex) {
  const cacheKey = `${path}_${colorIndex}`;

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
  const colors = HAIR_COLORS[colorIndex].stops.map(hexToRgb);

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

    const c1 = colors[segment];
    const c2 = colors[segment + 1];

    pixels[i] = Math.round(c1.r + (c2.r - c1.r) * amount);
    pixels[i + 1] = Math.round(c1.g + (c2.g - c1.g) * amount);
    pixels[i + 2] = Math.round(c1.b + (c2.b - c1.b) * amount);
  }

  tempCtx.putImageData(imageData, 0, 0);

  coloredImageCache.set(cacheKey, temp);

  return temp;
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
  // 1. 瞳の色
  if (selected.IC) {
    await drawAsset(
      getItemPath("IC", selected.IC),
      alpha
    );
  }

  // 2. 目の形
  await drawFillAndLine("ES", selected.ES, false, alpha);

  // 3. 口
  await drawFillAndLine("MO", selected.MO, false, alpha);

  // 4. 眉毛
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

    // 袖を先に描画
    await drawSleeves("DR", number);

    // ワンピース本体
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
// ヘアカラー選択
// ========================================

function createHairColorButtons() {
  const container = document.getElementById("hair-color-list");

  if (!container) return;

  container.innerHTML = "";

  HAIR_COLORS.forEach((color, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-button";

    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.background = color.stops[1];

    const name = document.createElement("span");
    name.textContent = color.name;

    button.append(swatch, name);

    if (index === currentHairColor) {
      button.classList.add("active");
    }

    button.addEventListener("click", async () => {
      currentHairColor = index;

      document.querySelectorAll(".color-button").forEach(el => {
        el.classList.remove("active");
      });

      button.classList.add("active");

      await renderCharacter();
    });

    container.appendChild(button);
  });
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

    currentHairColor = 0;

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

    // オーバーレイを含めずに描画
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

      // 通常のプレビューに戻す
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

// ページ読み込み後に起動
initialize();
