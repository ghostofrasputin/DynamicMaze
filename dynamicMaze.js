/******************************************************************************
 * Creative Project: Dynamic Maze Changer                                     *
 * Team Members: Jacob Preston & Jamison Ball                                 *
 * CMPM146: Game Artificial Intelligence                                      *
 *                                                                            *
 * Description: The player must navigate through the maze as it regenerates   *
 * in intervals of 30 seconds. A* algorithm garantees that a path to the blue *
 * goal tile is always avaliable. Reflex agent Enemies will try to track and  *
 * kill the player.                                                           *
 *                                                                            *
 * Resources:                                                                 *
 * PriorityQueue - http://fiddle.jshell.net/9uuv5prq/2/                       *
 * Camera viewport - http://jsfiddle.net/82kctej6/                            * 
 ******************************************************************************/ 
  
// wrapper for our game "classes", "methods" and "objects"
	window.Game = {};

//------------------------------------------------------------------------------
// Our global functions and variables
//------------------------------------------------------------------------------   
  
  // Global variables:
  var rects = [];
  var whiteRects = [];
  var combinedRects = [];
  var seconds = 30;
  var win = false;
  var lose = false;
  var pathToPlayer = [];
  
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
  
  // sees if a coordinate exists in a list
  function exists(list,coordinate){
    var x = coordinate[0];
    var y = coordinate[1];
    for (var i = 0; i < list.length; i++){
      var currentCoord = list[i];
      var ccx = currentCoord[0];
      var ccy = currentCoord[1];
      if (ccx == x && ccy == y){
        return true;
      }
    }
    return false;
  }
  
  // successor function, takes coordinates and returns a list of avaiable
  // moves. tests for collisions, and returns moves that are feasible.
  function neighbor(coords,player){
    var successors = [];
    var x = coords[0];
    var y = coords[1];
    var actionList = [];
    var xFlag = false;
    var yFlag = false;
    if (x < player.x){
      actionList.push([10,0]);
    }
    if (x > player.x){
      actionList.push([-10,0]);
    }
    if (y < player.y){
      actionList.push([0,10]);
    }
    if (y > player.y){
      actionList.push([0,-10]);
    }
    if(actionList.length == 0){
      var actions = [[10,0],[0,10],[-10,0],[0,-10]];
      actionList = actions;
    }
    var collisionFlag = false;
    for(var i = 0; i < actionList.length; i++){
      var move = actionList[i];
      var tempx = move[0];
      var tempy = move[1];
      var posx = x + tempx;
      var posy = y + tempy;
      var enemyList = [posx-(25/2),posy-(25/2),25,25];
      for(var j = 0; j < rects.length; j++){
        if (collisionCheck(rects[j], enemyList)){
          collisionFlag = true;
          break;
        }  
      }
      // if there is no collision add the coordinate/move
      // to the list of successors
      if (!collisionFlag){
        var coordMove = [[posx,posy],[tempx,tempy]];
        successors.unshift(coordMove);
      }
      collisionFlag = false;      
    }
    return successors;
  }
    
  // A* algorithm for enemies to find path to the player without
  // hitting walls. returns a list of moves.
  function Astar(p,e){
    var disc = [];
    var playerList = [p.x-(p.width/2),p.y-(p.height/2),p.width,p.height];
    var source = [[e.x,e.y],[]]; 
    var pq = new PriorityQueue();
    pq.enqueue(source, 0);
    while (!pq.isEmpty()){ 
      var current = pq.dequeue();
      var coordinates = current.element[0];
      var choicePath = current.element[1];
      var neighborMoves = neighbor(coordinates,p);
      disc.unshift(coordinates);
      for(var i = 0; i < neighborMoves.length; i++){
        var coordMove = neighborMoves[i];
        var coord = coordMove[0];
        //var move = coordMove[1];
        if(!exists(disc,coord)){
          var cx = coord[0];
          var cy = coord[1];
          var enemyList = [cx-(25/2),cy-(25/2),25,25]; 
          choicePath.push(coord);
          if(enemyCollision(enemyList,playerList)){
            return choicePath;
          }
          // g(n) - cost so far
          var gcost = choicePath.length;
          // h(n) - calculate eucilidean heuristic cost:
          var dx = (cx-(25/2))-p.x;
          var dy = (cy-(25/2))-p.y;
          var hcost = Math.sqrt(((dx*dx)+(dy*dy)));
          // f(n) = h(n) + g(n)
          var fcost = gcost + hcost;
          var cm = [coord,choicePath];
          pq.enqueue(cm, fcost);
          //disc.unshift(coord);
        } 
      }
    }
  // no path return empty list  
  return [];  
  }

