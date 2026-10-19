(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.site-menu');
  if (!toggle || !menu) return;
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'メニューを開く');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
  };
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'メニューを開く' : 'メニューを閉じる');
    menu.classList.toggle('open', !isOpen);
    menu.setAttribute('aria-hidden', String(isOpen));
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
})();