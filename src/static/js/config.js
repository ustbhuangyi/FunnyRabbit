define(function (require, exports, module) {

    var DEFALUT_SETTINGS = {
        game: {
            life: 2,
            time: 60,
            rabbitType: 0,
            difficulty: 0
        },
        canvas: {
            width: 1000,
            height: 650
        },
        image: {
            bg: "/static/image/zhongqiu-bg.png",
            icon: "/static/image/zhongqiu-icon.png",
            rabbitBig: "/static/image/rabbit-big.png",
            rabbitSmall: "/static/image/rabbit-small.png",
            boom: "/static/image/boom.png",
            rabbitLose: "/static/image/rabbit-lose.png",
            rabbitWin: "/static/image/rabbit-win.png"
        },
        sound: {
            bg: {
                mp3: "/static/music/zhongqiubg.mp3"
            },
            cake: {
                ogg: "/static/music/get.ogg",
                mp3: "/static/music/get.mp3"
            },
            boom: {
                ogg: "/static/music/boom.ogg",
                mp3: "/static/music/boom.mp3"
            },
            win: {
                ogg: "/static/music/win.ogg",
                mp3: "/static/music/win.mp3"
            },
            lose: {
                ogg: "/static/music/lose.ogg",
                mp3: "/static/music/lose.mp3"
            }
        },
        rabbit: {
            height: 80,
            widths: [88, 102],
            small: 0,
            big: 1,
            maxSpeed: 8,
            left: 0,
            right: 1,
            stop: 2,
            type: 0,
            leftDefaultFrame: 1,
            rightDefaultFrame: 4,
            frameLength: 6,
            frameInterval: 6,
            loseFrameLength: 13,
            winFrameLength: 19
        },
        cake: {
            small: 0,
            normal: 1,
            big: 2,
            huge: 3,
            boom: 4,
            clock: 5,
            carrot: 6,
            lessBoom: 7,
            basket: 8
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
            speed: 2,
            type: 1,
            space: 24,
            size: 40
        }
    }

    var config = {
        init: function () {
            this.data = DEFALUT_SETTINGS;
            return this;
        },
        get: function (path, def) {
            var result = this.data || {};
            (path || '').split('.').forEach(function (key) {
                if (key && typeof result !== 'undefined') {
                    result = result[key];
                }
            });
            if (typeof result !== 'undefined') {
                return result;
            } else {
                return def;
            }
        },
        set: function (path, value) {
            var paths, last, data;
            if (typeof value === 'undefined') {
                this.data = path;
            }
            else {
                path = String(path || '').trim();
                if (path) {
                    paths = path.split('.');
                    last = paths.pop();
                    data = this.data || {};
                    paths.ForEach(function (key) {
                        var type = data[key];
                        if (typeof type === 'object') {
                            data = data[key];
                        } else if (typeof type === "undefiend") {
                            data = data[key] = {};
                        } else {
                            throw new Error('forbidden to set property[' + key + '] of [' + type + '] data');
                        }
                    });
                    data[last] = value;
                }
            }
            return this;
        }

    };

    module.exports = config.init();
});
