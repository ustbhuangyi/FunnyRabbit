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

    var config = require("config"),
        imageloader = require("imageloader"),
        MoonCake = require("moonCake"),
        Rabbit = require("rabbit"),
        Sprite = require("sprite"),
        AudioPool = require("audioPool"),
        Timeline = require("timeline"),
        Stage = require("stage");

    var canvasConf = config.get("canvas"),
        cakeConf = config.get("cake"),
        resultConf = config.get("result"),
        gameConf = config.get("game"),
        soundConf = config.get("sound"),
        rabbitConf = config.get("rabbit"),
        scoreConf = config.get("score"),
        basketConf = config.get("basket"),
        haoConf = config.get("hao"),
        images = config.get("image");

    var scoreWidthMap = [42, 52, 52, 52], //分宽度
        difficultyMap = [0.05, 0.1], //炸弹概率，游戏难度而定
        speedMap = [2, 3, 4, 5], //月饼掉落速度
        lifeMap = ["217 84", "37 84", "217 0", "37 0"], //生命条
        boomMap = ["0 0", "138 0", "291 0", "436 0"], //炸弹坐标
        scoreMap = ["277 244", "72 244", "94 244", "118 244", "140 244", "163 244", "186 244", "209 244", "232 244", "254 244"], //记分牌
        timeMap = ["332 179", "6 179", "41 179", "78 179", "113 179", "150 179", "187 179", "224 179", "259 179", "295 179"], //倒计时
        plusMap = ["250 292", "186 292", "124 292", "66 292"],  //加分
        rabbitLoseMap = ["0 0", "163 0", "327 0", "491 0", "655 0", "819 0", "0 135", "166 135", "333 135", "500 135", "668 135", "835 135", "0 262"], //兔子被炸动画
        rabbitWinMap = ["0 0", "198 0", "401 0", "609 0", "816 0", "0 96", "208 97", "415 97", "623 97", "831 97", "0 203", "207 203", "415 203", "623 203", "831 203", "0 307", "206 307", "414 307", "623 307"], //兔子胜利动画
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
         state = {
             uninit: 0,
             start: 1,
             end: 2
         },
         defaultInterval = 1000 / 60;


    /*绘制动画统一方法*/
    function drawAnimation(context, time) {
        var me = this,
            width = this.width,
            height = this.height,
            frameLen = this.map.length - 1,
            delta = (time - this.lastTick) / defaultInterval,
            positions;
        this.lastTick = time;
        this.frameCount = this.frameCount + ((delta + 0.5) | 0);
        this.frame = Math.min(frameLen, ((this.frameCount / this.frameInterval) | 0));
        positions = this.map[this.frame].split(' ');
        context.drawImage(this.image, positions[0], positions[1], width, height, 0, 0, width, height);
        if (this.frame == frameLen) {
            if (!this.removed) {
                this.removed = true;
                setTimeout(function () {
                    me.parent.remove(me);
                    me.callback && me.callback();
                }, 200);
            }
        }
    }

    /*加分onPaint*/
    function doDrawPlus(context, time) {
        var me = this,
            width = this.width,
            height = this.height,
            positions = this.positions,
            delta = (time - this.lastTick) / defaultInterval;
        this.lastTick = time;
        this.y = Math.max(80, this.y - (3 * delta) | 0);
        if (this.y == 80) {
            this.alpha = Math.max(0, (this.alpha - 0.03 * delta));
            context.globalAlpha = this.alpha;
            if (this.alpha == 0) {
                setTimeout(function () {
                    me.parent.remove(me);
                }, 0);
            }
        }
        context.drawImage(this.image, positions[0], positions[1], width, height, 0, 0, width, height);
        context.globalAlpha = 1;
    }

    /*随机创建月饼*/
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
        this.drawMoonCake(type, images.icon.img, speed);
    }

    function Game() {
        this.state = state.uninit;
    }

    Game.prototype = new Stage();

    Game.prototype.init = function (context) {
        var me = this;
        if (this.state == state.start)
            return false;
        this.state = state.start;
        Stage.call(this, context, canvasConf.width, canvasConf.height);
        this.preloadImage(function (success) {
            if (success) {
                me.spendTime = 0;
                me.score = 0;
                me.level = 1;
                me.gameFrame = 0;
                me.result = resultConf.win;
                me.difficulty = gameConf.difficulty;
                me.totalTime = gameConf.time;
                me.rabbitType = gameConf.rabbitType;
                me.restLife = gameConf.life;
                me.disposed = false;
                me.needDrawHao123 = Math.random() <= haoConf.chance;
                me.moonCakes = [];
                me.onceMap = {};
                // this.rabbit = new Rabbit();
                //this.add(this.rabbit);
                me.bgAudioPool = new AudioPool(soundConf.bg);
                me.cakeAudioPool = new AudioPool(soundConf.cake);
                me.boomAudioPool = new AudioPool(soundConf.boom);
                me.winAudioPool = new AudioPool(soundConf.win);
                me.loseAudioPool = new AudioPool(soundConf.lose);
                //me.bgAudioPool.play();
                me.drawStage().drawTime().drawLife().drawScore().drawRabbit().start();
                //this.drawLife();
                me.lastTick = 0;
                me.tick = new Timeline(); //计时器
                me.tick.onenterframe = function (time) {
                    me.Ticking(time);
                }; 11
                me.tick.start();
                me.bindEvent();

            } else {
                throw new Error("fail to load images");
            }

        });
        return true;
    };

    /*图片预加载*/
    Game.prototype.preloadImage = function (callback) {
        imageloader(images, function (success) {
            callback(success);
        });
    };

    /*画舞台*/
    Game.prototype.drawStage = function () {
        var width = 1000,
            height = 250;
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
            image = images.icon.img,
            width = 25,
            height = 35,
            timeLen = 2,
            time;

        for (var i = 0; i < timeLen; i++) {
            (function (index) {
                time = new Sprite(function (context, time) {
                    var time = Math.max(0, (me.totalTime - ((me.spendTime / 1000) - 0.5) | 0) | 0),
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
            context.drawImage(image, positions[0], positions[1], width, height, 0, 0, width, height);
        }

        return this;
    };

    /*画生命条*/
    Game.prototype.drawLife = function () {
        var me = this,
            image = images.icon.img,
            width = 125,
            height = 70,
            life;

        life = new Sprite(function (context, time) {
            var positions = lifeMap[me.restLife].split(' ');
            context.drawImage(image, positions[0], positions[1], width, height, 0, 0, width, height);
        });
        life.x = 50;
        life.y = 180;

        this.stage.add(life);

        return this;
    };

    /*画分数*/
    Game.prototype.drawScore = function () {
        var me = this,
            image = images.icon.img,
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
            context.drawImage(image, positions[0], positions[1], width, height, 0, 0, width, height);
        }

        return this;
    };

    /*画加分*/
    Game.prototype.drawPlus = function (type, x, y) {
        var plus = new Sprite(doDrawPlus);
        plus.lastTick = this.lastTick;
        plus.x = x;
        plus.alpha = 1;
        plus.type = type;
        plus.y = y || 156;
        plus.width = scoreWidthMap[type];
        plus.height = 14;
        plus.image = images.icon.img;
        plus.positions = plusMap[type].split(' ');
        this.stage.add(plus);

        return this;

    };

    /*画兔子*/
    Game.prototype.drawRabbit = function () {
        this.rabbit = Rabbit(images);
        this.rabbit.x = (canvasConf.width / 2) | 0;
        this.rabbit.y = 170;
        this.stage.add(this.rabbit);
        return this;
    };

    /*画月饼*/
    Game.prototype.drawMoonCake = function (type, image, speed, x, y) {
        var moonCake;
        moonCake = MoonCake({
            type: type,
            image: image,
            speed: speed
        });
        moonCake.x = typeof (x) !== "undefined" ? x : (Math.random() * (canvasConf.width - moonCake.width)) | 0;
        moonCake.y = typeof (y) !== "undefined" ? y : 0;
        this.moonCakes.push(moonCake);
        this.add(moonCake);
        return this;
    };

    /*彩蛋hao123*/
    Game.prototype.drawHao123 = function () {
        var cake, letter, position;
        for (var i = 0, count = hao123Map.length; i < count; i++) {
            letter = hao123Map[i];
            for (var j = 0, len = letter.length; j < len; j++) {
                position = letter[j];
                this.drawMoonCake(haoConf.type, images.icon.img, haoConf.speed, position[0] * haoConf.size + haoConf.space * i, position[1] * haoConf.size);
            }
        }
    };

    /*游戏计时*/
    Game.prototype.Ticking = function (time) {
        var me = this,
            delta = (time - this.lastTick) / defaultInterval,
            rabbit = this.rabbit,
            minLeft = 0,
            maxLeft = canvasConf.width - rabbit.width,
            maxHeight,
            cake,
            cakeLen = this.moonCakes.length;
        if (this.state != state.start)
            return;
        //记录游戏时间
        this.spendTime = time;
        //判断游戏时间处理不同逻辑
        switch (true) {
            case this.spendTime >= this.totalTime * 1000:
                this.gameOver();
                return;
            case this.spendTime >= 40 * 1000:
                this.level = 3;
                this.drawOnce(cakeConf.lessBoom);
                break;
            case this.spendTime >= 30 * 1000:
                this.drawOnce(cakeConf.clock);
                break;
            case this.spendTime >= 20 * 1000:
                this.level = 2;
                this.drawOnce(cakeConf.carrot);
                break;
            case this.spendTime >= 10 * 1000:
                this.drawOnce(cakeConf.basket);
                break;
        }
        this.lastTick = time;
        //处理兔子的逻辑
        switch (rabbit.moving) {
            case rabbitConf.left:
                if (rabbit.speed < rabbitConf.maxSpeed) {
                    rabbit.speed++;
                }
                if (rabbit.x > minLeft) {
                    rabbit.x = Math.max(minLeft, rabbit.x - (rabbit.speed * delta) | 0);
                }
                rabbit.leftCount = rabbit.leftCount + ((delta + 0.5) | 0);
                rabbit.leftFrame = ((rabbit.leftCount / rabbitConf.frameInterval) | 0) % rabbitConf.frameLength;

                break;
            case rabbitConf.right:
                if (rabbit.speed < rabbitConf.maxSpeed) {
                    rabbit.speed++;
                }
                if (rabbit.x < maxLeft) {
                    rabbit.x = Math.min(maxLeft, rabbit.x + (rabbit.speed * delta) | 0);
                }
                rabbit.rightCount = rabbit.rightCount + ((delta + 0.5) | 0);
                rabbit.rightFrame = ((rabbit.rightCount / rabbitConf.frameInterval) | 0) % rabbitConf.frameLength;
                break;
        }
        //需要画hao123月饼
        if (this.needDrawHao123 && ((this.totalTime - this.spendTime / 1000) | 0) <= 5) {
            if (!this.drawingHao123) {
                this.drawingHao123 = true;
                this.drawHao123();
            }
        }
        //随机创建月饼
        else {
            if (++this.gameFrame % 30 == 0) {
                drawMooncakeRan.call(this);
            }
        }
        //处理月饼下落逻辑
        while (cakeLen--) {
            cake = this.moonCakes[cakeLen];
            maxHeight = canvasConf.height - cake.height;
            cake.y = Math.min(maxHeight, cake.y + (cake.speed * delta) | 0);
            if (cake.y == maxHeight) {
                cake.alpha = Math.max(0, cake.alpha - 0.03 * delta);
                if (cake.alpha == 0) {
                    this.remove(cake);
                    this.moonCakes.splice(cakeLen, 1);
                }
            } else {
                this.collisionDetect(cake, cakeLen);
            }
        }

    };

    /*碰撞检测*/
    Game.prototype.collisionDetect = function (cake, len) {
        var rabbit = this.rabbit;
        if (cake.y > canvasConf.height - cake.height - rabbit.height && cake.y < canvasConf.height - cake.height) {
            if (cake.x + cake.width >= rabbit.x && cake.x <= rabbit.x + rabbit.width) {
                switch (cake.type) {
                    case cakeConf.boom: //炸弹
                        this.drawBoom(cake.x);
                        this.boomAudioPool.play();
                        if (! --this.restLife) {
                            this.result = resultConf.lose;
                            this.gameOver();
                        }
                        break;
                    case cakeConf.clock: //时钟
                        this.cakeAudioPool.play();
                        this.totalTime += 30;
                        break;
                    case cakeConf.carrot: //胡萝卜
                        this.cakeAudioPool.play();
                        this.restLife++;
                        break;
                    case cakeConf.lessBoom: //少雷
                        this.cakeAudioPool.play();
                        this.difficulty = 1;
                        break;
                    case cakeConf.basket: //加大篮筐
                        this.cakeAudioPool.play();
                        this.rabbit.type = 1;
                        this.rabbit.width = rabbitConf.widths[this.rabbit.type];
                        break;
                    default:
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

    /*道具只掉落一次*/
    Game.prototype.drawOnce = function (type) {
        if (!this.onceMap[type]) {
            this.onceMap[type] = 1;
            this.drawMoonCake(type, images.icon.img, speedMap[(Math.random() * 4) | 0]);
        }
    }

    /*炸弹爆炸动画*/
    Game.prototype.drawBoom = function (x, y) {
        var boom = new Sprite(drawAnimation);
        boom.lastTick = this.lastTick;
        boom.x = x;
        boom.y = y || 90;
        boom.width = 92;
        boom.height = 80;
        boom.frame = 0;
        boom.frameCount = 0;
        boom.frameInterval = 12;
        boom.map = boomMap;
        boom.image = images.boom.img;
        this.stage.add(boom);

        return this;
    };

    /*游戏结束*/
    Game.prototype.gameOver = function () {
        var me = this;
        this.stage.remove(this.rabbit);
        //me.bgAudioPool.stop();
        if (this.result == resultConf.win) {
            this.winAudioPool.play();
            this.drawWin(function () {
                me.dispose();
            });
        } else {
            this.loseAudioPool.play();
            this.drawLose(function () {
                me.dispose();
            });
        }
        this.tick.stop();
        //this.stop();
    };

    /*资源释放*/
    Game.prototype.dispose = function () {
        if (!this.disposed) {
            this.state = state.end;
            this.disposed = true;
            this.stop();
            this.unbindEvent();
            this.rabbit = null;
            this.bgAudioPool = null;
            this.cakeAudioPool = null;
            this.boomAudioPool = null;
            this.winAudioPool = null;
            this.loseAudioPool = null;
        }
    };

    /*游戏退出*/
    Game.prototype.exit = function () {
        if (this.state == state.uninit)
            return;
        var cakeLen = this.moonCakes.length,
            cake,
            sprites = this.stage.children,
            spriteLen = sprites.length,
            sprite;
        this.tick.stop();
        this.dispose();
        while (cakeLen--) {
            cake = this.moonCakes[cakeLen];
            cake.parent.remove(cake);
        }
        while (spriteLen--) {
            sprite = sprites[spriteLen];
            sprite.parent.remove(sprite);
        }
        this.remove(this.stage);
        this.context.clearRect(0, 0, this.width, this.height);
        this.state = state.uninit;
    };


    /*游戏胜利动画*/
    Game.prototype.drawWin = function (callback) {
        var win = new Sprite(drawAnimation);
        win.lastTick = this.lastTick;
        win.x = this.rabbit.x;
        win.y = 170;
        win.width = 100;
        win.height = 80;
        win.frame = 0;
        win.frameCount = 0;
        win.frameInterval = 12;
        win.map = rabbitWinMap;
        win.image = images.rabbitWin.img;
        win.callback = callback;
        this.stage.add(win);

        return this;
    };
    /*游戏失败动画*/
    Game.prototype.drawLose = function (callback) {
        var lose = new Sprite(drawAnimation);
        lose.lastTick = this.lastTick;
        lose.x = this.rabbit.x;
        lose.y = 170;
        lose.width = 100;
        lose.height = 86;
        lose.frame = 0;
        lose.frameCount = 0;
        lose.frameInterval = 12;
        lose.map = rabbitLoseMap;
        lose.image = images.rabbitLose.img;
        lose.callback = callback;
        this.stage.add(lose);

        return this;
    };

    /*事件绑定*/
    Game.prototype.bindEvent = function () {
        var me = this;
        document.addEventListener("keydown", onkeyDown, false);
        document.addEventListener("keyup", onkeyUp, false);

        function onkeyDown(e) {
            me.onKeyDown(e);
        }

        function onkeyUp(e) {
            me.onKeyUp(e);
        }

        this.unbindEvent = function () {
            document.removeEventListener("keydown", onkeyDown, false);
            document.removeEventListener("keyup", onkeyUp, false);
        };
    };


    /*清除事件绑定*/
    Game.prototype.unbindEvent = function () {
        var me = this;
        document.addEventListener("keydown", me.onKeyDown, false);
        document.addEventListener("keyup", me.onKeyUp, false);
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

    Game.prototype.constructor = Game;

    var game = new Game();

    module.exports = game;
});