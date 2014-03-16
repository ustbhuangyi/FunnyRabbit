/*
*           File:  rabbit.js
*    Description:  兔子类，包括兔子推车，胜利，被炸等逻辑处理和动画展示
*
*/
define(function (require, exports, module) {

    var events = require("pageEvents"),
    $ = require("jquery"),
    gameConfig = require("gameConfig"),
    Timeline = require("timeline"),
    gameover = require("gameover"),
    browser = require("browser"),
    animation = require("animation"),
    format = require("format");

    var $rabbit, //兔子
    $rabbitLose, //被炸兔子
    $rabbitWin, //胜率兔子
    $rabbitTip, //兔子操作提示
    container = "#zhongqiu_gameContainer",
    rabbitTpl = '<div id="zhongqiu_rabbit" class="#{rabbit}" style="width:#{width}px;height:#{height}px;left:#{left}px;background-position:#{position};"></div>',
    rabbitLoseTpl = '<div class="rabbitlose" style="left:#{left}px;top:#{top}px;background-position:#{position};"></div>',
    rabbitWinTpl = '<div class="rabbitwin" style="left:#{left}px;top:#{top}px;background-position:#{position};"></div>',
    rabbitTipTpl = '<div class="rabbittip" style="left:#{left}px;top:#{top}px;"></div>';

    var ARROW_LEFT = 37,
    ARROW_RIGHT = 39,
    REFRESH_RATE = 17,
    CANVAS_WIDTH = 1000,
    EXTRA_HEIGHT = 85,
    EXTRA_WIDTH = 0,
    RABBIT_HEIGHT = 80,
    TIP_HEIGHT = 120,
    MOVING_LEFT = 0,
    MOVING_RIGHT = 1,
    STOP = 2,
    STATE_UNINIT = 0,
    STATE_START = 1,
    STATE_END = 2,
    WIN = 0,
    LOSE = 1,
    LEFT_DEFAULT_FRAME = 1,
    RIGHT_DEFAULT_FRAME = 4,
    FRAME_LENGTH = 6,
    FRMAE_INTERVAL = 4,
    MAX_SPEED = 8,
    LOSE_FRAME_LENGTH = 13,
    WIN_FRAME_LENGTH = 19,
    LEFT = 0,
    RIGHT = 1;

    var moving = STOP, //移动状态
    state = STATE_UNINIT, //游戏的状态
    speed = 0, //兔子移动速度
    minLeft = EXTRA_WIDTH, //兔子最左端位置
    maxLeft, //兔子最右端位置
    left, //兔子x坐标
    top, //兔子y坐标
    leftFarme = LEFT_DEFAULT_FRAME, //兔子左跑的帧
    rightFrame = RIGHT_DEFAULT_FRAME, //兔子右跑的帧
    leftCount = 0, //左移计数
    rightCount = 0, //右移计数
    basketState = STATE_EMPTY, //篮子的状态
    rabbitType, //兔子形态
    direction = LEFT, //兔子方向
    isIpad = false, //是否ipad设备
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

    /*创建一只兔子*/
    function create() {
        rabbitType = gameConfig.getRabbitType();
        var rabbit = rabbitMap[rabbitType],
        rabbitWidth = widthMap[rabbitType],
        position = defaultPostion[rabbitType],
        tpl;
        state = STATE_START;

        maxLeft = CANVAS_WIDTH - rabbitWidth - EXTRA_WIDTH;
        left = maxLeft / 2;

        tpl = format(rabbitTpl, {
            rabbit: rabbit,
            width: rabbitWidth,
            height: RABBIT_HEIGHT,
            left: left,
            position: position
        });
        $rabbit = $(tpl);
        adjustRabbit();
        $rabbit.appendTo($(container));

        timeline = new Timeline();
        timeline.onenterframe = rabbitRun;
        timeline.start();

        isIpad = browser.isIpad();
        bindEvent();
    }

    /*调整兔子位置*/
    function adjustRabbit(args) {
        var viewport = args || events.getViewport(),
        height = viewport.height;
        top = height - EXTRA_HEIGHT;
        $rabbit && $rabbit.css({ "top": top });
        $rabbitLose && $rabbitLose.css({ "top": top });
        $rabbitWin && $rabbitWin.css({ "top": top });
        $rabbitTip && $rabbitTip.css({ "top": top - TIP_HEIGHT });
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

    /*forIpad*/
    function deviceMotionHandler(eventData) {
        var gravity = eventData.accelerationIncludingGravity,
        x = gravity.x,
        y = gravity.y;
        switch (window.orientation) {
            case 0:  //参考x轴
                if (x <= 0) {
                    moving = MOVING_LEFT;
                    speed = Math.min(-x * IPAD_SENS, MAX_SPEED);
                } else {
                    moving = MOVING_RIGHT;
                    speed = Math.min(x * IPAD_SENS, MAX_SPEED);
                }

                break;
            case -90: //参考y轴
                if (y <= 0) {
                    moving = MOVING_LEFT;
                    speed = Math.min(-y * IPAD_SENS, MAX_SPEED);
                } else {
                    moving = MOVING_RIGHT;
                    speed = Math.min(y * IPAD_SENS, MAX_SPEED);
                }
                break;
            case 90: //参考y轴
                if (y <= 0) {
                    moving = MOVING_RIGHT;
                    speed = Math.min(-y * IPAD_SENS, MAX_SPEED);
                } else {
                    moving = MOVING_LEFT;
                    speed = Math.min(y * 2, MAX_SPEED);
                }
                break;
        }
    }

    /*绑定事件*/
    function bindEvent() {
        $(document).keydown(onKeyDown);
        $(document).keyup(onKeyUp);

        events.on("viewport.deferchange", adjustRabbit);
        events.on("game.scoreChange", changeBasketState);
        events.on("game.over", gameOver);
        events.on("game.exit", dispose);
        events.on("gameConfig.rabbitTypeChange", changeRabbitType);

        if (isIpad && window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', deviceMotionHandler, false);
        }
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