//------------------------------------------------------------------------------
// Priority Queue "class"
//------------------------------------------------------------------------------ 

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

    this.print = function () {
        for (var i = 0; i < items.length; i++) {
            console.log(items[i].element + ' - ' + items[i].priority);
        }
    };
}

//------------------------------------------------------------------------------
// A* Player to Goal path solved. This path is needed for the constraint that
// the player must always have a path to the goal, every regeneration.
//------------------------------------------------------------------------------
	
  function rexists(listOfRects, succ){
    var x = succ.left;
    var y = succ.top;
    for (var i = 0; i < listOfRects.length; i++){
      var current = listOfRects[i];
      var cx = current.left;
      var cy = current.top;
      if (x == cx && y == cy){
        return true;
      } 
    }
    return false;
  }
  
  // returns possible successors
  function neighborhood(square) {
    var successors = [];
    var x = square.top;
    var y = square.left;
    var left = new Game.Rectangle(x-40,y,40,40,"white");
    var right = new Game.Rectangle(x+40,y,40,40,"white");
    var top = new Game.Rectangle(x,y-40,40,40,"white");
    var bottom = new Game.Rectangle(x,y+40,40,40,"white");
    var possibiltiies = [left,right,top,bottom];
    for (var i = 0; i < possibiltiies.length; i++){
      var successor = possibiltiies[i];
      // see if successor exists in rects, return the rect
      if (rexists(combinedRects,successor)){
        successors.push(successor);
      }
    }
    //console.log(successors);
    return successors;
  }
  
  // greedy path to goal, very quick fast path
  function aStarPath(player, goal){
    var playerList = [player.x-25/2,player.y-25/2,25,25];
    for (var p = 0; p < whiteRects.length; p++){ 
      if (collisionCheck(whiteRects[p],playerList)){
        var srcSquare = whiteRects[p];
      }
    }
    pq = new PriorityQueue();
    closedSet = [];
    pq.enqueue([srcSquare,[]]);
    while (!pq.isEmpty()){
      var current = pq.dequeue();
      var node = current.element[0];
      var path = current.element[1];
      var successors = neighborhood(node);
      closedSet.push(node);
      for (var i = 0; i < successors.length; i++){
        var successor = successors[i];
        if (!rexists(closedSet,successor)) {
          path.push(successor);
          if(successor.within(goal)){
            return path;
          }
          var gcost = path.length;
          
          // euclidean heuristic
          var dx = successor.left-goal.left;
          var dy = successor.top-goal.top;
          var hcost = Math.sqrt(((dx*dx)+(dy*dy)));
          var state = [successor, path];
          var fcost = gcost + hcost;
          pq.enqueue(state, fcost);
        }
      }
    }
    return [];
  }  
   
//------------------------------------------------------------------------------    
// wrapper for "class" Rectangle
//------------------------------------------------------------------------------ 
	(function(){
		function Rectangle(left, top, width, height, color){
			this.left = left || 0;
			this.top = top || 0;
      this.width = width || 0;
			this.height = height || 0;
			this.right = this.left + this.width;
			this.bottom = this.top + this.height;
      this.color = color;
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
    
		// add "class" Rectangle to our Game object
		Game.Rectangle = Rectangle;
	})();	

//------------------------------------------------------------------------------  
// wrapper for "class" Camera (avoid global objects)
//------------------------------------------------------------------------------ 
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
		
		// add "class" Camera to our Game object
		Game.Camera = Camera;
		
	})();

