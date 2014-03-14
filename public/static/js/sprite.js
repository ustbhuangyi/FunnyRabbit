define(function (require, exports, module) {

    function Sprite(callback) {
        this.children = [];
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scale = 1;
        callback && (this.paint = callback);
    }

    Sprite.prototype.draw = function (context, time) {
        var children = this.children,
		length = children.length,
		i,
		x = this.x,
		y = this.y,
		rotation = this.rotation,
		scale = this.scale;

        if (x || y) context.translate(x, y);
        if (rotation) context.rotate(rotation);
        if (scale !== 1) context.scale(scale, scale);

        this.beforePaint(context, time);
        this.paint(context, time);

        for (i = 0; i < length; i++) {
            children[i].draw(context, time);
        }

        this.afterPaint(context, time);

        if (scale !== 1) {
            scale = 1 / scale;
            context.scale(scale, scale);
        }
        if (rotation) context.rotate(-rotation);
        if (x || y) context.translate(-x, -y);

    };
    Sprite.prototype.beforePaint = function (context, time) {

    };
    Sprite.prototype.paint = function (context, time) {

    };
    Sprite.prototype.afterPaint = function (context, time) {

    };
    Sprite.prototype.add = function (child, name) {
        this.children.push(child);
        name && (this[name] = child);
        return this;
    };

    Sprite.prototype.remove = function (child) {
        var children = this.children,
		i = children.length;

        while (i--) {
            if (child === children[i]) {
                children.splice(i, 1);
            }
        }

        return this;
    };

    module.exports = Sprite;

});