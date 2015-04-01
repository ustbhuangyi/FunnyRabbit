var PlusSprite = cc.Sprite.extend({

  ctor: function (value) {
    this._super();
    this.value = value;
    this.active = true;
    var frame = this.getPlusFrame();
    this.setSpriteFrame(frame);
  },
  getPlusFrame: function () {
    var frameName = 'plus-' + GC.valueMap.indexOf(this.value) + '.png';
    var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
    return frame;
  },

  destroy: function () {
    this.visible = false;
    this.active = false;
    g_GPTouchLayer.texIconsBatch.removeChild(this);
  }
});

PlusSprite.getOrCreatePlus = function (value) {

  var plus;

  for (var i = 0, len = PlusSprite.pluses.length; i < len; i++) {
    plus = PlusSprite.pluses[i];
    if (plus.active === false && plus.visible === false && plus.value === value) {

      plus.opacity = 255;
      plus.visible = true;
      plus.active = true;

      return plus;
    }
  }

  plus = PlusSprite.create(value);

  return plus;
};

PlusSprite.create = function (value) {

  var plus = new PlusSprite(value);

  PlusSprite.pluses.push(plus);

  return plus;

};
