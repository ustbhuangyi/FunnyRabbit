cc.game.onStart = function(){

  //load resources
  cc.LoaderScene.preload(g_resources, function () {
    //cc.director.setProjection(cc.Director.PROJECTION_2D);
    cc.director.runScene(new GamePlayScene());
  }, this);
};
cc.game.run();
