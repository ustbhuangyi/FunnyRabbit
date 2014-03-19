//程序入口
define(function (require) {

    var $ = require("jquery"),
        game = require("game"),
        util = require("util"),
        config = require("config");

    $(document).ready(function () {
        var canvas = document.getElementById("mainCanvas"),
            context = canvas.getContext("2d");
        canvas.height = config.get("canvas.height");
        canvas.width = config.get("canvas.width");

        if (context)
            game.init(context);
    });


});
