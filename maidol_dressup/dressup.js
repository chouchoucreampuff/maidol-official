
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

// 髪色のカラーコード
// stopsの位置は暗い順に10%、30%、65%、100%です。
// ここを書き換えると、髪色プリセットを変更できます。
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

const canvas = document.getElementById("character-canvas");
const ctx = canvas.getContext("2d");

const itemList = document.getElementById("item-list");
const categoryTitle = document.getElementById("category-title");
const statusMessage = document.getElementById("status-message");

let manifest = null;
let currentCategory = "HF";
let currentHairColor = 0;
let eyeTarget = "both";
let sameEyeColor = true;
let faceOverlayEnabled = false;

const selected = {
  SK: 1,
  HB: null,
  HF: null,
  HA: null,
  ES: null,
  IC_LEFT: null,
  IC_RIGHT: null,
  BR: null,
  MO: null,
  MK: null,
  DR: null,
  TP: null,
  BT: null,
  SH: null
};

const imageCache = new Map();
const coloredImageCache = new Map();

function assetPath(category, number, suffix = "") {
  const id = String(number).padStart(5, "0");
  return `assets/${category}/${category}${id}${suffix}.png`;
}

function loadImage(path) {
  if (imageCache.has(path)) {
    return imageCache.get(path);
  }

  const promise = new Promise(resolve => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);

    img.src = path;
  });

  imageCache.set(path, promise);
  return promise;
}

async function drawAsset(path, alpha = 1, flip = false, colorize = false) {
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

// グレースケール画像の明るさを4色のグラデーションに変換
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
    const alpha = pixels[i + 3];

    if (alpha === 0) continue;

    // グレースケールの明るさを基準にする
    const brightness =
      (0.299 * pixels[i] +
       0.587 * pixels[i + 1] +
       0.114 * pixels[i + 2]) / 255;

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
    // 元画像の透明度は維持する
  }

  tempCtx.putImageData(imageData, 0, 0);

  coloredImageCache.set(cacheKey, temp);
  return temp;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function getSelectedNumber(category) {
  return selected[category];
}

function setSelectedNumber(category, number) {
  selected[category] = number;
}

function getCategoryCount(category) {
  return manifest?.categories?.[category]?.count || 0;
}

function getItemPath(category, number, suffix = "") {
  return assetPath(category, number, suffix);
}

async function drawFillAndLine(category, number, colorize = false, alpha = 1) {
  if (!number) return;

  const fillPath = getItemPath(category, number);
  const linePath = getItemPath(category, number, "_LN");

  if (colorize) {
    await drawAsset(fillPath, alpha, false, true);
  } else {
    await drawAsset(fillPath, alpha);
  }

  await drawAsset(linePath, alpha);
}

async function drawFaceParts(alpha = 1) {
  await drawFillAndLine("ES", selected.ES, false, alpha);

  if (selected.IC_LEFT && selected.IC_RIGHT &&
      selected.IC_LEFT === selected.IC_RIGHT) {
    await drawAsset(
      getItemPath("IC", selected.IC_LEFT),
      alpha
    );
  } else {
    // 左右の瞳の色を別々に配置するため、
    // 左右別の画像がある場合は左右の画像を使用する。
    // 通常のIC画像は左右両目用として描画する。
    if (selected.IC_LEFT) {
      await drawAsset(
        getItemPath("IC", selected.IC_LEFT),
        alpha
      );
    }
  }

  await drawFillAndLine("MO", selected.MO, false, alpha);
  await drawFillAndLine("BR", selected.BR, true, alpha);
}

async function drawHair() {
  await drawFillAndLine("HF", selected.HF, true);
  await drawFillAndLine("HB", selected.HB, true);
}


async function drawClothing() {
  if (selected.DR) {
    const number = selected.DR;
    const groupName = manifest.categories.DR.group;
    const group = groupName ? manifest.groups[groupName] : null;

    // ワンピースの背面装飾
    if (group?.sharedParts?.BK) {
      await drawAsset(`assets/DR/${group.sharedParts.BK}`);
    } else {
      await drawAsset(getItemPath("DR", number, "_BK"));
    }

    // 袖
    await drawSleeves("DR", number);

    // 服本体
    await drawAsset(getItemPath("DR", number));
  } else {
    // トップスの背面装飾
    if (selected.TP) {
      await drawAsset(getItemPath("TP", selected.TP, "_BK"));
      await drawSleeves("TP", selected.TP);
      await drawAsset(getItemPath("TP", selected.TP));
    }

    // ボトムス
    if (selected.BT) {
      await drawAsset(getItemPath("BT", selected.BT));
    }
  }
}

