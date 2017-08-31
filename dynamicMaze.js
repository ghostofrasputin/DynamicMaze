/*********************************************************************
 * Creative Project: Dynamic Maze Game                               *
 * Program Author: Jacob Preston                                     *
 *                                                                   *
 * Description: The procedurally generated maze must solve a CSP     *
 * in order to regenerate on a 30 second interval without            *
 * interfering with the player and enemies as they traverse          *
 * the maze.                                                         *
 *                                                                   *
 * Theme: Alice in Wonderland. Alice must escape the playing cards   *
 * as the player navigates her to the goal.                          *
 *                                                                   *
 * Resources:                                                        *
 * Camera viewport - http://jsfiddle.net/82kctej6/                   * 
 *********************************************************************/ 

//--------------------------------------------------------------------
// Global functions and variables
//-------------------------------------------------------------------- 
  
// wrapper for game "classes", "methods" and "objects"
window.Game = {};

// Global variables:
var w = 1000;
var h = 1000;
var rects = [];
var whiteRects = [];
var grid = [];
var seconds = 30;
var win = false;
var lose = false;
var goal_rect;
var enemyArray = [];

// Image Resources:
var cards = [];
var ten = new Image(); 
ten.src = "cards/ten.jpg";
cards.unshift(ten);
var nine = new Image(); 
nine.src = "cards/nine.jpg";
cards.unshift(nine);
var eight = new Image();
eight.src = "cards/eight.jpg";
cards.unshift(eight);
var six = new Image();
six.src = "cards/six.jpg";
cards.unshift(six);
var five = new Image();
five.src = "cards/five.jpg";
cards.unshift(five);
var ace = new Image();
ace.src = "cards/ace.jpg";
cards.unshift(ace);

// checks for collision between player and a wall object. Returns
// True if there's a collision, else False
function collisionCheck(wall, attributelist) {
  // Wall
  var minX = wall.left;
  var maxX = wall.left + wall.width;
  var minY = wall.top;
  var maxY = wall.top + wall.height;
  
  // Player
  var x = attributelist[0];
  var y = attributelist[1];
  var width = attributelist[2];
  var height = attributelist[3];
  var minX2 = x;
  var maxX2 = x + width;
  var minY2 = y;
  var maxY2 = y + height;

  // collision detection for player and wall
  return (minX < maxX2 && maxX > minX2 && minY < maxY2 && maxY > minY2);
}

// just like previous collision, except this takes two attribute lists:
// one from the player and one from the enemy
// returns true is there is a collision
function enemyCollision(enemyList,playerList) {
  // Enemy
  var x0 = enemyList[0];
  var y0 = enemyList[1];
  var width0 = enemyList[2];
  var height0 = enemyList[3];
  var minX = x0;
  var maxX = x0 + width0;
  var minY = y0;
  var maxY = y0 + height0;
  
  // Player
  var x1 = playerList[0];
  var y1 = playerList[1];
  var width1 = playerList[2];
  var height1 = playerList[3];
  var minX2 = x1;
  var maxX2 = x1 + width1;
  var minY2 = y1;
  var maxY2 = y1 + height1;

  // collision detection for player and enemy
  return (minX < maxX2 && maxX > minX2 && minY < maxY2 && maxY > minY2);
}

//--------------------------------------------------------------------
// Priority Queue "class"
//-------------------------------------------------------------------- 
function PriorityQueue() {

  var items = [];

  function QueueElement(element, priority) {
    this.element = element;
    this.priority = priority;
  }

  this.enqueue = function(element, priority) {
    var queueElement = new QueueElement(element, priority);

    if (this.isEmpty()) {
      items.push(queueElement);
    } else {
      var added = false;
      for (var i = 0; i < items.length; i++) {
        if (queueElement.priority < items[i].priority) {
          items.splice(i, 0, queueElement);
          added = true;
          break;
        }
      }
      if (!added) {
        items.push(queueElement);
      }
    }
  };

  this.dequeue = function () {
    return items.shift();
  };

  this.front = function () {
    return items[0];
  };

  this.isEmpty = function () {
    return items.length == 0;
  };

  this.size = function () {
    return items.length;
  };
  
  this.list = function () {
    return items;
  }
  
  this.print = function () {
    for (var i = 0; i < items.length; i++) {
      console.log(items[i].element + ' - ' + items[i].priority);
    }
  };
}

