var LifeSprite = cc.Sprite.extend({

  ctor: function (value) {
    this._super();
    this.value = value;
    var frame = this.getLifeFrame();
    this.setSpriteFrame(frame);
  },
  getLifeFrame: function () {
    var frameName = 'life-' + this.value + '.png';
    var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
    return frame;
  },
  update: function (value) {
    this.value = value;
    var frame = this.getLifeFrame();
    this.setSpriteFrame(frame);
  }
});
