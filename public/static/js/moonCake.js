/*
*           File:  moonCake.js
*    Description:  月饼类，包扩月饼创建，下落，消失等逻辑处理和炸弹爆炸动画展现
*
*/
define(function (require, exports, module) {

    var Sprite = require('sprite');

    var valueMap = [500, 1000, 2000, 5000, 0, 0, 0, 0, 0], //月饼分值
        sizeMap = [30, 40, 50, 60, 50, 40, 40, 40, 40], //月饼大小
        positionMap = ["243 399", "161 394", "80 390", "0 384", "307 390", "261 332", "125 332", "56 332", "193 332"]; ; //月饼图坐标

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
        this.image = args.image;
        sPostion = positionMap[type].split(' ');
        this.sx = sPostion[0];
        this.sy = sPostion[1];
        this.alpha = 1;
        this.speed = args.speed;
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

    MoonCake.prototype.constructor = MoonCake;

    module.exports = MoonCake.factory();

});