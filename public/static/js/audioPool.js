/*
*           File:  audioPool.js
*    Description:  audio池，管理html5 audio播放
*
*/
define(function (require, exports, module) {

    var canAudioPlay = !!document.createElement('audio').canPlayType,
    canOgg = canAudioPlay && document.createElement('audio').canPlayType("audio/ogg");
    function noop() {
        //do nothing   
    }

    function AudioPool(src) {
        this.pool = [];
        if (canOgg) {
            this.src = src["ogg"];
        } else {
            this.src = src["mp3"];
        }
        this.newAudio();
    }

    AudioPool.prototype.play = canAudioPlay ? function () {
        var audio = this.pool.shift();
        audio.play();
        if (this.pool.length < 1) {
            this.newAudio();
        }
    } : noop;

    AudioPool.prototype.newAudio = canAudioPlay ? function () {
        var audio = new Audio(this.src),
        me = this;
        this.pool.push(audio);
        audio.addEventListener("ended", function () {
            me.pool.push(audio);
        });
    } : noop;

    module.exports = AudioPool;
});