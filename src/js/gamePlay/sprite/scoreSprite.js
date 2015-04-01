var ScoreSprite = cc.Sprite.extend({

  ctor: function (value) {
    this._super();
    this.value = value;
    var frame = this.getScoreFrame();
    this.setSpriteFrame(frame);
  },
  getScoreFrame: function () {
    var frameName = 's-' + this.value + '.png';
    var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
    return frame;
  },
  update: function (value) {
    this.value = value;
    var frame = this.getScoreFrame();
    this.setSpriteFrame(frame);
  }
});
