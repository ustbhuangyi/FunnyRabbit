define(function (require, exports, module) {

    var DEFALUT_SETTINGS = {
        game: {
            life: 1,
            time: 60,
            rabbit: 0,
            level: 1
        },
        canvas: {
            width: 1000,
            height: 700
        },
        image: {
            bg: "http://s0.hao123img.com/res/img/zhongqiu-bg.png",
            icon: "http://s0.hao123img.com/res/img/zhongqiu-icon.png",
            rabbitBig: "http://s0.hao123img.com/res/img/rabbit-big.png",
            rabbitSmall: "http://s0.hao123img.com/res/img/rabbit-small.png",
            boom: "http://s0.hao123img.com/res/img/boom.png",
            rabbitLose: "http://s0.hao123img.com/res/img/rabbit-lose.png",
            rabbitWin: "http://s0.hao123img.com/res/img/rabbit-win.png",
            popup: "http://s0.hao123img.com/res/img/zhongqiu-popupbg.png",
            popupWin: "http://s0.hao123img.com/res/img/zhongqiu-win.png",
            popupLose: "http://s0.hao123img.com/res/img/zhongqiu-lose.png",
            nums: "http://s0.hao123img.com/res/img/zhongqiu-nums.png"
        },
        sound: {
            bg: {
                "ogg": "http://s1.hao123img.com/res/swf/zhongqiubg.ogg",
                "mp3": "http://s1.hao123img.com/res/swf/zhongqiubg.mp3"
            },
            cake: {
                "ogg": "http://s0.hao123img.com/res/swf/sound/get.ogg",
                "mp3": "http://s0.hao123img.com/res/swf/sound/get.mp3"
            },
            boom: {
                "ogg": "http://s0.hao123img.com/res/swf/sound/boom.ogg",
                "mp3": "http://s0.hao123img.com/res/swf/sound/boom.mp3"
            },
            win: {
                "ogg": "http://s0.hao123img.com/res/swf/sound/win.ogg",
                "mp3": "http://s0.hao123img.com/res/swf/sound/win.mp3"
            },
            lose: {
                "ogg": "http://s0.hao123img.com/res/swf/sound/lose.ogg'",
                "mp3": "http://s0.hao123img.com/res/swf/sound/lose.mp3'"
            }
        },
        rabbit:{
            height: 80,
            maxSpeed: 8,
            left: 0,
            right: 1,
            stop: 2
        },
        cake: {
            small: 0,
            normal: 1,
            big: 2,
            huge: 3,
            boom: 4
        },
        result: {
            win: 0,
            lose: 1
        },
        score: {
            little: 20000,
            full: 50000,
            overflow: 100000
        },
        basket: {
            empty: 0,
            little: 1,
            full: 2,
            overflow: 3
        },
        hao: {
            chance: 0.5,
            speed: 4,
            type: 2,
            space: 24
        }
    }

    module.exports = DEFALUT_SETTINGS;
});