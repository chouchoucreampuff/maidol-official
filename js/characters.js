const characters = {
  spoon: {name:'すぷーん', en:'SPOON', tag:'レッド担当', grade:'高校2年生', color:'RED / PINK', favorite:'準備中', description:'お嬢様気質の、メイドルを彩る女の子。ここに性格や好きなものなど、詳しい紹介文を追加できます。', tone:'pink', images:[]},
  fork: {name:'ふぉーく', en:'FORK', tag:'ブルー担当', grade:'高校2年生', color:'BLUE', favorite:'準備中', description:'サブカル好きで、すぷーんと仲良し。ここに性格や好きなものなど、詳しい紹介文を追加できます。', tone:'blue', images:[]},
  knife: {name:'ないふ', en:'KNIFE', tag:'オレンジ担当', grade:'高校3年生', color:'ORANGE', favorite:'ジャンクフード', description:'明るく元気なムードメーカー。ジャンクフードが好きな女の子。ここに詳しい紹介文を追加できます。', tone:'orange', images:[]},
  hashi: {name:'はし', en:'HASHI', tag:'グリーン担当', grade:'高校1年生', color:'GREEN', favorite:'和食', description:'おとなしく落ち着いた雰囲気の女の子。和食が好き。ここに詳しい紹介文を追加できます。', tone:'green', images:[]},
  mochitora: {name:'もちとら', en:'MOCHITORA', tag:'メイドルのマスコット', grade:'3さい', color:'WHITE', favorite:'ケーキ', description:'まるまるふっくら、もちもちの白いトラ。メイドルのみんなを見守るマスコット。', tone:'white', images:[]}
};
let currentKey = new URLSearchParams(location.search).get('ch') || 'spoon';
let imageIndex = 0;
const tabs = [...document.querySelectorAll('.character-tab')];
const artPlaceholder = document.getElementById('art-placeholder');
function renderCharacter() {
  const c = characters[currentKey] || characters.spoon;
  document.getElementById('profile-en').textContent = c.en;
  document.getElementById('profile-name').textContent = c.name;
  document.getElementById('profile-tag').textContent = c.tag;
  document.getElementById('profile-grade').textContent = c.grade;
  document.getElementById('profile-color').textContent = c.color;
  document.getElementById('profile-favorite').textContent = c.favorite;
  document.getElementById('profile-description').textContent = c.description;
  document.getElementById('art-name').textContent = c.name;
  artPlaceholder.className = 'profile-placeholder ' + c.tone;
  const imageCount = Math.max(c.images.length, 1);
  document.getElementById('image-count').textContent = String(imageIndex + 1).padStart(2,'0') + ' / ' + String(imageCount).padStart(2,'0');
  const imageUrl = c.images[imageIndex];
  const oldImage = document.getElementById('character-real-image');
  if (oldImage) oldImage.remove();
  if (imageUrl) {
    artPlaceholder.style.display = 'none';
    const img = document.createElement('img');
    img.id = 'character-real-image';
    img.src = imageUrl;
    img.alt = c.name + 'の立ち絵';
    img.style.cssText = 'width:100%;height:100%;max-height:520px;object-fit:contain;position:absolute;inset:0;margin:auto;padding:18px;z-index:2;';
    document.getElementById('profile-art').style.position = 'relative';
    document.getElementById('profile-art').appendChild(img);
  } else {
    artPlaceholder.style.display = 'flex';
  }
  tabs.forEach(tab => {
    const active = tab.dataset.character === currentKey;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  const url = new URL(location.href);
  url.searchParams.set('ch', currentKey);
  history.replaceState({}, '', url);
}
tabs.forEach(tab => tab.addEventListener('click', () => { currentKey = tab.dataset.character; imageIndex = 0; renderCharacter(); }));
document.querySelector('.art-arrow.prev').addEventListener('click', () => {
  const c = characters[currentKey]; if (!c.images.length) return;
  imageIndex = (imageIndex - 1 + c.images.length) % c.images.length; renderCharacter();
});
document.querySelector('.art-arrow.next').addEventListener('click', () => {
  const c = characters[currentKey]; if (!c.images.length) return;
  imageIndex = (imageIndex + 1) % c.images.length; renderCharacter();
});
renderCharacter();

// 画像を追加するときは、上の各キャラクターの images: [] にファイルパスを入れてください。
// 例：images: ['assets/characters/spoon.png', 'assets/characters/spoon_costume2.png']
// TOPページの画像は、index.html の figure.placeholder を img に置き換え、CSSでサイズを調整してください。