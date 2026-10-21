
/* ========================================
   メイドルおみくじ
   キャラクター・運勢・メニューを独立抽選
======================================== */

(() => {
  "use strict";

  // ===== キャラクター設定 =====

  const characters = [
    {
      id: "spoon",
      name: "すぷーん",
      image: "assets/spoon.png",
      messages: [
        "やさしい気持ちを大切にすると、すてきな一日になりそう♡",
        "誰かの笑顔が、あなた自身の幸せにつながるかも！",
        "今日は思いやりの気持ちを忘れずに過ごしてみてね♡"
      ]
    },
    {
      id: "fork",
      name: "ふぉーく",
      image: "assets/fork.png",
      messages: [
        "好きなものへのときめきを大切にしてね♤",
        "自分らしさを忘れなければ、きっといいことがあるはず！",
        "今日は自分の「好き！」に素直になってみよう♤"
      ]
    },
    {
      id: "hashi",
      name: "はし",
      image: "assets/hashi.png",
      messages: [
        "落ち着いて考えれば、きっといい答えが見つかるよ♧",
        "焦らず一歩ずつ進むことが、幸運につながりそう。",
        "自分で納得できる選択を大切にしてね♧"
      ]
    },
    {
      id: "knife",
      name: "ないふ",
      image: "assets/knife.png",
      messages: [
        "気になったことには、思い切って挑戦してみよう！",
        "楽しい予感がしたら、迷わず一歩踏み出してみてね♢",
        "今日はいつもより少し大胆に行動するといいかも！"
      ]
    },
    {
      id: "mochitora",
      name: "もちとら",
      image: "assets/mochitora.png",
      messages: [
        "おいしいものを食べて、ゆったり過ごすのが吉☆",
        "頑張りすぎなくても大丈夫。休憩も大切だよ☆",
        "今日は自分を甘やかして、のんびり過ごしてみてね☆"
      ]
    }
  ];

  // ===== 運勢 =====

  const fortunes = [
    {
      name: "大吉",
      comments: [
        "最高の運気！ 新しいことにも挑戦してみよう！",
        "うれしい出来事が期待できそう。笑顔を忘れずに♡"
      ]
    },
    {
      name: "中吉",
      comments: [
        "いい流れがやってきそう。前向きな気持ちで過ごしてね！",
        "いつもの努力が実を結ぶかも。自信を持って進もう♡"
      ]
    },
    {
      name: "小吉",
      comments: [
        "小さな幸せを見つけられそう。身近なことに目を向けて♡",
        "何気ない一日にも、うれしい発見があるかも！"
      ]
    },
    {
      name: "吉",
      comments: [
        "穏やかに過ごせそうな日。いつも通りがいちばん！",
        "身近な人への感謝を忘れずに過ごしてみてね♡"
      ]
    },
    {
      name: "末吉",
      comments: [
        "これから運気が上向く予感。焦らず進んでいこう！",
        "今は準備のとき。少しずつ進めば大丈夫♡"
      ]
    }
  ];

  // ===== おすすめメニュー =====

  const menus = [
    {
      name: "いちごのショートケーキ",
      comment: "甘いものを食べて、ほっとひと息♡"
    },
    {
      name: "ふわふわオムライス",
      comment: "ほっとするおいしさで元気をチャージ！"
    },
    {
      name: "カラフルクリームソーダ",
      comment: "キラキラ気分で一日を楽しもう☆"
    },
    {
      name: "とろとろプリン",
      comment: "なめらかな甘さで癒やされよう♡"
    },
    {
      name: "もちもちパンケーキ",
      comment: "好きなトッピングをのせて楽しんで！"
    },
    {
      name: "おにぎりセット",
      comment: "しっかり食べて、元気に過ごそう！"
    },
    {
      name: "チョコレートパフェ",
      comment: "今日はちょっと贅沢な気分を味わって♡"
    },
    {
      name: "あったかココア",
      comment: "ひと息ついて、心もぽかぽかに☆"
    }
  ];

  // ===== HTML要素の取得 =====

  const hero = document.querySelector("#omikuji-top");
  const resultSection = document.querySelector("#result-section");
  const paper = document.querySelector("#omikuji-paper");
  const magicOverlay = document.querySelector("#omikuji-magic");

  const drawButton = document.querySelector("#draw-button");
  const retryButton = document.querySelector("#retry-button");
  const shareButton = document.querySelector("#share-button");

  const fortuneSeal = document.querySelector("#fortune-seal");
  const characterImage = document.querySelector("#character-image");
  const characterName = document.querySelector("#character-name");
  const characterMessage = document.querySelector("#character-message");
  const menuName = document.querySelector("#menu-name");
  const menuComment = document.querySelector("#menu-comment");

  // 必須要素が存在するか確認
  const requiredElements = [
    hero,
    resultSection,
    paper,
    magicOverlay,
    drawButton,
    retryButton,
    shareButton,
    fortuneSeal,
    characterImage,
    characterName,
    characterMessage,
    menuName,
    menuComment
  ];

  if (requiredElements.some((element) => !element)) {
    console.error(
      "メイドルおみくじ：必要なHTML要素が見つかりません。",
      requiredElements.map((element, index) => ({
        index,
        missing: !element
      }))
    );
    return;
  }

  // ===== 状態管理 =====

  let currentResult = null;
  let isDrawing = false;
  let animationTimer = null;
  let finishTimer = null;

  // ===== ランダム抽選 =====

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function pickMessage(messages) {
    return pickRandom(messages);
  }

  // ===== ボタンの状態を更新 =====

  function setButtonsDisabled(disabled) {
    drawButton.disabled = disabled;
    retryButton.disabled = disabled;
  }

  // ===== 抽選結果を画面に反映 =====

  function showResult(character, fortune, menu) {
    fortuneSeal.textContent = fortune.name;
    fortuneSeal.dataset.fortune = fortune.name;
    fortuneSeal.setAttribute(
      "aria-label",
      "運勢：" + fortune.name
    );

    characterImage.src = character.image;
    characterImage.alt = character.name + "の立ち絵";

    characterName.textContent = character.name;

    characterMessage.textContent =
      pickMessage(character.messages) +
      "\n" +
      pickMessage(fortune.comments);

    menuName.textContent = menu.name;
    menuComment.textContent = menu.comment;
  }

  // ===== 魔法演出をリセット =====

  function resetMagicAnimation() {
    magicOverlay.classList.remove("is-active");
    magicOverlay.hidden = true;

    paper.classList.remove("is-opening");
  }

  // ===== おみくじを引く =====

  function drawOmikuji() {
    // 演出中の連打を防止
    if (isDrawing) {
      return;
    }

    isDrawing = true;
    setButtonsDisabled(true);

    // 前回のタイマーが残っていた場合に備える
    window.clearTimeout(animationTimer);
    window.clearTimeout(finishTimer);

    // キャラクター・運勢・メニューを独立して抽選
    const character = pickRandom(characters);
    const fortune = pickRandom(fortunes);
    const menu = pickRandom(menus);

    currentResult = {
      character,
      fortune,
      menu
    };

    // 結果を先にセットしておく
    showResult(character, fortune, menu);

    // 前回のアニメーションをリセット
    resetMagicAnimation();

    // CSSアニメーションを最初から再生
    void magicOverlay.offsetWidth;
    void paper.offsetWidth;

    // 結果エリアを隠し、魔法演出を表示
    resultSection.hidden = true;
    magicOverlay.hidden = false;
    magicOverlay.classList.add("is-active");

    // 約1.3秒後に魔法演出から結果画面へ切り替え
    animationTimer = window.setTimeout(() => {
      magicOverlay.classList.remove("is-active");
      magicOverlay.hidden = true;

      hero.hidden = true;
      resultSection.hidden = false;

      // おみくじの紙が開くアニメーション
      paper.classList.remove("is-opening");
      void paper.offsetWidth;
      paper.classList.add("is-opening");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      // 演出終了後に再び引けるようにする
      finishTimer = window.setTimeout(() => {
        paper.classList.remove("is-opening");

        isDrawing = false;
        setButtonsDisabled(false);
      }, 2300);

    }, 1300);
  }

  // ===== Xで結果をシェア =====

  function shareResult() {
    if (!currentResult) {
      return;
    }

    const { character, fortune, menu } = currentResult;

    const shareText =
      "メイドルおみくじを引いたよ♡\n" +
      "今日の運勢は【" + fortune.name + "】！\n" +
      character.name + "からのメッセージ：\n" +
      characterMessage.textContent + "\n" +
      "今日のおすすめメニュー：" + menu.name + "\n" +
      "#メイドル #メイドルおみくじ";

    const shareUrl =
      "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(shareText) +
      "&url=" +
      encodeURIComponent(window.location.href);

    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ===== イベント設定 =====

  drawButton.addEventListener("click", drawOmikuji);
  retryButton.addEventListener("click", drawOmikuji);
  shareButton.addEventListener("click", shareResult);

  // ===== 初期表示 =====

  // ページを開いたときはトップ画面を表示
  hero.hidden = false;
  resultSection.hidden = true;
  magicOverlay.hidden = true;

  setButtonsDisabled(false);

  console.log("メイドルおみくじ：JavaScriptの読み込み完了");

})();
