//--------------------------------------------------------------------  
// Map "class"
//--------------------------------------------------------------------

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
      var rect = new Rectangle(y, x, 40, 40, color);
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
  