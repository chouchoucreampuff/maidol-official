
/* ========================================
   メイドル診断
   10問・二択・5キャラクター
======================================== */

(() => {
  "use strict";

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
