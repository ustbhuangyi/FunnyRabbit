var GC = GC || {};

//游戏难度
GC.DIFFICULTY = {
  EASY: 0,
  NORMAL: 1
};

//月饼种类
GC.CAKE = {
  BOOM: 0,
  SMALL: 1,
  NORMAL: 2,
  BIG: 3,
  HUGE: 4
};

//兔子大小
GC.RABBIT = {
  BIG: 'b',
  SMALL: 's'
};

//道具种类
GC.PROP = {
  CLOCK: 'clock',
  CARROT: 'carrot',
  LESSBOOM: 'lessboom',
  BASKET: 'basket'
};

//兔子移动的方向
GC.MOVING = {
  LEFT: 'l',
  RIGHT: 'r',
  STOP: 's',
  UP: 'u'
};

//游戏状态
GC.GAME_STATE = {
  PLAY: 1,
  OVER: 2
};

//游戏结果
GC.GAME_RESULT = {
  WIN: 1,
  LOSE: 2
};

//篮子状态
GC.BASKET = {
  EMPTY: 1,
  LITTLE: 2,
  FULL: 3,
  OVERFLOW: 4
};

//键盘按键
GC.KEY_MAP = {
  37: 'l', // Left
  38: 'u', // UP
  39: 'r', // Right
  65: 'l', // A
  87: 'u', // W
  68: 'r' // D
};

//屏幕尺寸
GC.winSize = cc.size(1000, 600);

GC.h = GC.winSize.height;

GC.w = GC.winSize.width;

GC.w_2 = GC.w / 2;

GC.h_2 = GC.h / 2;

//游戏帧频
GC.defaultInterval = 1 / 60;

//生命值
GC.life = 2;

//倒计时长
GC.totalTime = 60;

//游戏难度，指炸弹概率
GC.difficulty = GC.DIFFICULTY.NORMAL;

//记分牌位数
GC.scoreLen = 7;

//倒计时位数
GC.timeLen = 2;

//音乐开关
GC.musicOn = true;

//兔子相关设置
GC.rabbit = {
  x: 600,
  y: 50,
  maxRunSpeed: 30,
  maxJumpSpeed: 30,
  direction: GC.MOVING.LEFT,
  type: GC.RABBIT.SMALL,
  basket: GC.BASKET.EMPTY,
  frameLength: 6,
  frameInterval: 6,
  step: {
    l: 3,
    r: 4
  },
  stepJump: {
    l: 4,
    r: 3
  }
};

//炸弹概率，游戏难度而定
GC.difficultyMap = [0.05, 0.1];

//月饼下落速度
GC.speedMap = [3, 4, 5, 6];

//月饼分值
GC.valueMap = [0, 500, 1000, 2000, 5000];

//篮子可改变的积分值
GC.score = {
  little: 20000,
  full: 50000,
  overflow: 100000
};

//hao123的位置，参考坐标系是左上角
GC.hao123Map = [
  [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 1], [2, 1], [3, 2], [3, 3], [3, 4]
  ], //h
  [
    [4, 2], [4, 3], [5, 1], [5, 4], [6, 1], [6, 4], [7, 1], [7, 2], [7, 3], [7, 4]
  ], //a
  [
    [8, 2], [8, 3], [9, 1], [9, 4], [10, 1], [10, 4], [11, 2], [11, 3]
  ], //o
  [
    [12, 0], [13, 0], [13, 1], [13, 2], [13, 3], [13, 4]
  ], //1
  [
    [14, 0], [14, 3], [14, 4], [15, 0], [15, 2], [15, 4], [16, 0], [16, 2], [16, 4], [17, 1], [17, 4]
  ], //2
  [
    [18, 0], [18, 4], [19, 0], [19, 2], [19, 4], [20, 0], [20, 2], [20, 4], [21, 1], [21, 3]
  ]//3
];

GC.hao123 = {
  speed: 5,
  type: 2,
  space: 24,
  size: 40
}
