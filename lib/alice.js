//-------------------------------------------------------------------- 
// Alice "class"
//--------------------------------------------------------------------

function Alice(x, y){
  // (x, y) = center of object
  // ATTENTION:
  // it represents the player position on the world(room), 
  // not the canvas position
  // X AND Y coordinates are in the middle of square, 
  // not top left !!!!
  this.x = x;
  this.y = y;       
  
  // move speed in pixels per second
  this.speed = 100;   
  
  // render properties
  this.width = 17;
  this.height = 30;
  
  this.current_rect;
  
  this.step = 0;
  
  this.last_dir = "down";
  
  // run right
  var run_right = new Image(170,30);
  run_right.src = "sprites/alice/alice_run_right.png";
  this.run_right = new Animation(run_right, 17);
  
  // run left
  var run_left = new Image(170,30);
  run_left.src = "sprites/alice/alice_run_left.png";
  this.run_left = new Animation(run_left, 17);
  
  // run down
  var run_down = new Image(170,29);
  run_down.src = "sprites/alice/alice_run_down.png";
  this.run_down = new Animation(run_down, 17);
  
  // run up
  var run_up = new Image(170,29);
  run_up.src = "sprites/alice/alice_run_up.png";
  this.run_up = new Animation(run_up, 17);
  
  // idle right
  var idle_right = new Image(78,29);
  idle_right.src = "sprites/alice/alice_idle_right.png";
  this.idle_right = new Animation(idle_right, 15.6);
  
  // idle left
  var idle_left = new Image(78,29);
  idle_left.src = "sprites/alice/alice_idle_left.png";
  this.idle_left = new Animation(idle_left, 15.6);
  
  // idle up
  var idle_up = new Image(94,29);
  idle_up.src = "sprites/alice/alice_idle_up.png";
  this.idle_up = new Animation(idle_up, 15.7);
  
  // idle down
  var idle_down = new Image(70,29);
  idle_down.src = "sprites/alice/alice_idle_down.png";
  this.idle_down = new Animation(idle_down, 14);
}

Alice.prototype.update = function(step, worldWidth, worldHeight,eArray){
  this.step = step;
  // keep track of which rect in grid the player is occupying
  var j = Math.floor(this.x/40);
  var i = Math.floor(this.y/40);
  this.current_rect = grid[i][j];
  //console.log(~~(this.x/40)+" "+~~(this.y/40));
  
  // wall collision checks
  var flags = [false,false,false,false];
  for(var i = 0; i < rects.length; i++){
    var current = rects[i];
    var playerList = [this.x-this.width/2,this.y-this.height/2,this.width,this.height];
    
    // win condition: get to the blue tile
    if(collisionCheck(goal_rect, playerList)){
      if (goal_rect.color == "blue"){
        win = true;
        console.log("you win!!!");
      }
    }
    
    // sensor-wall collisions
    var size = 1.0;
    var right = [this.x+this.width/2,this.y-this.height/2,size,this.height];
    var bottom = [this.x-this.width/2,this.y+this.height/2,this.width,size];
    var left = [this.x-this.width/2-size,this.y-this.height/2,size,this.height];
    var top = [this.x-this.width/2,this.y-this.height/2-size,this.width,size];
    if(collisionCheck(current,right)){
      flags[0] = true;
    }
    if(collisionCheck(current,bottom)){
      flags[1] = true;
    }
    if(collisionCheck(current,left)){
      flags[2] = true;
    }
    if(collisionCheck(current,top)){
      flags[3] = true;
    }
  }
  
  // check for enemy collisions, lose condition
  for (var i = 0; i < eArray.length; i++){
    var en = eArray[i];
    var enemyList = [en.x-en.width/2,en.y-en.height/2,en.width,en.height];
    if (enemyCollision(playerList, enemyList)){
      lose = true;
    }
  }  
  
  // parameter step is the time between frames ( in seconds )
  // check controls and move the player accordingly
  if(controls.left && !flags[2]) {
    this.x -= this.speed * step;
  }  
  if(controls.up && !flags[3]) {
    this.y -= this.speed * step;
  }  
  if(controls.right && !flags[0]) { 
    this.x += this.speed * step;
  }  
  if(controls.down && !flags[1]) {      
    this.y += this.speed * step;
  }
  
  // don't let player leaves the world's boundary
  if(this.x - this.width/2 < 0){
    this.x = this.width/2;
  }
  if(this.y - this.height/2 < 0){
    this.y = this.height/2;
  }
  if(this.x + this.width/2 > worldWidth){
    this.x = worldWidth - this.width/2;
  }
  if(this.y + this.height/2 > worldHeight){
    this.y = worldHeight - this.height/2;
  } 
}  

Alice.prototype.draw = function(context, xView, yView){    
  
  // idle
  if (current == ""){
    if(this.last_dir=="left"){
      this.idle_left.draw(this.step, context, this.x, this.y, this.width, this.height, xView, yView);
    }
    if(this.last_dir=="up"){
      this.idle_up.draw(this.step, context, this.x, this.y, this.width, this.height, xView, yView);
    }
    if(this.last_dir=="right"){
      this.idle_right.draw(this.step, context, this.x, this.y, this.width, this.height, xView, yView);
    }
    if(this.last_dir=="down"){
      this.idle_down.draw(this.step, context, this.x, this.y, this.width, this.height, xView, yView);
    }
  }
  
  // run left
  if(current == "left") {
    this.run_left.draw(this.step, context, this.x, this.y, this.width, this.height, xView, yView);
    this.last_dir = "left";
  }
  // run up   
  if(current == "up") {
    this.run_up.draw(this.step, context, this.x, this.y, this.width, this.height, xView, yView);
    this.last_dir = "up";
  }
  // run right  
  if(current == "right") { 
    this.run_right.draw(this.step, context, this.x, this.y, this.width, this.height, xView, yView);
    this.last_dir = "right";
  }
  // run down   
  if(current == "down") {      
    this.run_down.draw(this.step, context, this.x, this.y, this.width, this.height, xView, yView);
    this.last_dir = "down";
  }
  
  
}

//-------------------------------------------------------------------- 
// Game Controls
//--------------------------------------------------------------------

var current = "";

controls = {
  left: false,
  up: false,
  right: false,
  down: false,
};

window.addEventListener("keydown", function(e){
  switch(e.keyCode)
  {
    case 65: // a
      controls.left = true;
      current = "left";
      break;
    case 87: // w
      controls.up = true;
      current = "up";
      break;
    case 68: // d
      controls.right = true;
      current = "right";
      break;
    case 83: // s
      controls.down = true;
      current = "down";
      break;
  }
}, false);

window.addEventListener("keyup", function(e){
  switch(e.keyCode)
  {
    case 65: // a
      controls.left = false;
      current = "";
      break;
    case 87: // w
      controls.up = false;
      current = "";
      break;
    case 68: // d
      controls.right = false;
      current = "";
      break;
    case 83: // s
      controls.down = false;
      current = "";
      break;
    case 80: // key P pauses the game
      //togglePause();
      break;    
  }
}, false);
  