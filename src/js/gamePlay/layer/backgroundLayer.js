var GPBackgroundLayer = cc.LayerColor.extend({

  ctor: function (color) {

    this._super(color);

    this.initBackground();

  },

  initBackground: function () {
    var sptBg = new cc.Sprite(res.background);
    sptBg.attr({
      x: GC.w_2,
      y: GC.h_2
    });
    this.addChild(sptBg);
  }
});
