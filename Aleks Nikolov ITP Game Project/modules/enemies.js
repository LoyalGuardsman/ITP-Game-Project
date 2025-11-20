// constructor functions to create enemies
(function (global) {

  // horizontal patroller
  // moves between x1 and x2
  function EnemyH(x1, x2, y, speed, size) {
    this.x1 = x1;
    this.x2 = x2;
    this.y = y;
    this.x = x1;
    this.dir = 1;
    this.speed = speed || 1.5;
    this.size  = size  || 28;

    this.update = function () {
      this.x += this.dir * this.speed;
      // reverses direction when reaching boundaries
      if (this.x > this.x2) { this.x = this.x2; this.dir = -1; }
      if (this.x < this.x1) { this.x = this.x1; this.dir =  1; }
    };

    this.draw = function (scrollPos) {
        this.update();
        push();
        translate(scrollPos, 0);
        noStroke();
        fill(200, 60, 60);              // red
        ellipse(this.x, this.y - this.size/2, this.size, this.size);
        pop();
    };

    // collision check between enemy and player
    this.checkContact = function (worldX, charY, tol) {
      tol = tol || 16;
      return Math.abs(worldX - this.x) < (this.size/2 + tol) &&
             Math.abs(charY  - this.y) < (this.size/2 + tol);
    };
  }

  // vertical patroller
  // moves up and down between y1 and y2
  function EnemyV(x, y1, y2, speed, size) {
    this.x = x;
    this.y1 = y1;
    this.y2 = y2;
    this.y = y1;
    this.dir = 1;
    this.speed = speed || 1.5;
    this.size  = size  || 28;

    this.update = function () {
      this.y += this.dir * this.speed;
      // reverses direction when reaching boundaries
      if (this.y > this.y2) { this.y = this.y2; this.dir = -1; }
      if (this.y < this.y1) { this.y = this.y1; this.dir =  1; }
    };

    this.draw = function (scrollPos) {
      this.update();
      push();
      translate(scrollPos, 0);
      noStroke();
      fill(60, 60, 200);              // blue
      rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
      pop();
    };

    // collision check between enemy and player
    this.checkContact = function (worldX, charY, tol) {
      tol = tol || 16;
      return Math.abs(worldX - this.x) < (this.size/2 + tol) &&
             Math.abs(charY  - this.y) < (this.size/2 + tol);
    };
  }

  // expose constructors globally
  global.EnemyH = EnemyH;
  global.EnemyV = EnemyV;
})(window);