define(function (require, exports, module) {

    var Sprite = require('sprite'),
    Timeline = require('timeline');

    Stage.prototype = new Sprite();

    function Stage(context, width, height, callback) {
        var me = this;

        Sprite.call(me, callback);
        me.timeline = new Timeline();

        if (context)
            me.setContext(context, width, height);
    }

    Stage.prototype.start = function (interval) {
        this.timeline.start(interval);
        return this;
    };
    Stage.prototype.restart = function () {
        this.timeline.restart();
        return this;
    };
    Stage.prototype.stop = function () {
        this.timeline.stop();
        return this;
    };
    Stage.prototype.setContext = function (context, width, height) {
        var me = this;
        me.context = context;
        me.width = width;
        me.height = height;
        me.timeline.onenterframe = function (time) {
            me.draw(context, time);
        };
    };
    Stage.prototype.beforePaint = function (context, time) {
        context.clearRect(0, 0, this.width, this.height);
    };

    module.exports = Stage;

});