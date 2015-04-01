var TimeSprite = cc.Sprite.extend({

  ctor: function (value) {
    this._super();
    this.value = value;
    var frame = this.getTimeFrame();
    this.setSpriteFrame(frame);
  },
  getTimeFrame: function () {
    var frameName = 't-' + this.value + '.png';
    var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
    return frame;
  },
  update: function (value) {
    this.value = value;
    var frame = this.getTimeFrame();
    this.setSpriteFrame(frame);
  }
});
