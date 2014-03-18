/*
*           File:  rabbit.js
*    Description:  兔子类，包括兔子推车，胜利，被炸等逻辑处理和动画展示
*
*/
define(function (require, exports, module) {

    var events = require("events"),
        Sprite = require("sprite"),
        $ = require("jquery"),
        config = require("config");

    var ARROW_LEFT = 37,
        ARROW_RIGHT = 39,
        STATE_UNINIT = 0,
        STATE_START = 1,
        STATE_END = 2,
        REFRESH_RATE = 17;

    var rabbitConf = config.get("rabbit"),
        canvasConf = config.get("canvas"),
        resultConf = config.get("result"),
        basketConf = config.get("basket"),
        state = STATE_UNINIT, //游戏的状态
    minLeft = EXTRA_WIDTH, //兔子最左端位置
    maxLeft, //兔子最右端位置
    left, //兔子x坐标
    top, //兔子y坐标
    leftFarme = LEFT_DEFAULT_FRAME, //兔子左跑的帧
    rightFrame = RIGHT_DEFAULT_FRAME, //兔子右跑的帧
    leftCount = 0, //左移计数
    rightCount = 0, //右移计数
    direction = LEFT, //兔子方向
    loseAnimation = null, //失败动画
    winAnimation = null, //胜利动画
    timeline = null; //控制兔子跑动

    var rabbitMap = ["small-rabbit", "big-rabbit"], //兔子形象
    widthMap = [88, 102], //兔子宽度
    defaultPostion = ["-197px -365px", "-176px -2px"], //游戏开始兔子形象
    /*小兔子往右跑的各种形象*/
    smallRightRunningMap = [
                            ["0 -3px", "-175px -3px", "-351px -3px", "-527px -2px", "-702px -3px", "-871px 0"],
                            ["-7px -92px", "-182px -92px", "-358px -92px", "-534px -91px", "-709px -92px", "-884px -89px"],
                            ["-4px -183px", "-179px -183px", "-355px -183px", "-531px -182px", "-706px -183px", "-881px -180px"],
                            ["-4px -272px", "-179px -272px", "-355px -272px", "-531px -271px", "-706px -272px", "-881px -269px"]
                          ],
    /*小兔子往左跑的各种形象*/
   smallLeftRunningMap = [
                            ["-28px -362px", "-197px -365px", "-371px -364px", "-546px -365px", "-722px -365px", "-897px -365px"],
                            ["-14px -451px", "-189px -454px", "-364px -453px", "-539px -454px", "-715px -454px", "-890px -454px"],
                            ["-17px -542px", "-192px -545px", "-367px -544px", "-542px -545px", "-718px -545px", "-892px -545px"],
                            ["-17px -631px", "-193px -634px", "-367px -633px", "-542px -634px", "-718px -634px", "-893px -634px"]
                         ],
    /*大兔子右跑的各种形象*/
    bigRightRunningMap = [
                            ["0 -481px", "-174px -481px", "-349px -481px", "-523px -481px", "-698px -480px", "-872px -478px"],
                            ["0 -590px", "-174px -591px", "-349px -591px", "-524px -591px", "-698px -590px", "-873px -587px"],
                            ["0 -720px", "-174px -721px", "-349px -721px", "-524px -721px", "-698px -720px", "-873px -717px"],
                            ["0 -854px", "-174px -852px", "-349px -852px", "-524px -852px", "-698px -851px", "-873px -848px"]
                         ],
    /*大兔子左跑各种形象*/
    bigLeftRunningMap = [
                           ["-2px 0", "-176px -2px", "-351px -3px", "-524px -3px", "-698px -3px", "-874px -3px"],
                           ["-1px -109px", "-176px -112px", "-351px -113px", "-524px -113px", "-699px -113px", "-873px -112px"],
                           ["-1px -239px", "-176px -242px", "-351px -243px", "-524px -243px", "-699px -243px", "-873px -242px"],
                           ["0 -373px", "-175px -376px", "-350px -377px", "-524px -377px", "-699px -377px", "-873px -379px"]
                         ],
    runningMap = [
                    [smallLeftRunningMap, smallRightRunningMap],
                    [bigLeftRunningMap, bigRightRunningMap]
                 ],
    /*兔子被炸动画*/
    rabbitLoseMap = ["0 0", "-163 0", "-327 0", "-491 0", "-655 0", "-819 0", "0 -135", "-166 -135", "-333 -135", "-500 -135", "-668 -135", "-835 -135", "0 -262"],
    /*兔子胜利动画*/
    rabbitWinMap = ["0 0", "-198 0", "-401 0", "-609 0", "-816 0", "0 -96", "-208 -97", "-415 -97", "-623 -97", "-831 -97", "0 -203", "-207 -203", "-415 -203", "-623 -203", "-831 -203", "0 -307", "-206 -307", "-414 -307", "-623 -307"];


    function Rabbit(callback) {
        this.create();
    }

    Rabbit.prototype = new Sprite(); //继承Sprite

    Rabbit.prototype.create = function () {
        this.type = rabbitConf.type;
        this.speed = 0;
        this.moving = rabbitConf.stop;
        this.width = rabbitConf.widths[this.type];
        this.height = rabbitConf.heigth;
        this.minLeft = 0;
        this.maxLeft = canvasConf.width - this.width;
        this.basketState = basketConf.empty;
        this.x = this.maxLeft / 2;
        this.y = canvasConf.height - this.height - 20;
        this.leftFrame = rabbitConf.leftDefaultFrame;
        this.rightFrame = rabbitConf.rightDefaultFrame;
        this.leftCount = 0;
        this.rightCount = 0;
        this.direction = rabbitConf.left;

        this.bindEvent();
    };

    Rabbit.prototype.paint = function (context, time) {
        switch (this.moving) {
            case rabbitConf.left:
                if (this.speed < rabbitConf.maxSpeed) {
                    this.speed++;
                }
                if (this.left > this.minLeft) { 
                    this.left -= sp
                }
                break;
        }
    };

    Rabbit.prototype.onKeyDown = function (e) {
        switch (e.which) {
            case ARROW_LEFT: //left
                this.moving = rabbitConf.left;
                break;
            case ARROW_RIGHT: //right
                this.moving = rabbitConf.right;
                break;
        }
    };

    Rabbit.prototype.onKeyUp = function (e) {
        switch (e.which) {
            case ARROW_LEFT: //left
                if (this.moving == rabbitConf.left) {
                    this.direction = rabbitConf.left;
                    this.moving = rabbitConf.stop;
                    this.leftFarme = rabbitConf.leftDefaultFrame;
                    this.leftCount = 0;
                    this.speed = 0;
                }
                break;
            case ARROW_RIGHT: //right
                if (this.moving == rabbitConf.right) {
                    this.direction = rabbitConf.right;
                    this.moving = rabbitConf.stop;
                    this.rightFrame = rabbitConf.rightDefaultFrame;
                    this.rightCount = 0;
                    this.speed = 0;
                }
                break;
        }
    };


    Rabbit.prototype.bindEvent = function () {
        var me = this;

        $(document).keydown(function (e) {
            me.onKeyDown(e);
        });

        $(document).keyup(function (e) {
            me.onKeyUp(e);
        });

        events.on("game.basketChange", function (state) {
            this.basketState = state;
        });

        events.on("game.rabbitChange", function (type) {
            this.type = type;
        });

        events.on("game.over", gameOver);
        events.on("game.exit", dispose);

        if (isIpad && window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', deviceMotionHandler, false);
        }
    };


    /*控制兔子左右跑的动画*/
    function rabbitRun(time) {
        var ratio = time / REFRESH_RATE,
        running = runningMap[rabbitType][moving];

        if (state != STATE_START) {
            return;
        }

        switch (moving) {
            case MOVING_LEFT:
                if (!isIpad) {
                    if (speed < MAX_SPEED) {
                        speed++;
                    }
                }
                if (left > minLeft) {
                    left -= speed * ratio;
                    if (left < minLeft) {
                        left = minLeft;
                    }
                    // $rabbit.css({ "left": left });
                    if ($rabbit) {
                        $rabbit[0].style.left = left + "px";
                        if ($rabbitTip) {
                            $rabbitTip[0].style.left = left + widthMap[rabbitType] / 2 + "px";
                        }
                        if (leftCount++ % FRMAE_INTERVAL == 0) {
                            $rabbit[0].style.backgroundPosition = running[basketState][leftFarme];
                            if (++leftFarme == FRAME_LENGTH) {
                                leftFarme = 0;
                            }
                        }
                    }

                }
                break;
            case MOVING_RIGHT:
                if (!isIpad) {
                    if (speed < MAX_SPEED) {
                        speed++;
                    }
                }
                if (left < maxLeft) {
                    left += speed * ratio;
                    if (left > maxLeft) {
                        left = maxLeft;
                    }
                    if ($rabbit) {
                        $rabbit[0].style.left = left + "px";
                        if ($rabbitTip) {
                            $rabbitTip[0].style.left = left + widthMap[rabbitType] / 2 + "px";
                        }
                        if (rightCount++ % FRMAE_INTERVAL == 0) {
                            $rabbit[0].style.backgroundPosition = running[basketState][rightFrame];
                            if (++rightFrame == FRAME_LENGTH) {
                                rightFrame = 0;
                            }
                        }
                    }
                }
                break;
        }
    }

    /*键盘按下*/
    function onKeyDown(e) {
        switch (e.which) {
            case ARROW_LEFT: //left
                moving = MOVING_LEFT;
                break;
            case ARROW_RIGHT: //right
                moving = MOVING_RIGHT;
                break;
        }
    }

    /*键盘弹起*/
    function onKeyUp(e) {
        var running;
        switch (e.which) {
            case ARROW_LEFT: //left
                if (moving == MOVING_LEFT) {
                    direction = LEFT;
                    running = runningMap[rabbitType][moving];
                    moving = STOP;
                    leftFarme = LEFT_DEFAULT_FRAME;
                    leftCount = 0;
                    speed = 0;
                    if ($rabbit) {
                        $rabbit[0].style.backgroundPosition = running[basketState][leftFarme];
                    }
                }
                break;
            case ARROW_RIGHT: //right
                if (moving == MOVING_RIGHT) {
                    direction = RIGHT;
                    running = runningMap[rabbitType][moving];
                    moving = STOP;
                    rightFrame = RIGHT_DEFAULT_FRAME;
                    rightCount = 0;
                    speed = 0;
                    if ($rabbit) {
                        $rabbit[0].style.backgroundPosition = running[basketState][rightFrame];
                    }
                }
                break;
        }
    }


    /*游戏结束*/
    function gameOver(result, spendTime, score) {
        $rabbit && $rabbit.remove();
        if (result == WIN) {
            rabbitWin(result, score);
        }
        else {
            rabbitLose(result, score);
        }
        state = STATE_END;
        unbindEvent();
    }

    /*兔子被雷炸动画*/
    function rabbitLose(result, score) {
        $rabbitLose = $(format(rabbitLoseTpl, {
            left: left,
            top: top
        }));
        $rabbitLose.appendTo($(container));
        loseAnimation = animation().changePosition($rabbitLose, rabbitLoseMap).wait(function () {
            gameover.show(result, score);
        });
        loseAnimation.start(200);
    }

    /*兔子胜利动画*/
    function rabbitWin(result, score) {
        $rabbitWin = $(format(rabbitWinTpl, {
            left: left,
            top: top
        }));
        $rabbitWin.appendTo($(container));
        winAnimation = animation().changePosition($rabbitWin, rabbitWinMap).wait(function () {
            gameover.show(result, score);
        });
        winAnimation.start(200);
    }

    /*得到兔子dom元素*/
    function getInstance() {
        return $rabbit;
    }


    /*改变篮筐状态*/
    function changeBasketState(state) {
        basketState = state;
    }

    /*改变兔子形态*/
    function changeRabbitType(type) {
        var frame;
        $rabbit.removeClass(rabbitMap[rabbitType]);
        rabbitType = type;
        $rabbit.addClass(rabbitMap[type]);
        $rabbit.css({ "width": widthMap[type] });
        if (moving == STOP) {
            frame = direction == LEFT ? LEFT_DEFAULT_FRAME : RIGHT_DEFAULT_FRAME;
            $rabbit.css({ "background-position": runningMap[type][direction][basketState][frame] });
        }
    }
    /*绑定事件*/
    function bindEvent() {

    }

    /*清除事件绑定*/
    function unbindEvent() {
        $(document).unbind("keyup", onKeyUp);
        $(document).unbind("keydown", onKeyDown);

        events.un("game.scoreChange", changeBasketState);
        events.un("game.over", gameOver);
        events.un("gameConfig.rabbitTypeChange", changeRabbitType);

        if (isIpad && window.DeviceMotionEvent) {
            window.removeEventListener('devicemotion', deviceMotionHandler, false);
        }
    }

    /*释放资源*/
    function dispose() {
        $rabbit && $rabbit.remove();
        $rabbitWin && $rabbitWin.remove();
        $rabbitLose && $rabbitLose.remove();
        $rabbitTip && $rabbitTip.remove();
        $rabbit = null;
        $rabbitLose = null;
        $rabbitWin = null;
        $rabbitTip = null;
        loseAnimation && loseAnimation.dispose();
        loseAnimation = null;
        winAnimation && winAnimation.dispose();
        winAnimation = null;
        timeline && timeline.stop();
        timeline = null;
        state = STATE_UNINIT;
        basketState = STATE_EMPTY;
        moving = STOP;
        events.un("viewport.deferchange", adjustRabbit);
    }

    module.exports = {
        create: create,
        getInstance: getInstance
    };
});