async function drawSleeves(category, number) {
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


async function renderCharacter(includeOverlay = true) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 1. 後ろ髪（最背面）
  await drawFillAndLine("HB", selected.HB, true);

  // 2. 服・背面装飾・袖・服本体
  await drawClothing();

  // 3. 身体
  await drawAsset(getItemPath("SK", selected.SK));

  // 4. 靴
  await drawAsset(getItemPath("SH", selected.SH));

  // 5. メイク
  await drawAsset(getItemPath("MK", selected.MK));

  // 6. 顔パーツの半透明プレビュー
  if (
    includeOverlay &&
    currentCategory === "HF" &&
    faceOverlayEnabled
  ) {
    await drawFaceParts(0.45);
  }

  // 7. 顔パーツ
  await drawFillAndLine("ES", selected.ES);
  await drawEyes();
  await drawFillAndLine("MO", selected.MO);
  await drawFillAndLine("BR", selected.BR, true);

  // 8. 前髪
  await drawFillAndLine("HF", selected.HF, true);

  // 9. 髪飾り（最前面）
  await drawAsset(getItemPath("HA", selected.HA));
}


async function drawEyes() {
  if (!selected.IC_LEFT) return;

  if (sameEyeColor || selected.IC_LEFT === selected.IC_RIGHT) {
    await drawAsset(getItemPath("IC", selected.IC_LEFT));
    return;
  }

  // 左右別々の画像を用意している場合に対応するための枠。
  // 現在のIC画像が両目一体型の場合は左右同色で表示されます。
  await drawAsset(getItemPath("IC", selected.IC_LEFT));
}

function updateStatus(message) {
  statusMessage.textContent = message;
}

function createHairColorButtons() {
  const container = document.getElementById("hair-color-list");
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

function createCategoryButtons() {
  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", async () => {
      currentCategory = button.dataset.category;

      document.querySelectorAll("[data-category]").forEach(el => {
        el.classList.remove("active");
      });

      button.classList.add("active");

      categoryTitle.textContent = CATEGORY_NAMES[currentCategory];

      renderItemList();
      await renderCharacter();
    });
  });
}

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

    const currentSelection =
      currentCategory === "IC"
        ? selected.IC_LEFT
        : getSelectedNumber(currentCategory);

    if (currentSelection === number) {
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

function selectItem(category, number) {
  if (category === "IC") {
    if (sameEyeColor || eyeTarget === "both") {
      selected.IC_LEFT = number;
      selected.IC_RIGHT = number;
    } else if (eyeTarget === "left") {
      selected.IC_LEFT = number;
    } else {
      selected.IC_RIGHT = number;
    }

    return;
  }

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

function setupEyeControls() {
  document.querySelectorAll("[data-eye-target]").forEach(button => {
    button.addEventListener("click", () => {
      eyeTarget = button.dataset.eyeTarget;

      document.querySelectorAll("[data-eye-target]").forEach(el => {
        el.classList.remove("active");
      });

      button.classList.add("active");
    });
  });

  document.getElementById("same-eye-color").addEventListener("change", event => {
    sameEyeColor = event.target.checked;

    if (sameEyeColor) {
      selected.IC_RIGHT = selected.IC_LEFT;
      eyeTarget = "both";

      document.querySelectorAll("[data-eye-target]").forEach(el => {
        el.classList.remove("active");
      });

      document.querySelector('[data-eye-target="both"]')
        .classList.add("active");
    }

    renderCharacter();
  });
}

function setupFaceOverlay() {
  document.getElementById("face-overlay").addEventListener("change", event => {
    faceOverlayEnabled = event.target.checked;
    renderCharacter();
  });
}

function setupReset() {
  document.getElementById("reset-button").addEventListener("click", async () => {
    Object.keys(selected).forEach(key => {
      selected[key] = null;
    });

    selected.SK = 1;

    currentHairColor = 0;
    sameEyeColor = true;
    eyeTarget = "both";

    document.getElementById("same-eye-color").checked = true;
    document.getElementById("face-overlay").checked = false;
    faceOverlayEnabled = false;

    createHairColorButtons();
    renderItemList();
    await renderCharacter();

    updateStatus("初期状態に戻しました。");
  });
}

function setupDownload() {
  document.getElementById("download-button").addEventListener("click", async () => {
    updateStatus("画像を作成しています…");

    await renderCharacter(false);

    canvas.toBlob(blob => {
      if (!blob) {
        updateStatus("画像の保存に失敗しました。");
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

async function initialize() {
  try {
    const response = await fetch("manifest.json");

    if (!response.ok) {
      throw new Error("manifest.jsonを読み込めませんでした。");
    }

    manifest = await response.json();

    createHairColorButtons();
    createCategoryButtons();
    setupEyeControls();
    setupFaceOverlay();
    setupReset();
    setupDownload();

    categoryTitle.textContent = CATEGORY_NAMES[currentCategory];

    renderItemList();

    await renderCharacter();

    updateStatus("読み込みが完了しました。");
  } catch (error) {
    console.error(error);
    updateStatus("読み込みエラー：manifest.jsonを確認してください。");
  }
}

initialize();
