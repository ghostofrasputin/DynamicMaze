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

window.Game = {};

// Global variables:
var w = 1000;
var h = 1000;
var rects = [];
var whiteRects = [];
var grid = [];
var seconds = 5;
var win = false;
var lose = false;
var goal_rect;
var enemyArray = [];

// Image Resources:
var cards = [];
var ten = new Image(); 
ten.src = "sprites/ten.jpg";
cards.unshift(ten);
var nine = new Image(); 
nine.src = "sprites/nine.jpg";
cards.unshift(nine);
var eight = new Image();
eight.src = "sprites/eight.jpg";
cards.unshift(eight);
var six = new Image();
six.src = "sprites/six.jpg";
cards.unshift(six);
var five = new Image();
five.src = "sprites/five.jpg";
cards.unshift(five);
var ace = new Image();
ace.src = "sprites/ace.jpg";
cards.unshift(ace);

var hedge = new Image();
hedge.src = "sprites/hedge.png";

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
    map: new Map(w, h)
  };
  
  // setup player in the middle of the maze
  var player = new Alice(room.width/2, room.height/2);
  goal_rect = new Rectangle(0, 40, 80, 80, "blue");
 
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
      enemyArray[i] = new PlayingCard(x, y, randomCard);
    }
  }
  
  // generate a large image texture for the room
  room.map.generate(player, enemyArray);
  
  // setup the magic camera !!!
  var camera = new Camera(0, 0, canvas.width, canvas.height, room.width, room.height);   
  camera.follow(player, canvas.width/2, canvas.height/2);
  
  // Game update function
  var update = function(){
    
    if (seconds == 0){
      room.map.generate(player, enemyArray);
      seconds = 5;
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
// start the game when page is loaded
//--------------------------------------------------------------------
window.onload = function(){ 
  Game.play();
}