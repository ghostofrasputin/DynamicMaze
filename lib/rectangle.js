//--------------------------------------------------------------------    
// Rectangle "class"
//--------------------------------------------------------------------

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
