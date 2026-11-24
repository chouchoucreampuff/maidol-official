

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

// 素材一覧を読み込む
async function loadManifest() {
  try {
    const response = await fetch("manifest.json");

    if (!response.ok) {
      throw new Error("manifest.jsonを読み込めませんでした");
    }

    manifest = await response.json();

    initializeSelections();
    showCategory(currentCategory);

  } catch (error) {
    console.error(error);

    itemList.innerHTML = `
      <p class="empty-message">
        素材一覧を読み込めませんでした。
        <br>
        manifest.jsonを確認してください。
      </p>
    `;
  }
}

// 選択状態を初期化
function initializeSelections() {
  for (const category of Object.keys(CATEGORY_NAMES)) {
    selectedItems[category] = null;
  }
}

// カテゴリーを表示
function showCategory(category) {
  if (!manifest || !manifest.categories[category]) {
    return;
  }

  currentCategory = category;

  const settings = manifest.categories[category];
  const count = settings.count;

  categoryTitle.textContent = CATEGORY_NAMES[category];

  categoryButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === category
    );
  });

  itemList.innerHTML = "";

  if (count === 0) {
    itemList.innerHTML = `
      <p class="empty-message">
        ただいま準備中です ♡
      </p>
    `;
    return;
  }

  // アイテムボタンを自動生成
  for (let i = 1; i <= count; i++) {
    const itemId = String(i).padStart(5, "0");
    const fileName = `${category}${itemId}.png`;

    const button = document.createElement("button");

    button.type = "button";
    button.className = "item-button";
    button.textContent = fileName.replace(".png", "");

    if (selectedItems[category] === i) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      selectItem(category, i);
    });

    itemList.appendChild(button);
  }
}

// アイテムを選択
function selectItem(category, itemNumber) {
  selectedItems[category] = itemNumber;
  showCategory(category);

  console.log(
    `${CATEGORY_NAMES[category]}：${itemNumber}番を選択`
  );
}

// カテゴリーボタン
categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    showCategory(button.dataset.category);
  });
});

// リセット
resetButton.addEventListener("click", () => {
  initializeSelections();
  showCategory(currentCategory);
});

// 起動
loadManifest();
