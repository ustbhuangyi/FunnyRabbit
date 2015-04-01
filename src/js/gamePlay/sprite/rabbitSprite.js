var RabbitSprite = cc.Sprite.extend({

  ctor: function () {
    this._super();
    //this._rect = cc.rect(0, 0, this.getContentSize().width, this.getContentSize().height);
    this.type = GC.rabbit.type;
    this.direction = GC.rabbit.direction;
    this.basket = GC.rabbit.basket;
    this.step = GC.rabbit.step[this.direction];
    this.moving = GC.MOVING.STOP;
    this.jumping = false;
    this.growing = false;
    this.jumpSpeed = 0;
    this.jumpUp = false;
    this.runSpeed = 0;
    this.leftCount = 0;
    this.rightCount = 0;
    this.update();
  },
  getRabbitFrame: function () {
    var frameName = 'rabbit-' + this.type + '-' + this.direction + '-' + this.basket + '-' + this.step + '.png';
    var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
    return frame;
  },

  update: function () {
    var frame = this.getRabbitFrame();
    this.setSpriteFrame(frame);
  },
  playWin: function () {
    var rabbitWin = new RabbitWinSprite();
    rabbitWin.x = this.x;
    rabbitWin.y = this.y;
    rabbitWin.play();
    g_GPTouchLayer.texRabbitWinBatch.addChild(rabbitWin);
    this.destroy();
  },
  playLose: function () {
    var rabbitLose = new RabbitLoseSprite();
    rabbitLose.x = this.x;
    rabbitLose.y = this.y;
    rabbitLose.play();
    g_GPTouchLayer.texRabbitLoseBatch.addChild(rabbitLose);
    this.destroy();
  },
  hurt: function (moonCake) {
    if (moonCake.type === GC.CAKE.BOOM) {
      var explosion = new ExplosionSprite();
      explosion.x = moonCake.x;
      explosion.y = moonCake.y;
      explosion.play();
      g_GPTouchLayer.texExplosionBatch.addChild(explosion);
    } else {
      var plus = PlusSprite.getOrCreatePlus(moonCake.value);
      plus.x = moonCake.x;
      plus.y = moonCake.y;
      var actionTo = cc.moveTo(0.3, cc.p(plus.x, plus.y + 80));
      var actionFadeOut = cc.fadeOut(1);
      var callback = cc.callFunc(function (plus) {
        plus.destroy();
      });
      plus.runAction(cc.sequence(actionTo, actionFadeOut, callback));
      g_GPTouchLayer.texIconsBatch.addChild(plus);

      if (GC.musicOn) {
        cc.audioEngine.playEffect(res.cake_music);
      }
    }
  },
  collideRect: function (x, y) {
    var w = this.width, h = this.height;
    return cc.rect(x - w / 2, y - h / 2, w, h);
  },
  destroy: function () {
    this.visible = false;
  }

});
