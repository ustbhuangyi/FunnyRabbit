var MoonCakeSprite = cc.Sprite.extend({

  ctor: function (type) {
    this._super();
    this.hp = 1;
    this.value = GC.valueMap[type];
    this.type = type;
    this.active = true;
    var frame = this.getMoonCakeFrame();
    this.setSpriteFrame(frame);
  },
  getMoonCakeFrame: function () {
    var frameName = this.type === GC.CAKE.BOOM ? 'boom.png' : 'cake-' + this.type + '.png';
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
    this.visible = false;
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

MoonCakeSprite.getOrCreateMoonCake = function (type) {

  var moonCake;

  for (var i = 0, len = MoonCakeSprite.moonCakes.length; i < len; i++) {
    moonCake = MoonCakeSprite.moonCakes[i];
    if (moonCake.active === false && moonCake.visible === false && moonCake.type === type) {
      moonCake.hp = 1;
      moonCake.opacity = 255;
      moonCake.visible = true;
      moonCake.active = true;

      return moonCake;
    }
  }

  moonCake = MoonCakeSprite.create(type);

  return moonCake;
};

MoonCakeSprite.create = function (type) {

  var moonCake = new MoonCakeSprite(type);

  MoonCakeSprite.moonCakes.push(moonCake);

  return moonCake;

};
