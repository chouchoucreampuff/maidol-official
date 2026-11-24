
const CATEGORY_NAMES = {
  SK: "素体",
  HB: "後ろ髪",
  HF: "前髪",
  HA: "髪飾り",
  ES: "目の形",
  IC: "瞳の色",
  BR: "眉",
  MO: "口",
  MK: "メイク",
  DR: "ワンピース",
  TP: "トップス",
  BT: "ボトムス",
  SH: "シューズ"
};

let manifest = null;
let currentCategory = "SK";

const selectedItems = {};

const categoryButtons = document.querySelectorAll(".category-button");
const categoryTitle = document.getElementById("category-title");
const itemList = document.getElementById("item-list");
const resetButton = document.getElementById("reset-button");
const characterLayers = document.getElementById("character-layers");

let canvas;
let ctx;

const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 3000;

// キャンバスを準備
function setupCanvas() {
  canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx = canvas.getContext("2d");

  characterLayers.innerHTML = "";
  characterLayers.appendChild(canvas);
}

// 素材一覧を読み込む
async function loadManifest() {
  try {
    const response = await fetch("manifest.json");

    if (!response.ok) {
      throw new Error("manifest.jsonを読み込めませんでした");
    }

    manifest = await response.json();

    setupCanvas();
    initializeSelections();
    showCategory(currentCategory);
    await renderCharacter();

  } catch (error) {
    console.error(error);

    characterLayers.innerHTML = `
      <p class="loading-message">
        ♡ ERROR ♡
        <br>
        <span>素材を読み込めませんでした</span>
      </p>
    `;
  }
}

// 選択状態を初期化
function initializeSelections() {
  for (const category of Object.keys(CATEGORY_NAMES)) {
    selectedItems[category] = null;
  }

  selectedItems.SK = 1;
}

// カテゴリーを表示
function showCategory(category) {
  if (!manifest || !manifest.categories[category]) {
    return;
  }

  currentCategory = category;

  const settings = manifest.categories[category];

  categoryTitle.textContent = CATEGORY_NAMES[category];

  categoryButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === category
    );
  });

  itemList.innerHTML = "";

  if (settings.count === 0) {
    itemList.innerHTML = `
      <p class="empty-message">
        ただいま準備中です ♡
      </p>
    `;
    return;
  }

  for (let i = 1; i <= settings.count; i++) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "item-button";
    button.textContent = String(i).padStart(5, "0");

    if (selectedItems[category] === i) {
      button.classList.add("selected");
    }

    button.addEventListener("click", async () => {
      selectedItems[category] = i;
      showCategory(category);
      await renderCharacter();
    });

    itemList.appendChild(button);
  }
}

// 画像を読み込む
function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(
      new Error(`画像を読み込めません：${path}`)
    );

    image.src = path;
  });
}

// 素体を描画
async function renderCharacter() {
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const skinNumber = selectedItems.SK;

  if (!skinNumber) return;

  const fileName =
    `SK${String(skinNumber).padStart(5, "0")}.png`;

  const path = `assets/SK/${fileName}`;

  try {
    const image = await loadImage(path);

    ctx.drawImage(
      image,
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

  } catch (error) {
    console.error(error);
  }
}

// カテゴリーボタン
categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    showCategory(button.dataset.category);
  });
});

// リセット
resetButton.addEventListener("click", async () => {
  initializeSelections();
  showCategory(currentCategory);
  await renderCharacter();
});

// 起動
loadManifest();
