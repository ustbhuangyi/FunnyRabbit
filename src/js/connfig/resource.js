var res = {
  rabbit_small_plist: 'image/rabbit-small.plist',
  rabbit_small_png: 'image/rabbit-small.png',
  rabbit_big_plist: 'image/rabbit-big.plist',
  rabbit_big_png: 'image/rabbit-big.png',
  rabbit_win_plist: 'image/rabbit-win.plist',
  rabbit_win_png: 'image/rabbit-win.png',
  rabbit_lose_plist: 'image/rabbit-lose.plist',
  rabbit_lose_png: 'image/rabbit-lose.png',
  icons_plist: 'image/icons.plist',
  icons_png: 'image/icons.png',
  explosion_plist: 'image/explosion.plist',
  explosion_png: 'image/explosion.png',
  background: 'image/background.jpg',

  bg_music: 'music/gamebg.mp3',
  cake_music: 'music/cake.mp3',
  boom_music: 'music/boom.mp3',
  win_music: 'music/win.mp3',
  lose_music: 'music/lose.mp3',
  lessboom_music: 'music/lessboom.mp3',
  clock_music: 'music/clock.mp3',
  life_music: 'music/life.mp3',
  basket_music: 'music/basket.mp3',
  jump_music: 'music/jump.mp3'
};

var g_resources = [];
for (var i in res) {
  g_resources.push(res[i]);
}