//-------------------------------------------------------------------    
// Rectangle wrapper
//--------------------------------------------------------------------
(function(){
  function Rectangle(left, top, width, height, color){
    this.left = left || 0;
    this.top = top || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
    this.color = color;
    this.key = [];
    this.parent = this;
  }
  
  Rectangle.prototype.set = function(left, top, /*optional*/width, /*optional*/height){
    this.left = left;
    this.top = top;
    this.width = width || this.width;
    this.height = height || this.height
    this.right = (this.left + this.width);
    this.bottom = (this.top + this.height);
  }
  
  Rectangle.prototype.within = function(r) {
    return (r.left <= this.left && 
        r.right >= this.right &&
        r.top <= this.top && 
        r.bottom >= this.bottom);
  }   
  
  Rectangle.prototype.overlaps = function(r) {
    return (this.left < r.right && 
        r.left < this.right && 
        this.top < r.bottom &&
        r.top < this.bottom);
  }
  
  Rectangle.prototype.set_key = function(i,j){
    this.key = [i,j];
  }
  
  Rectangle.prototype.is_wall = function(){
    if(this.color=="darkgreen"){
      return true;
    }
    return false;
  }
  
  Rectangle.prototype.key_equals = function(rect){
    var key1 = this.key;
    var i1 = key1[0];
    var j1 = key1[1];
    var key2 = rect.key;
    var i2 = key2[0];
    var j2 = key2[1];
    if(i1==i2 && j1==j2){
      return true;
    }
    return false;
  }
  
  Rectangle.prototype.neighbors = function(){
    var neighbors = [];
    var i = this.key[0];
    var j = this.key[1];
    if(i<((w/40)-1)) {
      var right = grid[i+1][j];
      if(!right.is_wall() && !right.key_equals(this.parent)){
        neighbors.push(right);
      }
    }
    if(j<((h/40)-1)){
      var down = grid[i][j+1];
      if(!down.is_wall() && !down.key_equals(this.parent)){
        neighbors.push(down);
      }
    }
    if(i>0){
      var left = grid[i-1][j];
      if(!left.is_wall() && !left.key_equals(this.parent)){
        neighbors.push(left);
      }
    }
    if(j>0){
      var up = grid[i][j-1];
      if(!up.is_wall() && !up.key_equals(this.parent)){
        neighbors.push(up);
      }
    }
    return neighbors;
  }
  
  // add "class" Rectangle to Game object
  Game.Rectangle = Rectangle;
})();

