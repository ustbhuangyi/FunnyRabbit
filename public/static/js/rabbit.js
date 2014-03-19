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

    var rabbitConf = config.get("rabbit"),
        canvasConf = config.get("canvas"),
        resultConf = config.get("result"),
        basketConf = config.get("basket");

    /*小兔子往右跑的各种形象*/
    smallRightRunningMap = [
                            ["0 3", "175 3", "351 3", "527 2", "702 3", "871 0"],
                            ["7 92", "182 92", "358 92", "534 91", "709 92", "884 89"],
                            ["4 183", "179 183", "355 183", "531 182", "706 183", "881 180"],
                            ["4 272", "179 272", "355 272", "531 271", "706 272", "881 269"]
                          ],
    /*小兔子往左跑的各种形象*/
   smallLeftRunningMap = [
                            ["28 362", "197 365", "371 364", "546 365", "722 365", "897 365"],
                            ["14 451", "189 454", "364 453", "539 454", "715 454", "890 454"],
                            ["17 542", "192 545", "367 544", "542 545", "718 545", "892 545"],
                            ["17 631", "193 634", "367 633", "542 634", "718 634", "893 634"]
                         ],
    /*大兔子右跑的各种形象*/
    bigRightRunningMap = [
                            ["0 481", "174 481", "349 481", "523 481", "698 480", "872 478"],
                            ["0 590", "174 591", "349 591", "524 591", "698 590", "873 587"],
                            ["0 720", "174 721", "349 721", "524 721", "698 720", "873 717"],
                            ["0 854", "174 852", "349 852", "524 852", "698 851", "873 848"]
                         ],
    /*大兔子左跑各种形象*/
    bigLeftRunningMap = [
                           ["2 0", "176 2", "351 3", "524 3", "698 3", "874 3"],
                           ["1 109", "176 112", "351 113", "524 113", "699 113", "873 112"],
                           ["1 239", "176 242", "351 243", "524 243", "699 243", "873 242"],
                           ["0 373", "175 376", "350 377", "524 377", "699 377", "873 379"]
                         ],
    runningMap = [
                    [smallLeftRunningMap, smallRightRunningMap],
                    [bigLeftRunningMap, bigRightRunningMap]
                 ],
    /*兔子被炸动画*/
    rabbitLoseMap = ["0 0", "-163 0", "-327 0", "-491 0", "-655 0", "-819 0", "0 -135", "-166 -135", "-333 -135", "-500 -135", "-668 -135", "-835 -135", "0 -262"],
    /*兔子胜利动画*/
    rabbitWinMap = ["0 0", "-198 0", "-401 0", "-609 0", "-816 0", "0 -96", "-208 -97", "-415 -97", "-623 -97", "-831 -97", "0 -203", "-207 -203", "-415 -203", "-623 -203", "-831 -203", "0 -307", "-206 -307", "-414 -307", "-623 -307"];


    function Rabbit(images) {
        Sprite.call(this);
        this.create(images);
    }

    Rabbit.prototype = new Sprite(); //继承Sprite

    Rabbit.prototype.create = function (images) {
        this.images = images;
        this.type = rabbitConf.type;
        this.speed = 0;
        this.moving = rabbitConf.stop;
        this.width = rabbitConf.widths[this.type];
        this.height = rabbitConf.height;
        this.minLeft = 0;
        this.maxLeft = canvasConf.width - this.width;
        this.basketState = basketConf.empty;
        this.leftFrame = rabbitConf.leftDefaultFrame;
        this.rightFrame = rabbitConf.rightDefaultFrame;
        this.leftCount = 0;
        this.rightCount = 0;
        this.direction = rabbitConf.left;

    };

    Rabbit.prototype.paint = function (context, time) {
        var img = this.type == rabbitConf.small ? this.images.rabbitSmall.img : this.images.rabbitBig.img,
            width = this.width,
            height = this.height,
            frame = this.direction == rabbitConf.left ? this.leftFrame : this.rightFrame,
            positions = runningMap[this.type][this.direction][this.basketState][frame].split(' ');
        context.drawImage(img, positions[0], positions[1], width, height, 0, 0, width, height);
    };

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

    module.exports = Rabbit.factory();
});