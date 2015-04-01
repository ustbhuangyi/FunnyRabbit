var ExplosionSprite = cc.Sprite.extend({

  ctor: function () {
    var frame = cc.spriteFrameCache.getSpriteFrame('explosion-1.png');
    this._super(frame);
  },
  play: function () {
    var animFrames = [];
    var str = '';
    var frame;
    for (var i = 1; i < 5; i++) {
      str = 'explosion-' + i + '.png';
      frame = cc.spriteFrameCache.getSpriteFrame(str);
      animFrames.push(frame);
    }
    var animation = new cc.Animation(animFrames, 0.2);

    this.runAction(cc.sequence(
      cc.animate(animation),
      cc.callFunc(this.destroy, this)
    ));

    if (GC.musicOn) {
      cc.audioEngine.playEffect(res.boom_music);
    }
  },

  destroy: function () {
    g_GPTouchLayer.texExplosionBatch.removeChild(this);
  }
});
