//--------------------------------------------------------------------    
// Animation "class"
//--------------------------------------------------------------------

function Animation(img,w){
  this.image = img;
  this.sprite_width = w;
  this.sprite_height = this.image.height;
  this.numberOfFrames = this.image.width/this.sprite_width;
  this.x_frames = this.load_tiles(img,w);
  this.count = 0;
  this.index = 0;
}

Animation.prototype.draw = function(step, context, x, y, w, h, xView, yView){  
  
  this.count += step;
  if(this.count >= step*15){
    this.index++;
    if(this.index == this.x_frames.length){
      this.index = 0;
    }
    this.count = 0;
  }
  var x_offset = this.x_frames[this.index];
  
  context.save();
	context.drawImage(
    this.image,
    x_offset,
    0,
    this.sprite_width,
    this.sprite_height,
    x - w/2 - xView,
    y - h/2 - yView,
    this.sprite_width,
    this.sprite_height
  );
  context.restore(); 
}

Animation.prototype.load_tiles = function() {
  var tiles = [];
  var x = 0
  for(var i=0; i<this.numberOfFrames; i++){
    tiles.push(x);
    x += this.sprite_width;    
  }
  return tiles;
}

