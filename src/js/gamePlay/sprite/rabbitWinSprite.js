var RabbitWinSprite = cc.Sprite.extend({

  ctor: function () {
    var frame = cc.spriteFrameCache.getSpriteFrame('rabbit-win-1.png');
    this._super(frame);
  },
  play: function () {
    var animFrames = [];
    var str = '';
    var frame;
    for (var i = 1; i < 20; i++) {
      str = 'rabbit-win-' + i + '.png';
      frame = cc.spriteFrameCache.getSpriteFrame(str);
      animFrames.push(frame);
    }
    var animation = new cc.Animation(animFrames, 0.2);

    this.runAction(cc.sequence(
      cc.animate(animation)
    ));

    if (GC.musicOn) {
      cc.audioEngine.playEffect(res.win_music);
    }
  }
});
