/*
 *           File:  rabbit.js
 *    Description:  兔子类，负责兔子的渲染
 *
 */
define(function (require, exports, module) {

  var Sprite = require("sprite"),
    config = require("config");

  var rabbitConf = config.get("rabbit"),
    canvasConf = config.get("canvas"),
    resultConf = config.get("result"),
    basketConf = config.get("basket");

  /*小兔子往右跑的各种形象*/
  var smallRightRunningMap = [
      ["0 3", "175 3", "351 3", "527 2", "702 3", "871 0"],
      ["7 92", "182 92", "358 92", "534 91", "709 92", "884 89"],
      ["4 183", "179 183", "355 183", "531 182", "706 183", "881 180"],
      ["4 272", "179 272", "355 272", "531 271", "706 272", "881 269"]
    ],
  /*小兔子往左跑的各种形象*/
    smallLeftRunningMap = [
      ["28 362", "197 365", "371 364", "546 365", "722 365", "897 365"],
      ["14 451", "189 454", "364 453", "539 454", "715 454", "890 454"],
      ["17 542", "192 545", "367 544", "542 545", "718 545", "892 545"],
      ["17 631", "193 634", "367 633", "542 634", "718 634", "893 634"]
    ],
  /*大兔子右跑的各种形象*/
    bigRightRunningMap = [
      ["0 481", "174 481", "349 481", "523 481", "698 480", "872 478"],
      ["0 590", "174 591", "349 591", "524 591", "698 590", "873 587"],
      ["0 720", "174 721", "349 721", "524 721", "698 720", "873 717"],
      ["0 854", "174 852", "349 852", "524 852", "698 851", "873 848"]
    ],
  /*大兔子左跑各种形象*/
    bigLeftRunningMap = [
      ["2 0", "176 2", "351 3", "524 3", "698 3", "874 3"],
      ["1 109", "176 112", "351 113", "524 113", "699 113", "873 112"],
      ["1 239", "176 242", "351 243", "524 243", "699 243", "873 242"],
      ["0 373", "175 376", "350 377", "524 377", "699 377", "873 379"]
    ],
    runningMap = [
      [smallLeftRunningMap, smallRightRunningMap],
      [bigLeftRunningMap, bigRightRunningMap]
    ];


  function Rabbit(images) {
    Sprite.call(this);
    this.create(images);
  }

  Rabbit.prototype = new Sprite(); //继承Sprite

  Rabbit.prototype.create = function (images) {
    this.images = images;
    this.type = rabbitConf.type;
    this.speed = 0;
    this.moving = rabbitConf.stop;
    this.width = rabbitConf.widths[this.type];
    this.height = rabbitConf.height;
    this.minLeft = 0;
    this.maxLeft = canvasConf.width - this.width;
    this.basketState = basketConf.empty;
    this.leftFrame = rabbitConf.leftDefaultFrame;
    this.rightFrame = rabbitConf.rightDefaultFrame;
    this.leftCount = 0;
    this.rightCount = 0;
    this.direction = rabbitConf.left;

  };

  Rabbit.prototype.paint = function (context, time) {
    var img = this.type == rabbitConf.small ? this.images.rabbitSmall.img : this.images.rabbitBig.img,
      width = this.width,
      height = this.height,
      frame = this.direction == rabbitConf.left ? this.leftFrame : this.rightFrame,
      positions = runningMap[this.type][this.direction][this.basketState][frame].split(' ');
    context.drawImage(img, positions[0], positions[1], width, height, 0, 0, width, height);
  };

  Rabbit.prototype.constructor = Rabbit;

  module.exports = Rabbit.factory();
});
