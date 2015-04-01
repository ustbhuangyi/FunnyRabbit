var PropSprite = cc.Sprite.extend({

  ctor: function (type) {
    this._super();
    this.hp = 1;
    this.value = GC.valueMap[type];
    this.active = true;
    this.type = type;
    var frame = this.getPropFrame();
    this.setSpriteFrame(frame);
  },
  getPropFrame: function () {
    var frameName = this.type + '.png';
    var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
    return frame;
  },

  update: function () {

    var h_2 = this.height / 2 | 0;
    //5个像素的buffer
    if (this.y <= h_2 + 5) {
      this.active = false;
    }
    if (this.hp <= 0) {
      this.destroy();
    }
  },

  destroy: function () {
    this.active = false;
    g_GPTouchLayer.texIconsBatch.removeChild(this);
  },

  hurt: function () {
    if (this.hp > 0) {
      this.hp--;
    }
  },

  collideRect: function (x, y) {
    var w = this.width, h = this.height;
    return cc.rect(x - w / 2, y - h / 2, w, h);
  }
});
