// soundfx module: handles all game audio
(function (global) {
  const fx = {
    // placeholders
    jump: null,
    coin: null,
    hit: null,
    flag: null,
    death: null,
    bgm: null,

    // preload all sounds
    preload() {
      soundFormats('mp3', 'wav', 'ogg');

      // assets
      this.jump = loadSound('assets/jump.wav');
      this.coin = loadSound('assets/coin.wav');
      this.hit  = loadSound('assets/hit.wav');
      this.flag = loadSound('assets/flag.wav');
      this.bgm = loadSound('assets/loop.wav');

      // volume
      [this.jump, this.coin, this.hit, this.flag, this.death].forEach(s => s && s.setVolume(0.2));
      if (this.bgm) this.bgm.setVolume(0.15);
    },

    // background music loop
    startBGM() {
      if (this.bgm && !this.bgm.isPlaying()) {
        this.bgm.setLoop(true);
        this.bgm.play();
      }
    },

    // stop background music
    stopBGM() {
      if (this.bgm) this.bgm.stop();
    }
  };

  // expose SoundFX globally
  global.SoundFX = fx;
})(window);