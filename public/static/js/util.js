define(function (require, exports, module) {

    //factory
    Function.prototype.factory = function () {
        var clazz = this;
        function F(args) {
            clazz.apply(this, args);
        }
        F.prototype = clazz.prototype;
        return function () {
            return new F(arguments);
        };
    };


});
