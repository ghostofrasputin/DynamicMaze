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
  
  var run_right1 = new Image(170,30);
  run_right1.src = "sprites/alice/alice_right_run.png";
  this.run_right = new Animation(run_right1, 17);
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
  // draw a simple rectangle shape as our player model
  //context.save();
  //context.fillStyle = "black";
  // before draw we need to convert player world's position to canvas position      
  //context.fillRect((this.x-this.width/2) - xView, (this.y-this.height/2) - yView, this.width, this.height);
  this.run_right.draw(this.step, context, this.x, this.y, this.width, this.height, xView, yView);
  //context.drawImage(run_right1, this.x-this.width/2 - xView, this.y-this.height/2 - yView);
  //context.restore();      
}

//-------------------------------------------------------------------- 
// Game Controls
//--------------------------------------------------------------------

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
      break;
    case 87: // w
      controls.up = true;
      break;
    case 68: // d
      controls.right = true;
      break;
    case 83: // s
      controls.down = true;
      break;
  }
}, false);

window.addEventListener("keyup", function(e){
  switch(e.keyCode)
  {
    case 65: // a
      controls.left = false;
      break;
    case 87: // w
      controls.up = false;
      break;
    case 68: // d
      controls.right = false;
      break;
    case 83: // s
      controls.down = false;
      break;
    case 80: // key P pauses the game
      //togglePause();
      break;    
  }
}, false);
  