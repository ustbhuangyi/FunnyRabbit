/*
*           File:  moonCake.js
*    Description:  月饼类，包扩月饼创建，下落，消失等逻辑处理和炸弹爆炸动画展现
*
*/
define(function (require, exports, module) {

    var config = require('config'),
        Sprite = require('sprite'),
        events = require('events');

    var valueMap = [500, 1000, 2000, 5000, 0], //月饼分值
        sizeMap = [30, 40, 50, 60, 50], //月饼大小
        positionMap = ["243 399", "161 394", "80 390", "0 384", "307 390"], //月饼图坐标
        boomMap = ["0 0", "138 0", "291 0", "436 0"]; //炸弹坐标

    var cakeConf = config.get("cake");

    /*月饼类*/
    function MoonCake(args) {
        Sprite.call(this);
        this.create(args);
    }

    MoonCake.prototype = new Sprite();

    MoonCake.prototype.create = function (args) {
        var sPostion, type;
        this.type = type = args.type;
        this.value = valueMap[type];
        this.width = this.height = sizeMap[type];
        this.image = args.image.img;
        sPostion = positionMap[type].split(' ');
        this.sx = sPostion[0];
        this.sy = sPostion[1];
        this.alpha = 1;
        this.speed = args.speed;
        this.bindEvent();
        return true;
    };

    MoonCake.prototype.paint = function (context, time) {
        var width = this.width,
            height = this.height;
        if (this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }
        context.drawImage(this.image, this.sx, this.sy, width, height, 0, 0, width, height);
        if (this.alpha < 1) {
            context.globalAlpha = 1;
        }
    };

    MoonCake.prototype.bindEvent = function () {

    };

    MoonCake.prototype.dispose = function () {
        if (this.state == STATE_UNINITED)
            return;
        this.state = STATE_UNINITED;
        events.emit("moonCake.dispose", this);
        events.un("game.exit", this.dispose);
        events.un("game.over", this.stop);
    };

    MoonCake.prototype.stop = function () {
        this.state = STATE_END;
        this.paint = noop;
    };

    MoonCake.prototype.constructor = MoonCake;

    module.exports = MoonCake.factory();

});