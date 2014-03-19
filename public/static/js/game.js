/*
* 
*           File:  game.js
*           Path:  /widget/zhongqiu/game.js
*         Author:  HuangYi
*       Modifier:  HuangYi
*       Modified:  2013-8-29
*    Description:  游戏类，整个游戏的控制中心，包括游戏的开始、结束、退出；场景创建，加分逻辑判断，生命值，倒计时，记分牌等。
*
*/
define(function (require, exports, module) {

    var events = require("events"),
        config = require("config"),
        imageloader = require("imageloader"),
        MoonCake = require("moonCake"),
        Rabbit = require("rabbit"),
        Sprite = require("sprite"),
        AudioPool = require("audioPool"),
        Timeline = require("timeline"),
        Stage = require("stage");

    var canvasConf = config.get("canvas"),
        stageConf = config.get("stage"),
        cakeConf = config.get("cake"),
        resultConf = config.get("result"),
        gameConf = config.get("game"),
        soundConf = config.get("sound"),
        rabbitConf = config.get("rabbit"),
        stateConf = config.get("state"),
        cakeConf = config.get("cake"),
        scoreConf = config.get("score"),
        basketConf = config.get("basket"),
        images = config.get("image");

    var scoreWidthMap = [42, 52, 52, 52], //分宽度
        difficultyMap = [0.05, 0.1], //炸弹概率，游戏难度而定
        speedMap = [2, 3, 4, 5], //月饼掉落速度
        lifeMap = ["217 84", "37 84", "217 0", "37 0"], //生命条
        scoreMap = ["277 244", "72 244", "94 244", "118 244", "140 244", "163 244", "186 244", "209 244", "232 244", "254 244"], //记分牌
        timeMap = ["332 179", "6 179", "41 179", "78 179", "113 179", "150 179", "187 179", "224 179", "259 179", "295 179"], //倒计时
        plusMap = ["250 292", "186 292", "124 292", "66 292"],  //加分
        hao123Map = [
                  [
                   [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 1], [2, 1], [3, 2], [3, 3], [3, 4]
                  ], //h
                  [
                   [4, 2], [4, 3], [5, 1], [5, 4], [6, 1], [6, 4], [7, 1], [7, 2], [7, 3], [7, 4]
                  ], //a
                  [
                    [8, 2], [8, 3], [9, 1], [9, 4], [10, 1], [10, 4], [11, 2], [11, 3]
                  ], //o
                  [
                   [12, 0], [13, 0], [13, 1], [13, 2], [13, 3], [13, 4]
                  ], //1
                  [
                     [14, 0], [14, 3], [14, 4], [15, 0], [15, 2], [15, 4], [16, 0], [16, 2], [16, 4], [17, 1], [17, 4]
                  ], //2
                  [
                    [18, 0], [18, 4], [19, 0], [19, 2], [19, 4], [20, 0], [20, 2], [20, 4], [21, 1], [21, 3]
                  ]//3
                ],
         keyCodeMap = {
             Left: 37,
             Right: 39
         },
         defaultInterval = 1000 / 60;

    function Game() { }

    Game.prototype = new Stage();

    Game.prototype.init = function (context) {
        var me = this;
        if (this.state >= stateConf.start)
            return;
        this.state = stateConf.start;
        Stage.call(this, context, canvasConf.width, canvasConf.height);
        this.preloadImage(function (success) {
            if (success) {
                me.spendTime = 0;
                me.score = 0;
                me.level = 1;
                me.gameFrame = 0;
                me.difficulty = gameConf.difficulty;
                me.totalTime = gameConf.time;
                me.rabbitType = gameConf.rabbitType;
                me.restLife = gameConf.life;
                me.moonCakes = [];
                me.pluss = [];
                // this.rabbit = new Rabbit();
                //this.add(this.rabbit);
                me.cakeAudioPool = new AudioPool(soundConf.cake);
                me.boomAudioPool = new AudioPool(soundConf.boom);
                me.winAudioPool = new AudioPool(soundConf.win);
                me.loseAudioPool = new AudioPool(soundConf.lose);
                me.drawStage().drawTime().drawLife().drawScore().drawRabbit().start();
                //this.drawLife();
                me.lastTick = 0;
                me.tick = new Timeline(); //计时器
                me.tick.onenterframe = function (time) {
                    me.Ticking(time);
                };
                me.tick.start();
                me.bindEvent();
            } else {
                throw new Error("fail to load images");
            }
        });
    };

    /*图片预加载*/
    Game.prototype.preloadImage = function (callback) {
        imageloader(images, function (success) {
            callback(success);
        });
    };

    /*画舞台*/
    Game.prototype.drawStage = function () {
        var width = stageConf.width,
            height = stageConf.height;
        //var me = this;
        this.stage = new Sprite(function (context, time) {
            //console.log(context == me.context);
            context.drawImage(images.bg.img, 140, 0, width, height, 0, 0, width, height);
            //context.drawImage(document.getElementById("hehe"), 0, 0);
        });
        this.stage.x = 0,
        this.stage.y = canvasConf.height - height;
        this.add(this.stage);
        return this;
    };

    /*画倒计时*/
    Game.prototype.drawTime = function () {
        var me = this,
            icon = images.icon.img,
            width = 25,
            height = 35,
            timeLen = 2,
            time;

        for (var i = 0; i < timeLen; i++) {
            (function (index) {
                time = new Sprite(function (context, time) {
                    var time = Math.max(0, Math.floor(me.totalTime - Math.floor(me.spendTime / 1000))),
                        base = Math.pow(10, timeLen - index),
                        num = ((time % base) * 10 / base) | 0;
                    draw(context, num);
                });
                time.x = 20 + index * width;
                time.y = 94;
                me.stage.add(time);
            })(i);
        }

        function draw(context, num) {
            var positions = timeMap[num].split(' ');
            context.drawImage(icon, positions[0], positions[1], width, height, 0, 0, width, height);
        }

        return this;
    };

    /*画生命条*/
    Game.prototype.drawLife = function () {
        var me = this,
            icon = images.icon.img,
            width = 125,
            height = 70,
            life;

        life = new Sprite(function (context, time) {
            var positions = lifeMap[me.restLife].split(' ');
            context.drawImage(icon, positions[0], positions[1], width, height, 0, 0, width, height);
        });
        life.x = 50;
        life.y = 180;

        this.stage.add(life);

        return this;
    };

    /*画分数*/
    Game.prototype.drawScore = function () {
        var me = this,
            icon = images.icon.img,
            width = 17,
            height = 25,
            scoreLen = 7,
            score;

        for (var i = 0; i < scoreLen; i++) {
            (function (index) {
                score = new Sprite(function (context, time) {
                    var base = Math.pow(10, scoreLen - index),
                        num = ((me.score % base) * 10 / base) | 0;
                    draw(context, num);
                });
                score.x = 829 + width * index;
                score.y = 28;
                me.stage.add(score);
            })(i);
        }

        function draw(context, num) {
            var positions = scoreMap[num].split(' ');
            context.drawImage(icon, positions[0], positions[1], width, height, 0, 0, width, height);
        }

        return this;
    };

    /*画加分*/
    Game.prototype.drawPlus = function (type, x, y) {
        var me = this,
            icon = images.icon.img,
            width = scoreWidthMap[type],
            height = 14,
            plus;

        plus = new Sprite(doDraw)
        plus.lastTick = this.lastTick;
        plus.x = x;
        plus.alpha = 1;
        plus.y = y || 156;
        this.stage.add(plus);

        return this;

        function doDraw(context, time) {
            var that = this,
                positions = plusMap[type].split(' '),
                ratio = (time - this.lastTick) / defaultInterval;
            this.lastTick = time;
            this.y = Math.max(80, this.y - (3 * ratio) | 0);
            if (this.y == 80) {
                this.alpha = Math.max(0, (this.alpha - 0.03 * ratio));
                context.globalAlpha = this.alpha;
                if (this.alpha == 0) {
                    setTimeout(function () {
                        that.parent.remove(that);
                    }, 0);
                }
            }
            context.drawImage(icon, positions[0], positions[1], width, height, 0, 0, width, height);
            context.globalAlpha = 1;
        }
    };



    /*画兔子*/
    Game.prototype.drawRabbit = function () {
        this.rabbit = Rabbit(images);
        this.rabbit.x = Math.floor(canvasConf.width / 2);
        this.rabbit.y = 170;
        this.stage.add(this.rabbit);
        return this;
    };

    /*画月饼*/
    Game.prototype.drawMoonCake = function (type, image, speed) {
        var moonCake;
        moonCake = MoonCake({
            type: type,
            image: image,
            speed: speed
        });
        moonCake.x = (Math.random() * (canvasConf.width - moonCake.width)) | 0;
        this.moonCakes.push(moonCake);
        this.add(moonCake);
        return this;
    };

    /*游戏计时*/
    Game.prototype.Ticking = function (time) {
        var me = this,
            ratio = (time - this.lastTick) / defaultInterval,
            rabbit = this.rabbit,
            minLeft = 0,
            maxLeft = canvasConf.width - rabbit.width,
            maxHeight,
            cake,
            cakeLen = this.moonCakes.length,
            plus,
            plusLen = this.pluss.length;
        //记录游戏时间
        this.spendTime = time;
        this.lastTick = time;
        //处理兔子的逻辑
        switch (rabbit.moving) {
            case rabbitConf.left:
                if (rabbit.speed < rabbitConf.maxSpeed) {
                    rabbit.speed++;
                }
                if (rabbit.x > minLeft) {
                    rabbit.x = Math.max(minLeft, rabbit.x - (rabbit.speed * ratio) | 0);
                }
                if (rabbit.leftCount++ % rabbitConf.frameInterval == 0) {
                    if (++rabbit.leftFrame == rabbitConf.frameLength) {
                        rabbit.leftFrame = 0;
                    }
                }
                break;
            case rabbitConf.right:
                if (rabbit.speed < rabbitConf.maxSpeed) {
                    rabbit.speed++;
                }
                if (rabbit.x < maxLeft) {
                    rabbit.x = Math.min(maxLeft, rabbit.x + (rabbit.speed * ratio) | 0);
                }
                if (rabbit.rightCount++ % rabbitConf.frameInterval == 0) {
                    if (++rabbit.rightFrame == rabbitConf.frameLength) {
                        rabbit.rightFrame = 0;
                    }
                }
                break;
        }
        //随机创建月饼
        if (++this.gameFrame % 30 == 0) {
            drawMooncakeRan.call(this);
        }
        //处理月饼下落逻辑
        while (cakeLen--) {
            cake = this.moonCakes[cakeLen];
            maxHeight = canvasConf.height - cake.height;
            cake.y = Math.min(maxHeight, cake.y + (cake.speed * ratio) | 0);
            if (cake.y == maxHeight) {
                cake.alpha = Math.max(0, cake.alpha - 0.02 * ratio);
                if (cake.alpha == 0) {
                    this.remove(cake);
                    this.moonCakes.splice(cakeLen, 1);
                }
            } else {
                this.collisionDetect(cake, cakeLen);
            }
        }

    };

    function drawMooncakeRan() {
        var ran, boomRate, superRate, smallRate,
                normalRate, bigRate, type, speed;
        ran = Math.random();
        boomRate = difficultyMap[this.difficulty] * this.level;
        superRate = 1 - boomRate;
        smallRate = (superRate) / 4;
        normalRate = smallRate * 2;
        bigRate = smallRate * 3;
        switch (true) {
            case ran >= superRate:
                type = cakeConf.boom;
                break;
            case ran >= bigRate:
                type = cakeConf.huge;
                break;
            case ran >= normalRate:
                type = cakeConf.big;
                break;
            case ran >= smallRate:
                type = cakeConf.normal;
                break;
            default:
                type = cakeConf.small;
                break;
        }
        speed = speedMap[(Math.random() * 4) | 0];
        this.drawMoonCake(type, images.icon, speed);
    }

    /*碰撞检测*/
    Game.prototype.collisionDetect = function (cake, len) {
        var rabbit = this.rabbit;
        if (cake.y > canvasConf.height - cake.height - rabbit.height && cake.y < canvasConf.height - cake.height) {
            if (cake.x + cake.width >= rabbit.x && cake.x <= rabbit.x + rabbit.width) {
                switch (cake.type) {
                    case cakeConf.boom: //炸弹
                        //cake.boom();
                        this.boomAudioPool.play();
                        if (this.restLife--) {
                            this.result = resultConf.lose;
                            this.gameOver();
                        }
                        break;
                    default:
                        //播放背景音乐
                        this.cakeAudioPool.play();
                        this.score += cake.value;
                        switch (true) {
                            case this.score >= scoreConf.overflow:
                                rabbit.basketState = basketConf.overflow;
                                break;
                            case this.score >= scoreConf.full:
                                rabbit.basketState = basketConf.full;
                                break;
                            case this.score >= scoreConf.little:
                                rabbit.basketState = basketConf.little;
                                break;
                        }
                        this.drawPlus(cake.type, cake.x);
                        break;
                }
                this.remove(cake);
                this.moonCakes.splice(len, 1);
            }
        }
    };

    /*游戏结束*/
    Game.prototype.gameOver = function () {
        this.state = stateConf.end;
        //this.tick.stop();
        //this.stop();
    };

    /*事件绑定*/
    Game.prototype.bindEvent = function () {
        var me = this;
        document.addEventListener("keydown", function (e) {
            me.onKeyDown(e);
        });
        document.addEventListener("keyup", function (e) {
            me.onKeyUp(e);
        });
    };

    /*键盘按下*/
    Game.prototype.onKeyDown = function (e) {
        var rabbit = this.rabbit;
        switch (e.keyCode) {
            case keyCodeMap.Left: //left
                rabbit.moving = rabbit.direction = rabbitConf.left;
                break;
            case keyCodeMap.Right: //right
                rabbit.moving = rabbit.direction = rabbitConf.right;
                break;
        }
    };

    /*键盘弹起*/
    Game.prototype.onKeyUp = function (e) {
        var rabbit = this.rabbit;
        switch (e.which) {
            case keyCodeMap.Left: //left
                if (rabbit.moving == rabbitConf.left) {
                    rabbit.direction = rabbitConf.left;
                    rabbit.moving = rabbitConf.stop;
                    rabbit.leftFarme = rabbitConf.leftDefaultFrame;
                    rabbit.leftCount = 0;
                    rabbit.speed = 0;
                }
                break;
            case keyCodeMap.Right: //right
                if (rabbit.moving == rabbitConf.right) {
                    rabbit.direction = rabbitConf.right;
                    rabbit.moving = rabbitConf.stop;
                    rabbit.rightFrame = rabbitConf.rightDefaultFrame;
                    rabbit.rightCount = 0;
                    rabbit.speed = 0;
                }
                break;
        }
    };

    var game = new Game();

    module.exports = game;
});