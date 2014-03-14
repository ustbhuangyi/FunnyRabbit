//程序入口
define(function (require) {

    var $ = require("jquery"),
        game = require("game");

    $(document).ready(function () {
        game.initGame();
    });

});
