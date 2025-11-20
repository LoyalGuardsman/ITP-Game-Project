// factory function to create a platform object
function createPlatform(x, y, length) {
  return {
    x: x, y: y, length: length,

    // draw the platform
    draw: function (scrollPos) {
      push();
      translate(scrollPos, 0);
      noStroke();
      fill(120); rect(this.x, this.y, this.length, 10);
      fill(90);  rect(this.x, this.y - 6, this.length, 6);
      pop();
    },

    // check if the character is standing on the platform
    checkContact: function (charWorldX, charY, tolerance) {
      tolerance = tolerance || 5;
      var withinX = charWorldX > this.x && charWorldX < this.x + this.length;
      var onTop = Math.abs(charY - this.y) <= tolerance;
      return withinX && onTop;
    }
  };
}