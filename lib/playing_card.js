//--------------------------------------------------------------------
// Playing Card "class"
//-------------------------------------------------------------------- 

function PlayingCard(x,y,card){
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

PlayingCard.prototype.update = function(step, player, worldWidth, worldHeight){
  
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
PlayingCard.prototype.draw = function(context, xView, yView){   
  context.save();
  //console.log(this.path.length);
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
    // took to long to search
    if(path.length > 40){
      return [];
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
