//程序入口
define(function (require) {

    var $ = require("jquery"),
        game = require("game"),
        util = require("util"),
        config = require("config");

    $(document).ready(function () {
        var canvas = $("#mainCanvas").get(0),
            context = canvas.getContext("2d"),
            $close = $('#close'),
            $start = $('#start');

        canvas.height = config.get("canvas.height");
        canvas.width = config.get("canvas.width");

        $start.click(function () {
            if (context && game.init(context)) {
                $close.show();
            }
        });

        $close.click(function () {
            game.exit();
            $(this).hide();
        });

    });


});
