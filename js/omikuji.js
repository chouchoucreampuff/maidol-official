
/* ========================================
   メイドルおみくじ
   キャラクター・運勢・メニューを独立抽選
======================================== */

(() => {
  "use strict";

  // ===== キャラクター設定 =====
  // 画像ファイル名は既存のassetsに合わせる

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
  // 各運勢は同じ確率で選ばれる

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
  // メニュー名やコメントは自由に変更可能

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

  // ===== HTML要素 =====

  const hero = document.querySelector("#omikuji-top");
  const resultSection = document.querySelector("#result-section");
  const paper = document.querySelector("#omikuji-paper");

  const drawButton = document.querySelector("#draw-button");
  const retryButton = document.querySelector("#retry-button");
  const shareButton = document.querySelector("#share-button");

  const fortuneSeal = document.querySelector("#fortune-seal");
  const characterImage = document.querySelector("#character-image");
  const characterName = document.querySelector("#character-name");
  const characterMessage = document.querySelector("#character-message");
  const menuName = document.querySelector("#menu-name");
  const menuComment = document.querySelector("#menu-comment");

  const requiredElements = [
    hero,
    resultSection,
    paper,
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
      "メイドルおみくじ：HTMLの要素が見つかりません。omikuji.htmlを確認してください。"
    );
    return;
  }

  let currentResult = null;
  let isDrawing = false;

  // ===== ランダム抽選 =====

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function pickMessage(messages) {
    return pickRandom(messages);
  }

  // ===== おみくじを引く =====

  function drawOmikuji() {
    if (isDrawing) return;

    isDrawing = true;
    drawButton.disabled = true;
    retryButton.disabled = true;

    const character = pickRandom(characters);
    const fortune = pickRandom(fortunes);
    const menu = pickRandom(menus);

    currentResult = {
      character,
      fortune,
      menu
    };

    // 結果を表示
    hero.hidden = true;
    resultSection.hidden = false;

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

    // アニメーションを毎回最初から再生
    paper.classList.remove("is-opening");

    // ブラウザにアニメーション解除を反映させる
    void paper.offsetWidth;

    paper.classList.add("is-opening");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // 紙が開く演出が終わったら、次の抽選を可能にする
    const finishDrawing = () => {
      isDrawing = false;
      drawButton.disabled = false;
      retryButton.disabled = false;
    };

    paper.addEventListener("animationend", finishDrawing, {
      once: true
    });

    // アニメーションが無効な環境でも操作できるようにする
    window.setTimeout(() => {
      if (isDrawing) {
        finishDrawing();
      }
    }, 1200);
  }

  // ===== Xで結果をシェア =====

  function shareResult() {
    if (!currentResult) return;

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

})();
