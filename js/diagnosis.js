
/* ========================================
   メイドル診断
   10問・二択・5キャラクター
======================================== */

(() => {
  "use strict";

  // ===== キャラクター設定 =====

  const characters = {
    spoon: {
      name: "すぷーん",
      en: "SPOON",
      mark: "♡",
      image: "assets/spoon.png",
      catch: "やさしさでみんなを笑顔にする、おもてなしタイプ！",
      description:
        "あなたは、相手の気持ちを考えられる思いやりの持ち主。大切な人が喜んでくれることに幸せを感じるタイプです。細やかな気配りや、誰かのために頑張れるところがあなたの魅力。あなたのやさしさが、周りをあたたかくしているはず。",
      message:
        "あなたのやさしさ、とってもすてき！ これからも大切な人たちに、たくさんの笑顔を届けてね♡",
      tone: "pink"
    },

    fork: {
      name: "ふぉーく",
      en: "FORK",
      mark: "♤",
      image: "assets/fork.png",
      catch: "好きなものはゆずれない、自分らしさ全開タイプ！",
      description:
        "あなたは、自分の好きなものや世界観を大切にするタイプ。周りと違っていても、自分がいいと思ったものを貫けるのが強みです。こだわりを持って好きなことを楽しむ姿は、きっと誰かの憧れになるはず。",
      message:
        "好きなものは好き！ その気持ちを大事にして、自分だけの世界をもっと楽しんじゃおう♤",
      tone: "blue"
    },

    hashi: {
      name: "はし",
      en: "HASHI",
      mark: "♧",
      image: "assets/hashi.png",
      catch: "静かにみんなを支える、ほっと安心タイプ！",
      description:
        "あなたは、落ち着いて周りを見られるタイプ。目立つことよりも、自分のペースや居心地のよさを大切にします。相手の変化に気づいたり、そっと寄り添ったりできるところが魅力。あなたがいるだけで安心する人もいるはず。",
      message:
        "いつも頑張りすぎなくて大丈夫。あなたらしいペースで、のんびり歩いていこうね♧",
      tone: "green"
    },

    knife: {
      name: "ないふ",
      en: "KNIFE",
      mark: "♢",
      image: "assets/knife.png",
      catch: "楽しそうなら一直線！ 笑顔いっぱいの行動派タイプ！",
      description:
        "あなたは、好奇心いっぱいで行動力のあるタイプ。新しいことに挑戦したり、みんなを明るい気分にしたりするのが得意です。失敗を恐れずに動けることや、場を盛り上げられることがあなたの強み。毎日を楽しくする才能の持ち主です。",
      message:
        "楽しそう！ と思ったら、まずは一歩踏み出してみよう！ あなたの明るさで毎日をキラキラにしちゃおう♢",
      tone: "orange"
    },

    mochitora: {
      name: "もちとら",
      en: "MOCHITORA",
      mark: "☆",
      image: "assets/mochitora.png",
      catch: "自分のペースがいちばん！ みんなを癒やすマイペースタイプ！",
      description:
        "あなたは、無理をせず自分らしく過ごすことを大切にするタイプ。好きなものを楽しんだり、安心できる場所でくつろいだりする時間がエネルギーになります。飾らない自然体の魅力があり、一緒にいる人をほっとさせる存在です。",
      message:
        "おいしいものを食べて、いっぱい休んで、今日ももちもち元気にいこうね☆",
      tone: "white"
    }
  };

  // ===== 質問設定 =====
  // 各キャラクターの回答割り当ては4回ずつ

  const questions = [
    {
      text: "友達と遊びに行くなら？",
      answers: [
        {
          text: "ノリと勢いで、行きたいところにどんどん行く！",
          character: "knife"
        },
        {
          text: "事前に計画を立てて、予定通りに楽しみたい。",
          character: "hashi"
        }
      ]
    },
    {
      text: "自分の好みについて、近いのは？",
      answers: [
        {
          text: "みんなに「いいね！」と言ってもらえるものが好き。",
          character: "spoon"
        },
        {
          text: "周りに理解されなくても、自分の好きなものが一番！",
          character: "fork"
        }
      ]
    },
    {
      text: "休日、理想の過ごし方は？",
      answers: [
        {
          text: "初めての場所やイベントに出かけて、刺激を楽しむ！",
          character: "knife"
        },
        {
          text: "お気に入りに囲まれて、のんびり過ごす。",
          character: "mochitora"
        }
      ]
    },
    {
      text: "友達が悩んでいたら？",
      answers: [
        {
          text: "「つらかったね」と、まずは気持ちに共感する。",
          character: "spoon"
        },
        {
          text: "「どうすれば解決できるかな？」と、具体的な方法を考える。",
          character: "hashi"
        }
      ]
    },
    {
      text: "新しいことに挑戦するときは？",
      answers: [
        {
          text: "まずやってみる！ 失敗したらそのとき考える。",
          character: "fork"
        },
        {
          text: "失敗しないように調べてから、慎重に始める。",
          character: "knife"
        }
      ]
    },
    {
      text: "疲れた日の夜、したいことは？",
      answers: [
        {
          text: "誰かとおしゃべりして、気分をリフレッシュ！",
          character: "mochitora"
        },
        {
          text: "一人で静かに過ごして、心を落ち着かせる。",
          character: "hashi"
        }
      ]
    },
    {
      text: "何かを選ぶとき、優先するのは？",
      answers: [
        {
          text: "自分がワクワクするかどうか！",
          character: "fork"
        },
        {
          text: "大切な人が喜んでくれるかどうか。",
          character: "spoon"
        }
      ]
    },
    {
      text: "グループで何かをするとき、どっちの役が好き？",
      answers: [
        {
          text: "先頭に立って、みんなを引っ張る！",
          character: "fork"
        },
        {
          text: "周りをよく見て、みんなを支える。",
          character: "mochitora"
        }
      ]
    },
    {
      text: "何かを決めるとき、どちらのタイプ？",
      answers: [
        {
          text: "直感を信じて、「これだ！」と思ったものを選ぶ。",
          character: "knife"
        },
        {
          text: "いくつか比べて、納得できるものを選ぶ。",
          character: "hashi"
        }
      ]
    },
    {
      text: "理想の自分に近いのは？",
      answers: [
        {
          text: "目標に向かって努力し、どんどん成長していきたい！",
          character: "spoon"
        },
        {
          text: "焦らず自分のペースで、毎日を幸せに過ごしたい。",
          character: "mochitora"
        }
      ]
    }
  ];

  // ===== HTML要素の取得 =====

  const $ = (selector) => document.querySelector(selector);

  const hero = $("#diagnosis-top");
  const quizPanel = $("#quiz-panel");
  const resultPanel = $("#result-panel");
  const startButton = $("#start-button");
  const retryButton = $("#retry-button");
  const backButton = $("#back-button");
  const shareButton = $("#share-button");

  const questionNumber = $("#question-number");
  const questionText = $("#question-text");
  const quizCount = $("#quiz-count");
  const progressFill = $("#progress-fill");

  const answerButtons = Array.from(
    document.querySelectorAll(".answer-button")
  );

  const resultCard = $("#result-card");
  const resultMark = $("#result-mark");
  const resultImage = $("#result-image");
  const resultType = $("#result-type");
  const resultName = $("#result-name");
  const resultCatch = $("#result-catch");
  const resultDescription = $("#result-description");
  const resultMessage = $("#result-message");
  const characterLink = $("#character-link");

  // HTML側のIDやボタンが不足していないか確認
  const requiredElements = [
    hero,
    quizPanel,
    resultPanel,
    startButton,
    retryButton,
    backButton,
    shareButton,
    questionNumber,
    questionText,
    quizCount,
    progressFill,
    resultCard,
    resultMark,
    resultImage,
    resultType,
    resultName,
    resultCatch,
    resultDescription,
    resultMessage,
    characterLink
  ];

  if (
    requiredElements.some((element) => !element) ||
    answerButtons.length < 2 ||
    answerButtons.some(
      (button) => !button.querySelector(".answer-text")
    )
  ) {
    console.error(
      "メイドル診断：必要なHTML要素が見つかりません。diagnosis.htmlのIDとクラス名を確認してください。"
    );
    return;
  }

  // ===== 診断の状態 =====

  let currentQuestion = 0;
  let answers = [];
  let currentResult = null;

  // ===== 画面切り替え =====

  function showSection(section) {
    hero.hidden = section !== "hero";
    quizPanel.hidden = section !== "quiz";
    resultPanel.hidden = section !== "result";
  }

  // ===== 診断スタート・リトライ =====

  function startDiagnosis() {
    currentQuestion = 0;
    answers = [];
    currentResult = null;

    showSection("quiz");
    renderQuestion();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // ===== 質問表示 =====

  function renderQuestion() {
    const question = questions[currentQuestion];

    if (!question) {
      console.error("メイドル診断：質問データが見つかりません。");
      return;
    }

    questionNumber.textContent =
      "Q." + String(currentQuestion + 1).padStart(2, "0");

    quizCount.textContent =
      "QUESTION " + (currentQuestion + 1) + " / " + questions.length;

    questionText.textContent = question.text;

    progressFill.style.width =
      ((currentQuestion + 1) / questions.length) * 100 + "%";

    answerButtons.forEach((button, index) => {
      button.querySelector(".answer-text").textContent =
        question.answers[index].text;
    });

    backButton.disabled = currentQuestion === 0;
  }

  // ===== 回答選択 =====

  function chooseAnswer(answerIndex) {
    const question = questions[currentQuestion];

    if (
      !question ||
      !question.answers[answerIndex]
    ) {
      return;
    }

    answers[currentQuestion] =
      question.answers[answerIndex].character;

    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      renderQuestion();
      return;
    }

    showResult();
  }

  // ===== ポイント集計・診断結果決定 =====

  function calculateResult() {
    const scores = {};

    Object.keys(characters).forEach((id) => {
      scores[id] = 0;
    });

    answers.forEach((id) => {
      if (Object.prototype.hasOwnProperty.call(scores, id)) {
        scores[id]++;
      }
    });

    const highestScore = Math.max(...Object.values(scores));

    const tiedCharacters = Object.keys(scores).filter(
      (id) => scores[id] === highestScore
    );

    // 同点の場合は、同点キャラクターのうち
    // 最後に選んだキャラクターを結果にする
    for (let i = answers.length - 1; i >= 0; i--) {
      if (tiedCharacters.includes(answers[i])) {
        return answers[i];
      }
    }

    return "spoon";
  }

  // ===== 結果表示 =====

  function showResult() {
    const resultId = calculateResult();
    const character = characters[resultId];

    currentResult = {
      id: resultId,
      character
    };

    resultCard.dataset.tone = character.tone;

    resultMark.textContent = character.mark;
    resultImage.style.display = "block";
    resultImage.src = character.image;
    resultImage.alt = character.name + "の立ち絵";

    resultType.textContent = character.en + " TYPE";
    resultName.textContent = character.name + "タイプ！";
    resultCatch.textContent = character.catch;
    resultDescription.textContent = character.description;
    resultMessage.textContent = character.message;

    characterLink.href =
      "characters.html?ch=" + encodeURIComponent(resultId);

    showSection("result");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // ===== Xで結果をシェア =====

  function shareResult() {
    if (!currentResult) return;

    const character = currentResult.character;

    const shareText =
      "メイドル診断の結果は……\n" +
      "「" + character.name + "タイプ！」" +
      "\n" + character.catch +
      "\nあなたも診断してみてね♡";

    const shareUrl = new URL(
      "diagnosis.html",
      window.location.href
    );

    const xUrl = new URL("https://twitter.com/intent/tweet");

    xUrl.searchParams.set("text", shareText);
    xUrl.searchParams.set("url", shareUrl.href);
    xUrl.searchParams.set("hashtags", "メイドル診断,メイドル");

    window.open(
      xUrl.href,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ===== ボタンのイベント登録 =====

  startButton.addEventListener("click", startDiagnosis);
  retryButton.addEventListener("click", startDiagnosis);
  shareButton.addEventListener("click", shareResult);

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      chooseAnswer(Number(button.dataset.answer));
    });
  });

  backButton.addEventListener("click", () => {
    if (currentQuestion === 0) return;

    currentQuestion--;
    renderQuestion();
  });

  // ===== 画像読み込みエラー対策 =====

  resultImage.addEventListener("error", () => {
    resultImage.alt =
      "画像が読み込めません。画像ファイル名を確認してください。";
    resultImage.style.display = "none";
  });

  resultImage.addEventListener("load", () => {
    resultImage.style.display = "block";
  });

})();
