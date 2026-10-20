
"use strict";

const characters = {
  spoon: {
    name: "すぷーん",
    en: "SPOON",
    mark: "♡",
    tag: "レッド担当",
    grade: "高校2年生",
    birthday: "11/21",
    color: "RED",
    food: "いちご",
    hobby: "お菓子作り",
    favorite: "ぬいぐるみ",
    description: "ふんわり優しいお嬢様。ふぉーくと仲良し。",
    tone: "red",
    images: ["assets/spoon.png"]
  },

  fork: {
    name: "ふぉーく",
    en: "FORK",
    mark: "♤",
    tag: "ブルー担当",
    grade: "高校2年生",
    birthday: "8/8",
    color: "BLUE",
    food: "ツナおにぎり",
    hobby: "ランニング",
    favorite: "おしゃれ",
    description: "サブカル好きで、すぷーんと仲良し。",
    tone: "blue",
    images: ["assets/fork.png"]
  },

  knife: {
    name: "ないふ",
    en: "KNIFE",
    mark: "♢",
    tag: "オレンジ担当",
    grade: "高校3年生",
    birthday: "2/9",
    color: "ORANGE",
    food: "クレープ",
    hobby: "コスメ収集",
    favorite: "ダンス",
    description: "明るく元気なムードメーカー。",
    tone: "orange",
    images: ["assets/knife.png"]
  },

  hashi: {
    name: "はし",
    en: "HASHI",
    mark: "♧",
    tag: "グリーン担当",
    grade: "高校1年生",
    birthday: "5/11",
    color: "GREEN",
    food: "お茶漬け",
    hobby: "お茶会",
    favorite: "お茶全般",
    description: "おとなしく落ち着いた雰囲気の女の子。",
    tone: "green",
    images: ["assets/hashi.png"]
  },

  mochitora: {
    name: "もちとら",
    en: "MOCHITORA",
    mark: "☆",
    tag: "メイドルのマスコット",
    grade: "3さい",
    birthday: "未設定",
    color: "WHITE",
    food: "ケーキ",
    hobby: "おさんぽ",
    favorite: "マスター",
    description: "まるまるふっくら、もちもちの白いトラ。メイドルのみんなを見守るマスコット。",
    tone: "white",
    images: ["assets/mochitora.png"]
  }
};

const params = new URLSearchParams(location.search);
let currentKey = params.get("ch") || "spoon";

if (!characters[currentKey]) {
  currentKey = "spoon";
}

let imageIndex = 0;

const tabs = [...document.querySelectorAll(".character-tab")];
const artArea = document.getElementById("profile-art");
const placeholder = document.getElementById("art-placeholder");
const prevButton = document.querySelector(".art-arrow.prev");
const nextButton = document.querySelector(".art-arrow.next");

function renderCharacter() {
  const character = characters[currentKey];
  const images = character.images;
  const imageCount = Math.max(images.length, 1);

  if (imageIndex >= images.length) {
    imageIndex = 0;
  }

  // PROFILE横のマークをキャラクターごとに変更
  const profileMark = document.querySelector(".profile-mark");
  if (profileMark) {
    profileMark.textContent = character.mark;
  }

  document.getElementById("profile-en").textContent = character.en;
  document.getElementById("profile-name").textContent = character.name;
  document.getElementById("profile-tag").textContent = character.tag;
  document.getElementById("profile-grade").textContent = character.grade;
  document.getElementById("profile-birthday").textContent = character.birthday;
  document.getElementById("profile-color").textContent = character.color;
  document.getElementById("profile-food").textContent = character.food;
  document.getElementById("profile-hobby").textContent = character.hobby;
  document.getElementById("profile-favorite").textContent = character.favorite;
  document.getElementById("profile-description").textContent =
    character.description;

  document.getElementById("art-name").textContent = character.name;
  placeholder.className = "profile-placeholder " + character.tone;

  let image = document.getElementById("character-real-image");

  if (!image) {
    image = document.createElement("img");
    image.id = "character-real-image";
    image.alt = "";
    image.hidden = true;
    artArea.appendChild(image);
  }

  const imageUrl = images[imageIndex];

  if (imageUrl) {
    image.hidden = false;
    image.src = imageUrl;
    image.alt = character.name + "の立ち絵";
    placeholder.style.display = "none";
  } else {
    image.hidden = true;
    placeholder.style.display = "flex";
  }

  image.onerror = () => {
    image.hidden = true;
    placeholder.style.display = "flex";
    document.getElementById("art-name").textContent = character.name;
  };

  document.getElementById("image-count").textContent =
    String(imageIndex + 1).padStart(2, "0") +
    " / " +
    String(imageCount).padStart(2, "0");

  const canSwitch = images.length > 1;
  prevButton.disabled = !canSwitch;
  nextButton.disabled = !canSwitch;

  tabs.forEach(tab => {
    const active = tab.dataset.character === currentKey;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  const url = new URL(location.href);
  url.searchParams.set("ch", currentKey);
  history.replaceState({}, "", url);
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    currentKey = tab.dataset.character;
    imageIndex = 0;
    renderCharacter();
  });
});

prevButton.addEventListener("click", () => {
  const images = characters[currentKey].images;
  if (images.length < 2) return;

  imageIndex = (imageIndex - 1 + images.length) % images.length;
  renderCharacter();
});

nextButton.addEventListener("click", () => {
  const images = characters[currentKey].images;
  if (images.length < 2) return;

  imageIndex = (imageIndex + 1) % images.length;
  renderCharacter();
});

renderCharacter();