//-------------------------------------------------------------------- 
// Player wrapper
//--------------------------------------------------------------------
(function(){
  function Player(x, y){
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
    this.width = 25;
    this.height = 25;
    
    this.current_rect;
  }
  
  Player.prototype.update = function(step, worldWidth, worldHeight,eArray){
    
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
    if(Game.controls.left && !flags[2]) {
      this.x -= this.speed * step;
    }  
    if(Game.controls.up && !flags[3]) {
      this.y -= this.speed * step;
    }  
    if(Game.controls.right && !flags[0]) { 
      this.x += this.speed * step;
    }  
    if(Game.controls.down && !flags[1]) {      
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

  Player.prototype.draw = function(context, xView, yView){    
    // draw a simple rectangle shape as our player model
    context.save();
    context.fillStyle = "black";
    // before draw we need to convert player world's position to canvas position      
    context.fillRect((this.x-this.width/2) - xView, (this.y-this.height/2) - yView, this.width, this.height);
    context.restore();      
  }
  
  // add "class" Player to Game object
  Game.Player = Player;
})();
  
//--------------------------------------------------------------------
// Enemy wrapper
//-------------------------------------------------------------------- 
(function(){
  function Enemy(x,y,card){
    this.x = x;
    this.y = y;       
    this.speed = 50;   
    this.width = 25;
    this.height = 31;
    this.counter = 40;
    this.threshold = 600;
    this.card = card;
    this.current_rect;
    this.path = [];
  }
  
  Enemy.prototype.update = function(step, player, worldWidth, worldHeight){
    
    // keep track of which rect in grid the enemy is occupying
    var j = Math.floor(this.x/40);
    var i = Math.floor(this.y/40);
    this.current_rect = grid[i][j];
    
    // A* behavior if player is within theshold
    var start = this.current_rect;
    var goal = player.current_rect;
    if(euclidean_distance(start,goal)) {
      // only make a new path when the player moves to a new
      // grid location
      this.path = a_star(start, goal);
      if(this.path.length>0){
        var head_node = this.path[0];
        var x = head_node[0];
        var y = head_node[1];
        if(this.x > x) {
          this.x -= this.speed * step;
        }  
        if(this.y > y) {
          this.y -= this.speed * step;
        }  
        if(this.x < x) { 
          this.x += this.speed * step;
        }  
        if(this.y < y) {      
          this.y += this.speed * step;
        }
      }  
    } 
    // reflex behavior if player is too far away
    else {
      
    }
    
    // don't let enemy leaves the world's boundary
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
  
  // based on  player draw
  Enemy.prototype.draw = function(context, xView, yView){   
    context.save();
    console.log(this.path.length);
    // debugging path
    /*for(var k=0; k<this.path.length; k++){
      context.drawImage(this.card, this.path[k][0]-this.width/2 - xView, this.path[k][1]-this.height/2 - yView);  
    }*/
    //context.fillStyle = "red";    
    //context.fillRect((this.x-this.width/2) - xView, (this.y-this.height/2) - yView, this.width, this.height);
    context.drawImage(this.card, this.x-this.width/2 - xView, this.y-this.height/2 - yView);
    context.restore();      
  }
  
  function contains(set, node){
    if(set.length==0){
      return false;
    }
    for(var k=0; k<set.length; k++){
      if(node.key_equals(set[k])){
        return true;
      }
    }
    return false;
  }
  
  function manhattan(n1,n2){
    var dx = Math.abs(n1.left-n2.left);
    var dy = Math.abs(n1.top-n2.top);
    return dx + dy;
  }
  
  function euclidean_distance(n1,n2){
    var dx = Math.abs(n1.left-n2.left);
    var dy = Math.abs(n1.top-n2.top);
    return Math.sqrt(((dx*dx)+(dy*dy)));
  }
  
  function bfs(start, goal){
    var set = [];
    var queue = [];
    queue.unshift([start,[]]);
    while(queue.length>0){
      var current = queue.pop();
      var node = current[0];
      var path = current[1];
      if(node.key_equals(goal)){
        return path;
      }
      var successors = node.neighbors();
      if(successors.length>0){
        for(var k=0; k<successors.length;k++){
          var successor = successors[k];
          if(!contains(set,successor)){
            successor.parent = node;
            var x = successor.left + successor.width/2;
            var y = successor.top + successor.height/2;
            var new_path = path.slice(0);
            new_path.push([x,y]);
            var state = [successor, new_path] ;
            set.push(successor);
            queue.unshift(state);
          }
        }
      }
    }
    return [];
  }
  
  function dfs(start, goal){
    var set = [];
    var stack = [];
    stack.push([start,[]]);
    while(stack.length>0){
      var current = stack.pop();
      var node = current[0];
      var path = current[1];
      if(node.key_equals(goal)){
        return path;
      }
      var successors = node.neighbors();
      if(successors.length>0){
        for(var k=0; k<successors.length;k++){
          var successor = successors[k];
          if(!contains(set,successor)){
            successor.parent = node;
            var x = successor.left + successor.width/2;
            var y = successor.top + successor.height/2;
            var new_path = path.slice(0);
            new_path.push([x,y]);
            var state = [successor, new_path] ;
            set.push(successor);
            stack.unshift(state);
          }
        }
      }
    }
    return [];
  }
  
  function a_star(start, goal){
    var closed_set = []
    var open_set = new PriorityQueue();
    open_set.enqueue([start,[]], 0);
    while(!open_set.isEmpty()){
      var current = open_set.dequeue();
      var node = current.element[0];
      var path = current.element[1];
      if(node.key_equals(goal)){
        return path;
      }
      closed_set.push(node);
      var successors = node.neighbors();
      if(successors.length > 0){
        for(var i=0; i<successors.length; i++){
          var successor = successors[i];
          if(contains(closed_set,successor)) {
            continue;
          }
          successor.parent = node;
          // pushing tuple of x,y middle coords
          var x = successor.left + successor.width/2;
          var y = successor.top + successor.height/2;
          var new_path = path.slice(0);
          new_path.push([x,y]);
          var state = [successor, new_path];
          var gcost = path.length + 1;
          var hcost = manhattan(successor,goal);
          var fcost = gcost + hcost;
          open_set.enqueue(state, fcost);
        }
      }
    }
    return [];
  }
  
  // add "class" Enemy to Game object
  Game.Enemy = Enemy;
  
})();  

//-------------------------------------------------------------------- 
// Camera wrapper
//--------------------------------------------------------------------
(function(){

  // possibles axis to move the camera
  var AXIS = {
    NONE: "none", 
    HORIZONTAL: "horizontal", 
    VERTICAL: "vertical", 
    BOTH: "both"
  };

  // Camera constructor
  function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight)
  {
    // position of camera (left-top coordinate)
    this.xView = xView || 0;
    this.yView = yView || 0;
    
    // distance from followed object to border before camera starts move
    this.xDeadZone = 0; // min distance to horizontal borders
    this.yDeadZone = 0; // min distance to vertical borders
    
    // viewport dimensions
    this.wView = canvasWidth;
    this.hView = canvasHeight;      
    
    // allow camera to move in vertical and horizontal axis
    this.axis = AXIS.BOTH;  
  
    // object that should be followed
    this.followed = null;
    
    // rectangle that represents the viewport
    this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);       
              
    // rectangle that represents the world's boundary (room's boundary)
    this.worldRect = new Game.Rectangle(0, 0, worldWidth, worldHeight);
    
  }

  // gameObject needs to have "x" and "y" properties (as world(or room) position)
  Camera.prototype.follow = function(gameObject, xDeadZone, yDeadZone)
  {   
    this.followed = gameObject; 
    this.xDeadZone = xDeadZone;
    this.yDeadZone = yDeadZone;
  }         
  
  Camera.prototype.update = function()
  {
    // keep following the player (or other desired object)
    if(this.followed != null)
    {   
      if(this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH)
      {   
        // moves camera on horizontal axis based on followed object position
        if(this.followed.x - this.xView  + this.xDeadZone > this.wView)
          this.xView = this.followed.x - (this.wView - this.xDeadZone);
        else if(this.followed.x  - this.xDeadZone < this.xView)
          this.xView = this.followed.x  - this.xDeadZone;
        
      }
      if(this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH)
      {
        // moves camera on vertical axis based on followed object position
        if(this.followed.y - this.yView + this.yDeadZone > this.hView)
          this.yView = this.followed.y - (this.hView - this.yDeadZone);
        else if(this.followed.y - this.yDeadZone < this.yView)
          this.yView = this.followed.y - this.yDeadZone;
      }           
      
    }   
    
    // update viewportRect
    this.viewportRect.set(this.xView, this.yView);
    
    // don't let camera leaves the world's boundary
    if(!this.viewportRect.within(this.worldRect))
    {
      if(this.viewportRect.left < this.worldRect.left)
        this.xView = this.worldRect.left;
      if(this.viewportRect.top < this.worldRect.top)          
        this.yView = this.worldRect.top;
      if(this.viewportRect.right > this.worldRect.right)
        this.xView = this.worldRect.right - this.wView;
      if(this.viewportRect.bottom > this.worldRect.bottom)          
        this.yView = this.worldRect.bottom - this.hView;
    }
    
  } 
  
  // add "class" Camera to Game object
  Game.Camera = Camera;
})();

//--------------------------------------------------------------------  
// Map wrapper
//--------------------------------------------------------------------
(function(){
  function Map(width, height){
    // map dimensions
    this.width = width;
    this.height = height;
    
    // map texture
    this.image = null;
  }
  
  // generate an example of a large map
  Map.prototype.generate = function(player, eArray){
    grid = [];
    rects = []
    whiteRects = []
    var ctx = document.createElement("canvas").getContext("2d");    
    ctx.canvas.width = this.width;
    ctx.canvas.height = this.height;    
    var playerList = [player.x-player.width/2,
                      player.y-player.height/2,
                      player.width,
                      player.height];
                      
    // ~~ takes the floor of a number (double bitwise not)
    var rows = ~~(this.width/40) + 1; 
    var columns = ~~(this.height/40) + 1;
    
    var colors = ["white","white","darkgreen"];   
    ctx.save();     
    ctx.fillStyle = "black";
    for (var x = 0, i = 0; i < rows; x+=40, i++) {  
      var row = [];
      for (var y = 0, j=0; j < columns; y+=40, j++) {
        var color = colors[~~(Math.random() * colors.length)];
        ctx.beginPath();
        /*if(i==5 && j==5 || i==2 && j==5){
          color = "darkgreen";
        } else {
          color = "white";
        }*/
        // X AND Y ARE FLIPPED; X = VERTICAL, Y = HORIZONTAL !!!
        var rect = new Game.Rectangle(y, x, 40, 40, color);
        rect.set_key(i,j);
        row.push(rect);
        // makes sure wall does not spawn on player's start location
        if (collisionCheck(rect,playerList)) {
          color = rect.color = "white";
        }
        // make sure wall does not spawn on goal tile
        if (rect.overlaps(goal_rect)){
          color = rect.color = "white";
        }
        for (var k = 0; k < eArray.length; k++){
          var en = eArray[k];
          var enemyList = [en.x-en.width/2, en.y-en.height/2, en.width, en.height];
          if (collisionCheck(rect, enemyList)){
            color = rect.color = "white";
          }
        }
        ctx.rect(y, x, 40, 40);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
        // black rectangles are walls
        // add these to wall list for collision testing
        if (color == "darkgreen") {
          rects.unshift(rect);
        } else {
          whiteRects.unshift(rect);
        }
      }
      grid.push(row);
    }
    
    // draw goal
    ctx.fillStyle = "blue";
    ctx.fillRect(goal_rect.left,goal_rect.top, goal_rect.width, goal_rect.height);      
    ctx.restore();  
    
    // store the generate map as this image texture
    this.image = new Image();
    this.image.src = ctx.canvas.toDataURL("image/png");         
    
    // clear context
    ctx = null;
  }
  
  // draw the map adjusted to camera
  Map.prototype.draw = function(context, xView, yView){         
    // easiest way: draw the entire map changing only the destination coordinate in canvas
    // canvas will cull the image by itself (no performance gaps -> in hardware accelerated environments, at least)
    //context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xView, -yView, this.image.width, this.image.height);
    
    // didactic way:
    var sx, sy, dx, dy;
    var sWidth, sHeight, dWidth, dHeight;
    
    // offset point to crop the image
    sx = xView;
    sy = yView;
    
    // dimensions of cropped image      
    sWidth =  context.canvas.width;
    sHeight = context.canvas.height;

    // if cropped image is smaller than canvas we need to change the source dimensions
    if(this.image.width - sx < sWidth){
      sWidth = this.image.width - sx;
    }
    if(this.image.height - sy < sHeight){
      sHeight = this.image.height - sy; 
    }
    
    // location on canvas to draw the croped image
    dx = 0;
    dy = 0;
    // match destination with source to not scale the image
    dWidth = sWidth;
    dHeight = sHeight;                  
    
    context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }
  
  // add "class" Map to Game object
  Game.Map = Map; 
})();

//-------------------------------------------------------------------- 
// Game Script wrapper
//--------------------------------------------------------------------
(function(){
  // prepaire our game canvas
  var canvas = document.getElementById("gameCanvas");
  var context = canvas.getContext("2d");

  // game settings: 
  var FPS = 120;
  var INTERVAL = 1000/FPS; 
  var STEP = INTERVAL/1000;
  
  // setup an object that represents the room
  var room = {
    width: w,
    height: h,
    map: new Game.Map(w, h)
  };
  
  // for debugging:
  /*var room = {
    width: 500,
    height: 500,
    map: new Game.Map(500, 500)
  };*/
  
  // setup player in the middle of the maze
  var player = new Game.Player(room.width/2, room.height/2);
  goal_rect = new Game.Rectangle(0, 40, 80, 80, "blue");
 
  // setup enemies
  var enemyNum = 2;
  
  var offset = 50;
  var playerList = [player.x-player.width/2,
                    player.y-player.height/2,
                    player.width,
                    player.height];
  for (var i = 0; i < enemyNum; i++){
    var randomCard = cards[~~(Math.random() * cards.length)];
    var x = Math.abs(Math.floor((Math.random() * w-offset) + 1));
    //console.log("x"+x);
    var y = Math.abs(Math.floor((Math.random() * h-offset) + 1));
    //console.log("y"+y);
    var enemyList = [x-25/2, y-25/2, 25, 31];
    // don't allow enemies to spawn on top of the player
    if(!enemyCollision(playerList, enemyList)) {
      enemyArray[i] = new Game.Enemy(x, y, randomCard);
    }
  }
  
  // generate a large image texture for the room
  room.map.generate(player, enemyArray);
  
  // setup the magic camera !!!
  var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);   
  camera.follow(player, canvas.width/2, canvas.height/2);
  
  // Game update function
  var update = function(){
    
    if (seconds == 0){
      room.map.generate(player, enemyArray);
      seconds = 30;
    }
    player.update(STEP, room.width, room.height, enemyArray);
    for (var i = 0; i < enemyArray.length; i++){
      var en = enemyArray[i];
      en.update(STEP, player, room.width, room.height);
    }      
    camera.update();
  }
    
  // Game draw function
  var draw = function(){
    // clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // redraw all objects
    room.map.draw(context, camera.xView, camera.yView);   
    player.draw(context, camera.xView, camera.yView);
    
    for (var i = 0; i < enemyArray.length; i++){
      var en = enemyArray[i];
      en.draw(context, camera.xView, camera.yView);
    }
    
    // Draw the remaining seconds left
    context.font = "50px Times New Roman";
    context.fillStyle = "red";
    context.fillText(seconds, 440, 45);
    if (win == true){
      //context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = "100px Times New Roman";
      context.fillStyle = "red";
      context.fillText("YOU WIN!!", 0, canvas.height/2);
    }
    if (lose == true){
      //context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = "60px Times New Roman";
      context.fillStyle = "red";
      //context.fillText("Off With Her Head!", 10, canvas.height/2);
      context.fillText("You Lose", 130, canvas.height/2+60);
    }
  }
  
  // Game Loop
  var gameLoop = function(){                
    if(!lose && !win){
      update();
      draw();
    } 
  } 
  
  // configure play/pause capabilities:
  var runningId = -1;
  Game.play = function(){ 
    if(runningId == -1){
      runningId = setInterval( function(){ gameLoop(); }, INTERVAL);
      setInterval(function() {seconds--;}, 1000)
      console.log("play");
    }
  }
  
  Game.togglePause = function(){    
    if(runningId == -1){
      Game.play();
    }
    else
    {
      clearInterval(runningId);
      runningId = -1;
      console.log("paused");
    }
  }
})();

//-------------------------------------------------------------------- 
// Game Controls
//--------------------------------------------------------------------

Game.controls = {
  left: false,
  up: false,
  right: false,
  down: false,
};

window.addEventListener("keydown", function(e){
  switch(e.keyCode)
  {
    case 65: // a
      Game.controls.left = true;
      break;
    case 87: // w
      Game.controls.up = true;
      break;
    case 68: // d
      Game.controls.right = true;
      break;
    case 83: // s
      Game.controls.down = true;
      break;
  }
}, false);

window.addEventListener("keyup", function(e){
  switch(e.keyCode)
  {
    case 65: // a
      Game.controls.left = false;
      break;
    case 87: // w
      Game.controls.up = false;
      break;
    case 68: // d
      Game.controls.right = false;
      break;
    case 83: // s
      Game.controls.down = false;
      break;
    case 80: // key P pauses the game
      Game.togglePause();
      break;    
  }
}, false);

//-------------------------------------------------------------------- 
// start the game when page is loaded
//--------------------------------------------------------------------
window.onload = function(){ 
  Game.play();
}