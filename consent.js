
(() => {
  const TERMS_VERSION = "2026-11-26-v1";
  const STORAGE_KEY = "maidol_terms_accepted";

  // すでに同意済みなら表示しない
  try {
    if (localStorage.getItem(STORAGE_KEY) === TERMS_VERSION) {
      return;
    }
  } catch (error) {
    console.warn("同意情報を読み込めませんでした。", error);
  }

  const overlay = document.createElement("div");
  overlay.id = "maidol-consent-overlay";

  overlay.innerHTML = `
    <div class="consent-panel"
         role="dialog"
         aria-modal="true"
         aria-labelledby="consent-title">

      <div class="consent-logo">♡ MAIDOL!! ♡</div>

      <h2 id="consent-title">ご利用前にお読みください</h2>

      <p class="consent-description">
        着せ替えゲームをご利用いただくには、
        利用規約への同意が必要です。
      </p>

      <div class="consent-links">
        <a href="../terms.html"
           target="_blank"
           rel="noopener">
          利用規約を読む ↗
        </a>
      </div>

      <label class="consent-check">
        <input type="checkbox" id="consent-checkbox">
        <span>利用規約に同意します。</span>
      </label>

      <button id="consent-start" disabled>
        同意してゲームを始める
      </button>

      <p class="consent-note">
        同意情報はこのブラウザに保存されます。
      </p>
    </div>
  `;

  function showConsent() {
    document.body.appendChild(overlay);

    const checkbox = overlay.querySelector("#consent-checkbox");
    const button = overlay.querySelector("#consent-start");

    checkbox.addEventListener("change", () => {
      button.disabled = !checkbox.checked;
    });

    button.addEventListener("click", () => {
      if (!checkbox.checked) return;

      try {
        localStorage.setItem(STORAGE_KEY, TERMS_VERSION);
      } catch (error) {
        alert("同意情報を保存できませんでした。ブラウザの設定をご確認ください。");
        return;
      }

      overlay.remove();
    });
  }

  // ページの読み込み後に同意画面を表示
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showConsent);
  } else {
    showConsent();
  }
})();
