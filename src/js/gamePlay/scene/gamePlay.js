var GamePlayScene  = cc.Scene.extend({
  onEnter:function () {
    this._super();

    var layer = new GamePlayLayer();
    this.addChild(layer);

  }
});

var GamePlayLayer = cc.Layer.extend({

  backgroundLayer : null,
  touchLayer : null,
  ctor : function(){
    this._super();

    this.addCache();

    this.addBackgroundLayer();

    this.addTouchLayer();
  },

  addCache : function(){

    //将plist添加到缓存
    cc.spriteFrameCache.addSpriteFrames(res.rabbit_small_plist);
    cc.spriteFrameCache.addSpriteFrames(res.rabbit_big_plist);
    cc.spriteFrameCache.addSpriteFrames(res.rabbit_win_plist);
    cc.spriteFrameCache.addSpriteFrames(res.rabbit_lose_plist);
    cc.spriteFrameCache.addSpriteFrames(res.icons_plist);
    cc.spriteFrameCache.addSpriteFrames(res.explosion_plist);
  },


  addBackgroundLayer : function(){

    this.backgroundLayer = new GPBackgroundLayer();
    this.addChild(this.backgroundLayer);
  },

  addTouchLayer : function(){
    this.touchLayer = new GPTouchLayer();
    this.addChild(this.touchLayer);
  }
});
