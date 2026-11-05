
(() => {
  const game = document.querySelector(".game-frame iframe");
  const buttons = document.querySelectorAll(".touch-key");

  const keys = {
    d: { key: "d", code: "KeyD", keyCode: 68 },
    f: { key: "f", code: "KeyF", keyCode: 70 },
    j: { key: "j", code: "KeyJ", keyCode: 74 },
    k: { key: "k", code: "KeyK", keyCode: 75 }
  };

  function sendKey(type, name) {
    if (!game || !game.contentDocument) return;

    const info = keys[name];
    if (!info) return;

    const event = new KeyboardEvent(type, {
      key: info.key,
      code: info.code,
      keyCode: info.keyCode,
      which: info.keyCode,
      bubbles: true,
      cancelable: true
    });

    game.contentDocument.dispatchEvent(event);
  }

  buttons.forEach(button => {
    const name = button.dataset.key;
    let pressed = false;

    button.addEventListener("pointerdown", event => {
      event.preventDefault();

      if (pressed) return;
      pressed = true;

      button.classList.add("pressed");
      button.setPointerCapture(event.pointerId);

      sendKey("keydown", name);
    });

    function release() {
      if (!pressed) return;
      pressed = false;

      button.classList.remove("pressed");
      sendKey("keyup", name);
    }

    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });
})();
