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
    //MoonCake = require("moonCake"),
    //Rabbit = require("rabbit"),
        Sprite = require("sprite"),
        AudioPool = require("audioPool"),
        Timeline = require("timeline"),
        Stage = require("stage");

    var STATE_UNINITED = 0,
        STATE_START = 1,
        STATE_END = 2;

    var canvasConf = config.get("canvas"),
        stageConf = config.get("stage"),
        cakeConf = config.get("cake"),
        resultConf = config.get("result"),
        gameConf = config.get("game"),
        soundConf = config.get("sound"),
        images = config.get("image");

    var scoreWidthMap = [42, 52, 52, 52], //分宽度
        rabbitWidthMap = [88, 102], //兔子宽度
        lifeMap = ["-217px -84px", "-37px -84px", "-217px 0", "-37px 0"], //生命条
        scoreMap = ["-277px -244px", "-72px -244px", "-94px -244px", "-118px -244px", "-140px -244px", "-163px -244px", "-186px -244px", "-209px -244px", "-232px -244px", "-254px -244px"], //记分牌
        timeMap = ["332 179", "6 179", "41 179", "78 179", "113 179", "150 179", "187 179", "224 179", "259 179", "295 179"], //倒计时
        plusMap = ["-250px -292px", "-186px -292px", "-124px -292px", "-66px -292px"],  //加分
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
                ];

    function Game() {}

    Game.prototype = new Stage();

    Game.prototype.init = function (context) {
        var me = this;
        if (this.state >= STATE_START)
            return;
        this.state = STATE_START;
        Stage.call(this, context, canvasConf.width, canvasConf.height);
        this.spendTime = 0;
        this.score = 0;
        this.level = gameConf.level;
        this.totalTime = gameConf.time;
        this.rabbitType = gameConf.rabbitType;
        this.restLife = gameConf.life;
        this.moonkCakes = [];
        // this.rabbit = new Rabbit();
        //this.add(this.rabbit);
        this.cakeAudioPool = new AudioPool(soundConf.cake);
        this.boomAudioPool = new AudioPool(soundConf.boom);
        this.winAudioPool = new AudioPool(soundConf.win);
        this.loseAudioPool = new AudioPool(soundConf.lose);
        this.preloadImage(function (success) {
            if (success) {
                me.drawStage().drawTime().start();
                //this.drawLife();
            } else {
                throw new Error("fail to load images");
            }
        });

        this.tick = new Timeline(); //计时器
        this.tick.onenterframe = function (time) {
            me.time = time;
            me.Timing(time);
        };
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
            height = 35;
        this.decade = new Sprite(function (context, time) {
            var num = Math.max(0, Math.floor((me.totalTime - Math.floor(time / 1000)) / 10));
            draw(context, num);
        });
        this.decade.x = 20,
        this.decade.y = 94;
        this.stage.add(this.decade);

        this.single = new Sprite(function (context, time) {
            var num = Math.max(0, Math.floor((me.totalTime - Math.floor(time / 1000)) % 10));
            draw(context, num);
        });
        this.single.x = 45,
        this.single.y = 94;
        this.stage.add(this.single);

        function draw(context, num) {
            var positions = timeMap[num].split(' ');
            context.drawImage(icon, positions[0], positions[1], width, height, 0, 0, width, height);
        }

        return this;
    };

    Game.prototype.preloadImage = function (callback) {
        imageloader(images, function (success) {
            callback(success);
        });
    };

    /*游戏计时*/
    Game.prototype.Timing = function (time) {

    };

    /*碰撞检测*/
    Game.prototype.collisionDetect = function () {
        var len = moonkCakes.length,
            cake;
        while (len--) {
            cake = moonkCakes[len];
            if (cake.y >= canvasConf.height - cake.height && cake.y <= canvasConf.height) {
                if (cake.x + cake.width >= rabbit.left && cake.x <= rabbit.left + rabbit.width) {
                    switch (cake.type) {
                        case cakeConf.boom: //炸弹
                            cake.boom();
                            if (restLife--) {
                                result = resultConf.lose;
                                events.emit("game.over", result, spendTime, score);
                                gameOver();
                            }
                            break;
                        default:
                            //播放背景音乐
                            break;
                    }
                    moonkCakes.splice(len, 1);
                    this.remove(cake);
                }
            }

        }
    }

    /*画兔子*/
    Game.prototype.drawRabbit = function () {

    };

    /*画生命值*/
    Game.prototype.drawLife = function () {

    };

    /*画积分*/
    Game.prototype.drawScore = function (score) {

    };

    function noop() {

    }

    /*事件绑定*/
    function bindEvents() {
        events.on("moonCake.check", checkMoonCake);
        events.on("gameConfig.totalLifeChange", changeLife);
        events.on("gameConfig.rabbitTypeChange", changeRabbitType);
        events.on("gameConfig.totalTimeChange", changeTotalTime);
        events.on("gameConfig.bgMusicChange", changeBgMusic);
        events.on("game.exit", exitGame);

        $exit.click(function () {
            events.emit("game.exit");
        });
    }

    /*清除事件绑定*/
    function unbindEvents() {
        events.un("moonCake.check", checkMoonCake);
        events.un("gameConfig.totalLifeChange", changeLife);
        events.un("gameConfig.rabbitTypeChange", changeRabbitType);
        events.un("gameConfig.totalTimeChange", changeTotalTime);
        events.un("gameConfig.bgMusicChange", changeBgMusic);
    }

    /*游戏结束*/
    function gameOver() {

    }

    /*退出游戏*/
    function exitGame() {
        //player = null;
    }

    var game = new Game();

    module.exports = game;
});