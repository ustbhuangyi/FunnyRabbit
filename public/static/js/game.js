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
        AudioPool = require("audioPool"),
        Timeline = require("timeline"),
        Stage = require("stage");

    var STATE_UNINITED = 0,
        STATE_START = 1,
        STATE_END = 2;

    var canvasConf = config.get("canvas"),
        cakeConf = config.get("cake"),
        resultConf = config.get("result"),
        gameConf = config.get("game"),
        soundConf = config.get("sound"),
        images = config.get("image");

    var moonkCakes = [], //月饼实例
        rabbit, //兔子实例
        timeline, //计时器
        totalTime, //游戏总时长
        spendTime, //游戏耗时
        score, //得分 
        level, //游戏难度
        restLife, //总生命值
        result, //游戏结果
        state, //游戏状态
        rabbitType, //兔子形态
        moonCakeToken, //月饼timer
        player, //播放器
        cakeAudioPool, //接住月饼播放音效
        boomAudioPool, //接住炸弹播放音效
        winAudioPool, //游戏胜利播放音效
        loseAudioPool, //游戏失败播放音效
        needDrawHao123 = false, //是否画hao123
        cake = config.cake;

    var scoreWidthMap = [42, 52, 52, 52], //分宽度
        rabbitWidthMap = [88, 102], //兔子宽度
        lifeMap = ["-217px -84px", "-37px -84px", "-217px 0", "-37px 0"], //生命条
        scoreMap = ["-277px -244px", "-72px -244px", "-94px -244px", "-118px -244px", "-140px -244px", "-163px -244px", "-186px -244px", "-209px -244px", "-232px -244px", "-254px -244px"], //记分牌
        timeMap = ["-332px -179px", "-6px -179px", "-41px -179px", "-78px -179px", "-113px -179px", "-150px -179px", "-187px -179px", "-224px -179px", "-259px -179px", "-295px -179px"], //倒计时
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

    function Game() {

    }

    Game.prototype = new Stage();

    Game.prototype.init = function () {
        if (this.state >= STATE_START)
            return;
        this.state = STATE_START;
        this.spendTime = 0;
        this.score = 0;
        this.level = gameConf.level;
        this.totalTime = gameConf.time;
        this.rabbitType = gameConf.rabbitType;
        this.restLife = gameConf.life;
        this.moonkCakes = [];
        this.rabbit = new Rabbit();
        this.add(this.rabbit);
        this.cakeAudioPool = new AudioPool(soundConf.cake);
        this.boomAudioPool = new AudioPool(soundConf.boom);
        this.winAudioPool = new AudioPool(soundConf.win);
        this.loseAudioPool = new AudioPool(soundConf.lose);
        this.preloadImag(function (success) {
            if (success) {
                this.drawStage();
                this.drawLife();
            } else {
                throw new Error("fail to load images");
            }
        });

        this.timeline = new Timeline();
        this.timeline.onenterframe = function (time) {

        };
        drawStage();
        drawLife(restLife);
        drawTime(totalTime - spendTime);
        drawRabbit();
        drawMoonCake();
        needDrawHao123 = Math.random() > HAO_CHANCE;
        Timing();
        preLoadImg();
        if (music == ON) {
            playMusic();
        }
        bindEvents();
    };

    Game.prototype.preloadImag = function (callback) {
        imageloader(images, function (success) {
            callback(success);
        });
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

    /*游戏计时*/
    Game.prototype.Timing = function () {

        timeToken = setTimeout(function () {
            var restTime = totalTime - ++spendTime;
            drawTime(restTime);
            if (restTime == 0) {
                result = WIN;
                events.emit("game.over", result, spendTime, score);
                winAudioPool.play();
                gameOver();
                clearTimeout(timeToken);
                return;
            }
            if (state != STATE_START) {
                clearTimeout(timeToken);
                return;
            }
            level = Math.min(3, Math.ceil(spendTime / 20));
            Timing();
        }, 1000);
    }

    /*画舞台*/
    Game.prototype.drawStage = function () {
        this.stage = new Sprite(function (context, time) {
            
        });
        this.add(this.stage);
    };

    /*画兔子*/
    Game.prototype.drawRabbit = function () {

    };

    /*画生命值*/
    Game.prototype.drawLife = function () {
        $life && $life.css({ "background-position": lifeMap[life] });
    };

    /*画倒计时*/
    Game.prototype.drawTime = function (time) {
        var minute = Math.floor(time / 10),
        second = Math.floor(time % 10);
        $minute && $minute.css({ "background-position": timeMap[minute] });
        $second && $second.css({ "background-position": timeMap[second] });
    }

    /*画积分*/
    function drawScore(score) {
        var base = 1000000;
        $.each($scores, function (i, v) {
            $(this).css({ "background-position": scoreMap[Math.floor(score / base)] });
            score = score % base;
            base = base / 10;
        });
    }

    /*获取落hao123月饼的时机*/
    function getHao123needTime() {
        return Math.ceil(viewportHeight / SPEED) + 1;
    }

    /*动态创建月饼*/
    function drawMoonCake() {
        moonCakeToken = setTimeout(function () {
            var restTime = totalTime - spendTime;
            if (needDrawHao123 && restTime <= getHao123needTime()) {
                setTimeout(function () {
                    drawHao123()
                }, 1000);
                clearTimeout(moonCakeToken);
                return;
            }
            if (state != STATE_START) {
                clearTimeout(moonCakeToken);
                return;
            }
            var cake = new MoonCake();
            cake.create({ level: level });
            drawMoonCake();
        }, 500);
    }


    /*开启音乐*/
    function playMusic() {
        //    if (!!document.createElement('audio').canPlayType) {
        //        $(audioTpl).appendTo($container);
        //        music = music || $(audioTpl).get(0);
        //        music.play();
        //        music.loop = true;
        //    }
        if (!player) {
            player = new window.PlayEngine();
            player.init();
            player.setUrl(MUSIC_URL);
        }
        player.play();

    }

    /*关闭音乐*/
    function stopMusic() {
        player && player.stop();
    }

    /*判断该月饼是否被兔子接住，也有可能是个雷噢~~*/
    function checkMoonCake(moonCake) {
        var rabbitLeft, rabbitWidth;
        $rabbit = $rabbit || rabbit.getInstance();
        rabbitLeft = parseInt($rabbit.css("left"));
        rabbitWidth = rabbitWidthMap[rabbitType];
        if (moonCake.left + moonCake.width >= rabbitLeft && moonCake.left <= rabbitLeft + rabbitWidth) { //接住
            if (moonCake.type == BOOM) { //啊哦，吃到雷了
                boomAudioPool.play();
                moonCake.boom();
                drawLife(--restLife);
                if (!restLife) {
                    result = LOSE;
                    events.emit("game.over", result, spendTime, score);
                    loseAudioPool.play();
                    gameOver();
                }
            }
            else {
                cakeAudioPool.play();
            }
            moonCake.dispose();
            score += moonCake.value;
            drawScore(score);
            switch (true) {
                case score >= SCORE_OVERFLOW:
                    events.emit("game.basketChange", SCORE_STATE_OVERFLOW);
                    break;
                case score >= SCORE_FULL:
                    events.emit("game.basketChange", SCORE_STATE_FULL);
                    break;
                case score >= SCORE_LITTLE:
                    events.emit("game.basketChange", SCORE_STATE_LITTLE);
                    break;
            }
            showScore(moonCake);
        }
    }

    function noop() {

    }


    /*修改生命值*/
    function changeLife(life) {
        restLife = life;
        drawLife(restLife);
    }

    /*修改兔子形态*/
    function changeRabbitType(type) {
        rabbitType = type;
    }

    /*修改游戏总时长*/
    function changeTotalTime(time) {
        totalTime = time;
    }

    /*事件绑定*/
    function bindEvents() {
        events.on("viewport.deferchange", onViewportChange);
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

    /*初始化游戏*/
    function initGame(canvas) {

    }

    /*游戏结束*/
    function gameOver() {
        state = STATE_END;
        stopMusic();
        unbindEvents();
    }

    /*退出游戏*/
    function exitGame() {
        state = STATE_UNINITED;
        unbindEvents();
        events.un("game.exit", exitGame);
        stopMusic();
        clearTimeout(timeToken);
        clearTimeout(moonCakeToken);
        //player = null;
    }

    var game = new Game();

    module.exports = function () {
        return game;
    };
});