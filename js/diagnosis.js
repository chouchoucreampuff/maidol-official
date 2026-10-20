
/* ========================================
   メイドル診断
   10問・二択・5キャラクター
======================================== */

(() => {
  "use strict";

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

  /*
   * 各選択肢を選ぶと、対応するキャラクターに1点。
   * どちらの選択肢も正解・不正解はありません。
   */
  const questions = [
    {
      text: "友達とお出かけ！ あなたはどっち？",
      answers: [
        {
          text: "行き先や予定を考えて、みんなを楽しませたい",
          character: "spoon"
        },
        {
          text: "気になる場所を見つけて、自由に楽しみたい",
          character: "fork"
        }
      ]
    },
    {
      text: "友達が悩んでいるみたい。どうする？",
      answers: [
        {
          text: "そばにいて、気持ちが落ち着くまで話を聞く",
          character: "hashi"
        },
        {
          text: "気分転換できるように、明るく声をかける",
          character: "knife"
        }
      ]
    },
    {
      text: "何も予定がない休日、理想の過ごし方は？",
      answers: [
        {
          text: "好きなものに囲まれて、のんびり過ごす",
          character: "mochitora"
        },
        {
          text: "お菓子を作ったり、誰かのために何かしたりする",
          character: "spoon"
        }
      ]
    },
    {
      text: "グループで何かをするとき、得意なのは？",
      answers: [
        {
          text: "周りの様子を見ながら、必要なことを見つける",
          character: "hashi"
        },
        {
          text: "自分のアイデアを出して、新しいことに挑戦する",
          character: "fork"
        }
      ]
    },
    {
      text: "新しいことを始めるときは？",
      answers: [
        {
          text: "まずはやってみる！ 楽しそうなら飛び込む",
          character: "knife"
        },
        {
          text: "自分のペースで、できそうなことから始める",
          character: "mochitora"
        }
      ]
    },
    {
      text: "あなたが大切にしたいのは？",
      answers: [
        {
          text: "大切な人が喜んでくれること",
          character: "spoon"
        },
        {
          text: "みんなが無理せず、自分らしくいられること",
          character: "hashi"
        }
      ]
    },
    {
      text: "好きなものへのこだわりは？",
      answers: [
        {
          text: "気分が上がるなら、思い切って挑戦したい",
          character: "knife"
        },
        {
          text: "周りと違っても、自分の好きな世界観を貫きたい",
          character: "fork"
        }
      ]
    },
    {
      text: "疲れたとき、いちばんうれしいのは？",
      answers: [
        {
          text: "好きな食べ物や居心地のいい場所で癒やされる",
          character: "mochitora"
        },
        {
          text: "お茶でも飲みながら、静かな時間を過ごす",
          character: "hashi"
        }
      ]
    },
    {
      text: "みんなでイベントを開催！ あなたは？",
      answers: [
        {
          text: "盛り上がる企画を考えて、場を楽しくする",
          character: "knife"
        },
        {
          text: "参加する人が喜ぶように、細かいところまで準備する",
          character: "spoon"
        }
      ]
    },
    {
      text: "理想の自分に近いのはどっち？",
      answers: [
        {
          text: "好きなことを楽しみながら、気ままに生きたい",
          character: "mochitora"
        },
        {
          text: "好きなことを追求して、自分らしさを表現したい",
          character: "fork"
        }
      ]
    }
  ];

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

  let currentQuestion = 0;
  let answers = [];
  let currentResult = null;

  function showSection(section) {
    hero.hidden = section !== "hero";
    quizPanel.hidden = section !== "quiz";
    resultPanel.hidden = section !== "result";
  }

  function startDiagnosis() {
    currentQuestion = 0;
    answers = [];
    currentResult = null;
    showSection("quiz");
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderQuestion() {
    const question = questions[currentQuestion];

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

  function chooseAnswer(answerIndex) {
    const question = questions[currentQuestion];
    answers[currentQuestion] = question.answers[answerIndex].character;

    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      renderQuestion();
      return;
    }

    showResult();
  }

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

    /*
     * 同点の場合：
     * 同点キャラクターのうち、回答の後半で最後に選ばれた
     * キャラクターを結果にする。
     */
    for (let i = answers.length - 1; i >= 0; i--) {
      if (tiedCharacters.includes(answers[i])) {
        return answers[i];
      }
    }

    return "spoon";
  }

  function showResult() {
    const resultId = calculateResult();
    const character = characters[resultId];

    currentResult = {
      id: resultId,
      character
    };

    resultCard.dataset.tone = character.tone;
    resultMark.textContent = character.mark;
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function shareResult() {
    if (!currentResult) return;

    const character = currentResult.character;
    const shareText =
      "メイドル診断の結果は……\n" +
      "「" + character.name + "タイプ！」" +
      "\n" + character.catch +
      "\nあなたも診断してみてね♡";

    const shareUrl = new URL("diagnosis.html", window.location.href);
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

  /*
   * キャラクター画像が見つからない場合の案内。
   * 画像名を変更したときも気づきやすくする。
   */
  resultImage.addEventListener("error", () => {
    resultImage.alt = "画像が読み込めません。画像ファイル名を確認してください。";
    resultImage.style.display = "none";
  });

  resultImage.addEventListener("load", () => {
    resultImage.style.display = "block";
  });
})();