//------------------------------------------------------------------------------   
// wrapper for "class" Player
//------------------------------------------------------------------------------ 
	(function(){
		function Player(x, y){
			// (x, y) = center of object
			// ATTENTION:
			// it represents the player position on the world(room), not the canvas position
			this.x = x;
			this.y = y;				
			
			// move speed in pixels per second
			this.speed = 100;		
			
			// render properties
			this.width = 25;
			this.height = 25;
      
		}
		
		Player.prototype.update = function(step, worldWidth, worldHeight,eArray){
        // loop over list of reactangles
        var collide = false;
        var skip = false;
        for(var i = 0; i < rects.length; i++){
          var current = rects[i];
          // X AND Y coordinates are in the middle of square, not top left !!!!
          var playerList = [this.x-this.width/2,this.y-this.height/2,this.width,this.height];
          if (collisionCheck(current, playerList)){  
            // DEBUG LOGS
            //console.log("collision");
            //console.log(playerList);
            //console.log(rects[i]);
            //console.log(current.color);
            if (current.color == "blue" && lose != true){
              //console.log("You Win!!!");
              win = true;
              skip = true;
            }
            if (skip == false){
              if(this.x - this.width/2 < current.left){
                this.x -= 1;
              }
              if(this.y - this.height/2 < current.top){
                this.y -= 1;
              }
              if(this.x + this.width/2 > current.left+current.width){
                this.x += 1;
              }
              if(this.y + this.height/2 > current.top+current.height){
                this.y += 1;
              }
              collide = true;
              break;
            }
          }
        }
        for (var i = 0; i < eArray.length; i++){
          var en = eArray[i];
          var enemyList = [en.x-en.width/2,en.y-en.height/2,en.width,en.height];
          if (enemyCollision(playerList, enemyList)){
            lose = true;
          }
        }  
        if (!collide){
          // parameter step is the time between frames ( in seconds )
          // check controls and move the player accordingly
          if(Game.controls.left) {
            this.x -= this.speed * step;
          }  
          if(Game.controls.up) {
            this.y -= this.speed * step;
          }  
          if(Game.controls.right) { 
            this.x += this.speed * step;
          }  
          if(Game.controls.down) {      
            this.y += this.speed * step;
          }
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
		
		// add "class" Player to our Game object
		Game.Player = Player;
		
	})();
  
//------------------------------------------------------------------------------
// wrapper for enemy class
//------------------------------------------------------------------------------  
  (function(){
    function Enemy(x,y,card){
      this.x = x;
			this.y = y;				
			this.speed = 200;		
			this.width = 25;
			this.height = 31;
      this.counter = 40;
      this.threshold = 40;
      this.card = card;
    }
    
    Enemy.prototype.successor = function(action){
      var x = action[0];
      var y = action[1];
      var nextState = [[this.x+x],[this.y+y]];
      return nextState;
    }
    
    Enemy.prototype.update = function(player, worldWidth, worldHeight){
      // This is code for a reflex agent, but right now it
      // it does worse than A* pathfinding method.
      var collide = false;
      var actions = [[1,0],[0,1],[-1,0],[0,-1]];
      var bestAction = actions[0];
      var min = Number.POSITIVE_INFINITY;
      for (var i = 0; i < actions.length; i++){
        var action = actions[i];
        var nextState = this.successor(action);
        var x = nextState[0];
        var y = nextState[1];
        // euclidean distance:
        var dx = player.x - x;
        var dy = player.y - y;
        var distance = Math.sqrt(((dx*dx) + (dy*dy)));
        var val = distance;
        if (min > val){
          min = val
          bestAction = action;
        }
      }
      var enemyList = [this.x-this.width/2,this.y-this.height/2,this.width,this.height];
      for(var j = 0; j < rects.length; j++){
        var current = rects[j];
        if(collisionCheck(current,enemyList)){
          if(this.x - this.width/2 < current.left){
            this.x -= 1;
          }
          if(this.y - this.height/2 < current.top){
            this.y -= 1;
          }
          if(this.x + this.width/2 > current.left+current.width){
            this.x += 1;
          }
          if(this.y + this.height/2 > current.top+current.height){
            this.y += 1;
          }
          collide= true;
        }
      }
      if (!collide && this.counter == this.threshold){
        this.x += bestAction[0];
        this.y += bestAction[1]; 
      } else {
        // patrol behavior:
        if ( 30 < this.counter ){
          this.x -= bestAction[0];
          this.y -= bestAction[1];
        }
        if ( 0 < this.counter && this.counter < 20 ){
          if(bestAction[0] == 0){
            this.x += 1;
          } else {
            this.x += 0;
          }
          if(bestAction[1] == 0){
            this.y += 1;
          } else {
            this.y += 0;
          }
          // pick random move
          //this.x -= actions[~~(Math.random() * actions.length)][0];
          //this.y -= actions[~~(Math.random() * actions.length)][1];
        }
        this.counter -= 1;
        if (this.counter == 0){
          this.counter = this.threshold;
        }  
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
      
			//context.fillStyle = "red";		
			//context.fillRect((this.x-this.width/2) - xView, (this.y-this.height/2) - yView, this.width, this.height);
      context.drawImage(this.card, this.x-this.width/2 - xView, this.y-this.height/2 - yView);
			context.restore();			
		}
    
    // add "class" Player to our Game object
		Game.Enemy = Enemy;
    
  })();  

//------------------------------------------------------------------------------   
// wrapper for "class" Map
//------------------------------------------------------------------------------
	(function(){
		function Map(width, height){
			// map dimensions
			this.width = width;
			this.height = height;
			
			// map texture
			this.image = null;
		}
		
		// generate an example of a large map
		Map.prototype.generate = function(player, eArray, path){
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
      
      // set goal
      var goal_rect = new Game.Rectangle(40, 40, 80, 80, "blue");
      rects.unshift(goal_rect);
      
      var colors = ["white","white","darkgreen"];   
			ctx.save();			
			ctx.fillStyle = "black";
			for (var x = 0, i = 0; i < rows; x+=40, i++) {	
				for (var y = 0, j=0; j < columns; y+=40, j++) {
          var color = colors[~~(Math.random() * colors.length)];
					ctx.beginPath();
          // X AND Y ARE FLIPPED; X = VERTICAL, Y = HORIZONTAL !!!
          var rect = new Game.Rectangle(y, x, 40, 40, color); 
          // makes sure wall does not spawn on player's start location
          if (collisionCheck(rect,playerList)) {
            color = rect.color = "white";
          }
          // make sure wall does not spawn on goal tile
          if (rect.within(goal_rect)){
            color = rect.color = "white";
          }
          /*for (var m = 0; m < path.length; m++){
            var currentSquare = path[m];
            if (rect.within(currentSquare)){
              color = rect.color = "white";
            }
          }*/
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
      }
      
      // draw goal
      ctx.fillStyle = "blue";
      ctx.fillRect(40, 40, 80, 80);      
      ctx.restore();	
			
			// store the generate map as this image texture
			this.image = new Image();
			this.image.src = ctx.canvas.toDataURL("image/png");					
			
			// clear context
			ctx = null;
		}
		
    // regenerate maze
    Map.prototype.regen = function(player,enemy,path) {
      // all black and white rectangles:
      combinedRects = rects.concat(whiteRects);
      var goal_rect = new Game.Rectangle(40, 40, 40, 40, "blue");
    
      // makes maze always solvable from any location from player
      path = aStarPath(player,goal_rect);
      rects = [];
      whiteRects = [];
      combinedRects = [];
			this.generate(player,enemy,path) // rebuild the map;
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
		
		// add "class" Map to our Game object
		Game.Map = Map;
		
	})();

//------------------------------------------------------------------------------   
// Game Script wrapper
//------------------------------------------------------------------------------ 
	(function(){
		// prepaire our game canvas
		var canvas = document.getElementById("gameCanvas");
		var context = canvas.getContext("2d");

		// game settings:	
		var FPS = 30;
		var INTERVAL = 1000/FPS; // milliseconds
		var STEP = INTERVAL/1000 // seconds
		
		// setup an object that represents the room
		var room = {
			width: 3000,
			height: 3000,
			map: new Game.Map(3000, 3000)
		};
		
    // setup player in the middle of the maze
    var player = new Game.Player(room.width/2, room.height/2);
   
    // setup enemies
    var enemyNum = 200;
    var enemyArray = [];
    for (var i = 0; i < enemyNum; i++){
      var randomCard = cards[~~(Math.random() * cards.length)];
      enemyArray[i] = new Game.Enemy(~~((Math.random() * 2950) + 1), ~~((Math.random() * 2950) + 1), randomCard);
    }
    
    // delcare path
    var path = []
    // generate a large image texture for the room
		room.map.generate(player, enemyArray, path);
    
    // regenerate with greedy path
		room.map.regen(player, enemyArray, path);
    
		// setup the magic camera !!!
		var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);		
		camera.follow(player, canvas.width/2, canvas.height/2);
    
		// Game update function
		var update = function(){
      if (seconds == 0){ 
        seconds = 30;
        lose = false;
        win = false;
      }
      player.update(STEP, room.width, room.height, enemyArray);
      for (var i = 0; i < enemyArray.length; i++){
        var en = enemyArray[i];
        en.update(player, room.width, room.height);
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
			context.fillText(seconds, 450, 45);
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
				runningId = setInterval(function(){
					gameLoop();
				}, INTERVAL);
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
    
    // pass player to regeneration
    Game.sendPlayer = function(p, e, pa) {
			// if we have no player to send then send the 
      // player from the game script otherwise send p.
      (p == null) ? p = player : p; 
      (e == null) ? e = enemyArray : e;
      (pa == null) ? pa = path : pa;
			//get the player into map regen function
      // rebuild the map;
      room.map.regen(p,e,path); 
		}	
	})();

//------------------------------------------------------------------------------ 	
// configure Game controls:
//------------------------------------------------------------------------------ 

	Game.controls = {
		left: false,
		up: false,
		right: false,
		down: false,
	};

	window.addEventListener("keydown", function(e){
		switch(e.keyCode)
		{
			case 65: // left arrow
				Game.controls.left = true;
				break;
			case 87: // up arrow
				Game.controls.up = true;
				break;
			case 68: // right arrow
				Game.controls.right = true;
				break;
			case 83: // down arrow
				Game.controls.down = true;
				break;
		}
	}, false);

	window.addEventListener("keyup", function(e){
		switch(e.keyCode)
		{
			case 65: // left arrow
				Game.controls.left = false;
				break;
			case 87: // up arrow
				Game.controls.up = false;
				break;
			case 68: // right arrow
				Game.controls.right = false;
				break;
			case 83: // down arrow
				Game.controls.down = false;
				break;
			case 80: // key P pauses the game
				Game.togglePause();
				break;		
		}
	}, false);

//------------------------------------------------------------------------------   
// start the game when page is loaded
//------------------------------------------------------------------------------ 
	window.onload = function(){	
		Game.play();
      setInterval(Game.sendPlayer, 30000);
      setInterval(function() {seconds--;}, 1000);
	}