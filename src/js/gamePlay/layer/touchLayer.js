//当前层对外引用
var g_GPTouchLayer;

var GPTouchLayer = cc.Layer.extend({

  ctor: function () {

    this._super();

    g_GPTouchLayer = this;

    this.initGame();

    this.initBatchNode();

    this.initScore();

    this.initTime();

    this.initLife();

    this.initRabbit();

    this.presetMoonCakes();

    this.presetPluses();

    this.playMusic();

    this.bindEvent();

    this.scheduleUpdate();


  },
  //初始化游戏
  initGame: function () {
    this.state = GC.GAME_STATE.PLAY;

    this.moonCakes = [];
    this.scores = [];
    this.times = [];
    this.props = [];
    this.propMap = {};
    this.gameFrame = 0;
    this.score = 0;
    this.spendTime = 0;
    this.totalTime = GC.totalTime;
    this.life = GC.life;
    this.difficulty = GC.difficulty;
    this.level = 1;

  },
  //初始化兔子
  initRabbit: function () {
    var rabbit = this.rabbit = new RabbitSprite();
    rabbit.attr({
      x: GC.rabbit.x,
      y: GC.rabbit.y
    });

    this.addChild(rabbit, 1);
  },
  //初始化记分牌
  initScore: function () {
    var me = this;
    for (var i = 0, len = GC.scoreLen; i < len; i++) {
      (function (index) {
        var spScore = new ScoreSprite(0);
        spScore.x = 878 + spScore.width * index;
        spScore.y = 210;
        me.scores.push(spScore);
        me.texIconsBatch.addChild(spScore);
      })(i);
    }
  },
  //初始化倒计时
  initTime: function () {
    var me = this;
    for (var i = 0, len = GC.timeLen; i < len; i++) {
      (function (index) {
        var rest = Math.max(0, (me.totalTime - (me.spendTime - 0.5) | 0) | 0);
        var base = Math.pow(10, len - index);
        var value = ((rest % base) * 10 / base) | 0;
        var spTime = new TimeSprite(value);
        spTime.x = 72 + spTime.width * index;
        spTime.y = 137;
        me.times.push(spTime);
        me.texIconsBatch.addChild(spTime);
      })(i);
    }
  },
  //初始化生命
  initLife: function () {
    var spLife = this.spLife = new LifeSprite(this.life);
    spLife.x = 250;
    spLife.y = 40;
    this.texIconsBatch.addChild(spLife);
  },
  //通过BatchNode减少渲染个数, 优化性能
  initBatchNode: function () {

    var texIcons = cc.textureCache.addImage(res.icons_png);
    this.texIconsBatch = new cc.SpriteBatchNode(texIcons);
    this.addChild(this.texIconsBatch);

    var texRabbitSmall = cc.textureCache.addImage(res.rabbit_small_png);
    this.texRabbitSmallBatch = new cc.SpriteBatchNode(texRabbitSmall);
    this.addChild(this.texRabbitSmallBatch);

    var texRabbitBig = cc.textureCache.addImage(res.rabbit_big_png);
    this.texRabbitBigBatch = new cc.SpriteBatchNode(texRabbitBig);
    this.addChild(this.texRabbitBigBatch);

    var texRabbitWin = cc.textureCache.addImage(res.rabbit_win_png);
    this.texRabbitWinBatch = new cc.SpriteBatchNode(texRabbitWin);
    this.addChild(this.texRabbitWinBatch);

    var texRabbitLose = cc.textureCache.addImage(res.rabbit_lose_png);
    this.texRabbitLoseBatch = new cc.SpriteBatchNode(texRabbitLose);
    this.addChild(this.texRabbitLoseBatch);


    var texExplosion = cc.textureCache.addImage(res.explosion_png);
    this.texExplosionBatch = new cc.SpriteBatchNode(texExplosion);
    this.addChild(this.texExplosionBatch);

  },
  //预置一些月饼到对象池中
  presetMoonCakes: function () {

    MoonCakeSprite.moonCakes = [];

    for (var i = 0; i < 5; i++) {
      for (var key in GC.CAKE) {
        var type = GC.CAKE[key];
        var moonCake = MoonCakeSprite.create(type);
        moonCake.active = false;
        moonCake.visible = false;
      }
    }
  },
  //预置一些到对象池中
  presetPluses: function () {

    PlusSprite.pluses = [];

    for (var i = 0; i < 5; i++) {
      for (var j = 1; j < 5; j++) {
        var value = GC.valueMap[j];
        var plus = PlusSprite.create(value);
        plus.active = false;
        plus.visible = false;
      }
    }
  },
  //键盘事件绑定
  bindEvent: function () {
    var me = this;

    document.addEventListener("keyup", function (event) {
      var modifiers = event.altKey || event.ctrlKey ||
        event.metaKey || event.shiftKey;
      var direction = GC.KEY_MAP[event.which];
      if (!modifiers) {
        if (direction !== undefined) {
          event.preventDefault();
          onKeyup(direction, me);
        }
      }

    });

    cc.eventManager.addListener({
      event: cc.EventListener.KEYBOARD,
      onKeyReleased: function (key, event) {

        var direction = GC.KEY_MAP[key];
        if (direction !== undefined) {
          onKeyup(direction, me);
        }
      }
    }, me);

    function onKeyup(direction, context) {
      var rabbit = context.rabbit;

      switch (direction) {
        case GC.MOVING.LEFT:
          if (rabbit.moving === GC.MOVING.LEFT) {
            rabbit.moving = GC.MOVING.STOP;
          }
          break;
        case GC.MOVING.RIGHT:
          if (rabbit.moving === GC.MOVING.RIGHT) {
            rabbit.moving = GC.MOVING.STOP;
          }
          break;
      }
    }

    document.addEventListener("keydown", function (event) {
      var modifiers = event.altKey || event.ctrlKey ||
        event.metaKey || event.shiftKey;
      var direction = GC.KEY_MAP[event.which];
      if (!modifiers) {
        if (direction !== undefined) {
          event.preventDefault();
          onKeyDown(direction, me);
        }
      }

    });

    cc.eventManager.addListener({
      event: cc.EventListener.KEYBOARD,
      onKeyPressed: function (key, event) {
        var direction = GC.KEY_MAP[key];
        if (direction !== undefined) {

          onKeyDown(direction, me);
        }
      }
    }, me);

    function onKeyDown(direction, context) {
      var rabbit = context.rabbit;
      switch (direction) {
        case GC.MOVING.LEFT:
          rabbit.direction = direction;
          if (rabbit.moving === GC.MOVING.STOP) {
            rabbit.moving = GC.MOVING.LEFT;
          }
          break;
        case GC.MOVING.RIGHT:
          rabbit.direction = direction;
          if (rabbit.moving === GC.MOVING.STOP) {
            rabbit.moving = GC.MOVING.RIGHT;
          }
          break;
        case GC.MOVING.UP:
          if (!rabbit.jumping) {
            rabbit.jumping = true;
            rabbit.jumpSpeed = GC.rabbit.maxJumpSpeed;
            rabbit.jumpUp = true;
            if (GC.musicOn) {
              cc.audioEngine.playEffect(res.jump_music);
            }
          }
          break;
      }
    }

  },
  //播放背景音乐
  playMusic: function () {
    if (GC.musicOn) {
      cc.audioEngine.playMusic(res.bg_music, true);
    }
  },
  //处理兔子的逻辑
  rabbitRun: function (dt) {
    var rabbit = this.rabbit;
    var w_2 = rabbit.width / 2 | 0;
    var minLeft = w_2;
    var maxLeft = GC.w - w_2;
    var delta = dt / GC.defaultInterval;
    //处理左右移动逻辑
    switch (rabbit.direction) {
      case GC.MOVING.LEFT:
        if (rabbit.moving === GC.MOVING.LEFT) {
          if (rabbit.runSpeed > -GC.rabbit.maxRunSpeed) {
            rabbit.runSpeed--;
          }
        } else if (rabbit.moving === GC.MOVING.RIGHT) {
          if (rabbit.runSpeed > 0) {
            if (!--rabbit.runSpeed) {
              rabbit.moving = GC.MOVING.LEFT;
            }
          }
        } else {
          if (rabbit.runSpeed < 0) {
            rabbit.runSpeed++;
          } else if (rabbit.runSpeed > 0) {
            rabbit.runSpeed--;
          } else {
            rabbit.step = GC.rabbit.step[rabbit.direction];
          }
        }

        if (rabbit.runSpeed != 0 || rabbit.moving !== GC.MOVING.STOP) {
          rabbit.leftCount = rabbit.leftCount + ((delta + 0.5) | 0);
          rabbit.step = ((rabbit.leftCount / GC.rabbit.frameInterval) | 0) % GC.rabbit.frameLength + 1;
        }
        break;

      case GC.MOVING.RIGHT:
        if (rabbit.moving === GC.MOVING.RIGHT) {
          if (rabbit.runSpeed < GC.rabbit.maxRunSpeed) {
            rabbit.runSpeed++;
          }
        } else if (rabbit.moving === GC.MOVING.LEFT) {
          if (rabbit.runSpeed < 0) {
            if (!++rabbit.runSpeed) {
              rabbit.moving = GC.MOVING.RIGHT;
            }
          }
        } else {
          if (rabbit.runSpeed > 0) {
            rabbit.runSpeed--;
          } else if (rabbit.runSpeed < 0) {
            rabbit.runSpeed++;
          } else {
            rabbit.step = GC.rabbit.step[rabbit.direction];
          }
        }
        if (rabbit.runSpeed != 0 || rabbit.moving !== GC.MOVING.STOP) {
          rabbit.rightCount = rabbit.rightCount + ((delta + 0.5) | 0);
          rabbit.step = ((rabbit.rightCount / GC.rabbit.frameInterval) | 0) % GC.rabbit.frameLength + 1;
        }
        break;
    }
    rabbit.x = Math.min(maxLeft, Math.max(minLeft, rabbit.x + (rabbit.runSpeed / 4 * delta)));
    //处理上下跳跃逻辑
    if (rabbit.jumping) {
      if (rabbit.jumpUp) {
        rabbit.y = rabbit.y + rabbit.jumpSpeed / 4 * delta;
        if (!--rabbit.jumpSpeed) {
          rabbit.jumpUp = false;
        }
      } else {
        rabbit.y = Math.max(GC.rabbit.y, rabbit.y - rabbit.jumpSpeed / 4 * delta)
        rabbit.jumpSpeed++;
        if (rabbit.y === GC.rabbit.y) {
          rabbit.jumping = false;
          rabbit.jumpSpeed = GC.rabbit.maxJumpSpeed;
        }
      }
      rabbit.step = GC.rabbit.stepJump[rabbit.direction];
    }
    rabbit.update();
  },
  //创建道具
  createProp: function (type) {
    if (this.propMap[type])
      return;
    this.propMap[type] = 1;
    var prop = new PropSprite(type);
    var w_2 = prop.width / 2 | 0;
    var h_2 = prop.height / 2 | 0;
    prop.x = (Math.random() * (GC.w - w_2)) | 0 + w_2;
    prop.y = GC.h - h_2;
    this.props.push(prop);
    var speed = GC.speedMap[(Math.random() * 4) | 0];
    var actionTo = cc.moveTo(speed, cc.p(prop.x, h_2));
    var actionFadeOut = cc.fadeOut(1);
    var callback = cc.callFunc(function (prop) {
      prop.destroy();
    });
    prop.runAction(cc.sequence(actionTo, actionFadeOut, callback));
    this.texIconsBatch.addChild(prop);
  },
  //随机创建月饼
  crateMoonCakeRan: function () {
    var ran = Math.random();
    var boomRate = GC.difficultyMap[this.difficulty] * this.level;
    var hugeRate = 1 - boomRate;
    var smallRate = hugeRate / 4;
    var normalRate = smallRate * 2;
    var bigRate = smallRate * 3;
    var type;
    switch (true) {
      case ran >= hugeRate:
        type = GC.CAKE.BOOM;
        break;
      case ran >= bigRate:
        type = GC.CAKE.HUGE;
        break;
      case ran >= normalRate:
        type = GC.CAKE.BIG
        break;
      case ran >= smallRate:
        type = GC.CAKE.NORMAL;
        break;
      default:
        type = GC.CAKE.SMALL;
        break;
    }
    var speed = GC.speedMap[(Math.random() * 4) | 0];
    this.createMoonCake(type, speed);
  },
  //创建月饼
  createMoonCake: function (type, speed, x, y) {

    var moonCake = MoonCakeSprite.getOrCreateMoonCake(type);
    var w_2 = moonCake.width / 2 | 0;
    var h_2 = moonCake.height / 2 | 0;
    moonCake.x = typeof (x) !== "undefined" ? x : (Math.random() * (GC.w - w_2)) | 0 + w_2;
    moonCake.y = typeof (y) !== "undefined" ? y : GC.h - h_2;
    this.moonCakes.push(moonCake);
    var actionTo = cc.moveTo(speed, cc.p(moonCake.x, h_2));
    var actionFadeOut = cc.fadeOut(1);
    var callback = cc.callFunc(function (moonCake) {
      moonCake.destroy();
    });
    moonCake.runAction(cc.sequence(actionTo, actionFadeOut, callback));
    this.texIconsBatch.addChild(moonCake);
  },
  //创建hao123月饼
  createHao123: function () {
    for (var i = 0, count = GC.hao123Map.length; i < count; i++) {
      var letter = GC.hao123Map[i];
      for (var j = 0, len = letter.length; j < len; j++) {
        var position = letter[j];
        var x = position[0] * GC.hao123.size + GC.hao123.space * i;
        var y = GC.h - position[1] * GC.hao123.size;
        var speed =  y * GC.hao123.speed / GC.h;
        this.createMoonCake(GC.hao123.type, speed, x, y);
      }
    }
  },
  //游戏时每帧刷新回调函数
  update: function (dt) {
    if (this.state === GC.GAME_STATE.PLAY) {
      if (this.rabbit.growing)
        return;

      this.rabbitRun(dt);

      this.updateMoonCakes();

      this.updateProps();

      if (this.totalTime - this.spendTime <= 5) {
        if (!this.createdeHao123) {
          this.createdeHao123 = true;
          this.createHao123();
        }
      } else {
        //每30帧创建一个月饼
        if (++this.gameFrame % 30 === 0) {
          this.crateMoonCakeRan();
        }
      }

      this.checkIsCollide();

      this.spendTime += dt;

      this.updateTime();

      //判断游戏时间处理不同逻辑
      switch (true) {
        case this.spendTime >= this.totalTime:
          this.gameOver(GC.GAME_RESULT.WIN);
          return;
        case this.spendTime >= 40:
          this.level = 3;
          this.createProp(GC.PROP.LESSBOOM);
          break;
        case this.spendTime >= 30:
          this.createProp(GC.PROP.CLOCK);
          break;
        case this.spendTime >= 20:
          this.level = 2;
          this.createProp(GC.PROP.CARROT);
          break;
        case this.spendTime >= 10:
          this.createProp(GC.PROP.BASKET);
          break;
      }

    }
  },
  //更新月饼
  updateMoonCakes: function () {
    var moonCakes = this.moonCakes;
    var len = moonCakes.length;

    while (len--) {
      var moonCake = moonCakes[len];
      if (!moonCake.active) {
        moonCakes.splice(len, 1);
      } else {
        moonCake.update();
      }
    }
  },
  //更新道具
  updateProps: function () {
    var props = this.props;
    var len = props.length;
    while (len--) {
      var prop = props[len];
      if (!prop.active) {
        props.splice(len, 1);
      } else {
        prop.update();
      }
    }
  },
  //更新记分牌
  updateScore: function () {
    if (this.state === GC.GAME_STATE.PLAY) {
      var me = this;
      for (var i = 0, len = GC.scoreLen; i < len; i++) {
        (function (index) {
          var spScore = me.scores[index];

          var base = Math.pow(10, len - index);
          var value = ((me.score % base) * 10 / base) | 0;

          spScore.update(value);

        })(i);
      }
    }
  },
  //更新倒计时
  updateTime: function () {
    if (this.state === GC.GAME_STATE.PLAY) {
      var me = this;
      for (var i = 0, len = GC.timeLen; i < len; i++) {
        (function (index) {
          var spTime = me.times[index];
          var rest = Math.max(0, (me.totalTime - (me.spendTime - 0.5) | 0) | 0);
          var base = Math.pow(10, len - index);
          var value = ((rest % base) * 10 / base) | 0;

          spTime.update(value);

        })(i);
      }
    }
  },
  //碰撞检测
  checkIsCollide: function () {

    var moonCake;
    for (var i = 0, len = this.moonCakes.length; i < len; i++) {
      moonCake = this.moonCakes[i];
      if (moonCake.active) {
        var rabbit = this.rabbit;
        if (this.collide(moonCake, rabbit)) {
          moonCake.hurt();
          rabbit.hurt(moonCake);
          this.score += moonCake.value;
          var score = this.score;
          this.updateScore();
          switch (true) {
            case score >= GC.score.overflow:
              rabbit.basket = GC.BASKET.OVERFLOW;
              break;
            case score >= GC.score.full:
              rabbit.basket = GC.BASKET.FULL;
              break;
            case this.score >= GC.score.little:
              rabbit.basket = GC.BASKET.LITTLE;
              break;
          }
          if (moonCake.type === GC.CAKE.BOOM) {
            if (!--this.life) {
              moonCake.destroy();
              this.gameOver(GC.GAME_RESULT.LOSE);
            }
            this.spLife.update(this.life);
          }
        }
      }
    }

    var prop;
    for (var i = 0, len = this.props.length; i < len; i++) {
      prop = this.props[i];
      if (prop.active) {
        var rabbit = this.rabbit;
        if (this.collide(prop, rabbit)) {
          prop.hurt();
          switch (prop.type) {
            case GC.PROP.BASKET:
              prop.visible = false;
              var moonCakes = this.moonCakes;
              len = moonCakes.length;
              for (var i = 0; i < len; i++) {
                var moonCake = this.moonCakes[i];
                moonCake.pauseSchedulerAndActions();
              }
              var action = cc.blink(1, 3);
              var callback = cc.callFunc(function () {
                rabbit.growing = false;
                rabbit.type = GC.RABBIT.BIG;
                for (var i = 0; i < len; i++) {
                  var moonCake = moonCakes[i];
                  moonCake.resumeSchedulerAndActions();
                }
              });
              rabbit.growing = true;
              rabbit.runAction(cc.sequence(action, callback));
              if (GC.musicOn) {
                cc.audioEngine.playEffect(res.basket_music);
              }
              break;
            case GC.PROP.CARROT:
              this.life++;
              this.spLife.update(this.life);
              if (GC.musicOn) {
                cc.audioEngine.playEffect(res.life_music);
              }
              break;
            case GC.PROP.LESSBOOM:
              this.difficulty = GC.DIFFICULTY.EASY;
              if (GC.musicOn) {
                cc.audioEngine.playEffect(res.lessboom_music);
              }
              break;
            case GC.PROP.CLOCK:
              this.totalTime += 30;
              if (GC.musicOn) {
                cc.audioEngine.playEffect(res.clock_music);
              }
              break;
          }
        }

      }
    }
  },
  //检测算法
  collide: function (a, b) {
    var ax = a.x;
    var ay = a.y;
    var bx = b.x;
    var by = b.y;

    var aRect = a.collideRect(ax, ay);
    var bRect = b.collideRect(bx, by);
    return cc.rectIntersectsRect(aRect, bRect);
  },
  //游戏结束
  gameOver: function (result) {
    this.state = GC.GAME_STATE.OVER;
    if (result === GC.GAME_RESULT.WIN) {
      this.rabbit.playWin();
    }
    else {
      this.rabbit.playLose();
    }
    cc.audioEngine.stopMusic();
    var moonCakes = this.moonCakes;
    var len = moonCakes.length;

    while (len--) {
      var moonCake = moonCakes[len];
      moonCake.stopAllActions();
    }
    var props = this.props;
    len = props.length;
    while (len--) {
      var pro = props[len];
      pro.stopAllActions();
    }

  }

});
