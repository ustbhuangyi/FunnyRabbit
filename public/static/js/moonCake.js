/*
*           File:  moonCake.js
*    Description:  月饼类，包扩月饼创建，下落，消失等逻辑处理和炸弹爆炸动画展现
*
*/
define(function (require, exports, module) {

    var config = require('config'),
        Sprite = require('sprite'),
        events = require('events'),
        imageLoader = require('imageloader');

    var STATE_UNINITED = 0,
        STATE_START = 1,
        STATE_END = 2;

    var valueMap = [500, 1000, 2000, 5000, 0], //月饼分值
        sizeMap = [30, 40, 50, 60, 50], //月饼大小
        positionMap = ["243 399", "161 394", "80 390", "0 384", "307 390"], //月饼图坐标
        speedMap = [2, 3, 4, 5], //月饼掉落速度
        boomMap = ["0 0", "138 0", "291 0", "436 0"]; //炸弹坐标

    var images = {
        icon: config.get("image.icon")
    },
    canvasHeight = config.get("canvas.width");
    canvasWidth = config.get("canvas.height");

    var imgloaded = null;
    imageLoader(images, function (sucess) {
        imgloaded = sucess;
    });

    function noop() {

    }

    /*月饼类*/
    function MoonCake(type, callback) {
        var me = this;
        Sprite.call(this, callback);
        if (this.create(type) && !callback) {
            this.paint = function (context, time) {
               // me.y = me.speed * time;
                //me.check();
                context.drawImage(me.img, me.sx, me.sy, me.width, me.height, 0, 0, me.width, me.height);
            };

        }
    }

    MoonCake.prototype = new Sprite();

    MoonCake.prototype.creatre = function (type, position, speed) {
        var sPostion;
        if (!imgloaded) {
            if (imgloaded === false) {
                throw new Error("fail to load image, please check");
            }
            return false;
        }
        type = type || SMALL_CAKE;
        this.type = type;
        this.value = valueMap[type];
        this.width = this.height = sizeMap[type];
        if (position) {
            this.x = position.x;
            this.y = position.y;
        } else {
            this.x = 0;
            this.y = Math.random() * (canvasWidth - this.width);
        }
        this.img = images.icon.img;
        sPostion = positionMap[type].split(' ');
        this.sx = sPostion[0];
        this.sy = sPostion[1];
        this.speed = speed || speedMap[Math.floor(Math.random() * 4)];
        this.state = STATE_START;
        this.bindEvent();
        return true;
    };

    MoonCake.prototype.bindEvent = function () {
        events.on("game.exit", this.dispose, this);
        events.on("game.over", this.stop, this);
    };

    MoonCake.prototype.check = function () {
        if (this.state != STATE_START)
            return;
        if (this.y > canvasHeight - this.height && this.y < canvasHeight) { //此时检查该月饼是否被兔子装了
            events.emit("moonCake.check", this);
        }
        else if (this.y >= canvasHeight) {//已经掉落
            this.state == STATE_END;
            this.dispose(); //资源销毁
        }
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

    module.exports = MoonCake;

});