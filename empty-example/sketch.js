function removeFromArray(arr, elt) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}


var cols = 3;
var rows = 3;
var grid = new Array(rows);

var openSet = [];
var closedSet = [];

var start;
var end;
var corners = false;

var w, h;
var canvaWidth = 500, canvaHeight = 400;


function Cell(i, j) {

  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;

  this.neighbors = [];

  this.show = function (color) {
    fill(color);
    strokeWeight(1);
    rect(this.j * w, this.i * h, w, h);

    fill(0, 102, 153);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(`C${this.i}${this.j}`, this.j * w, this.i * h, w, h);


  }

  this.addNeighbors = function (grid) {
    var i = this.i;
    var j = this.j;
    if (i - 1 >= 0) {
      this.neighbors.push(grid[i - 1][j]);
    }

    if (j - 1 >= 0) {
      this.neighbors.push(grid[i][j - 1]);
    }

    if (i + 1 < rows) {
      this.neighbors.push(grid[i + 1][j]);
    }

    if (j + 1 < cols) {
      this.neighbors.push(grid[i][j + 1]);
    }

    if (corners === true) {
      if (i + 1 < rows && j + 1 < cols)
        this.neighbors.push(grid[i + 1][j + 1]);

      if (i + 1 < rows && j - 1 >= 0)
        this.neighbors.push(grid[i + 1][j - 1]);

      if (i - 1 >= 0 && j + 1 < cols)
        this.neighbors.push(grid[i - 1][j + 1]);

      if (i - 1 >= 0 && j - 1 >= 0)
        this.neighbors.push(grid[i - 1][j - 1]);
    }
  }
}

function setup() {
  createCanvas(canvaWidth, canvaHeight);

  w = canvaWidth / cols;
  h = canvaHeight / rows;

  for (var i = 0; i < rows; i++) {
    grid[i] = new Array(cols);
  }

  for (var i = 0; i < rows; i++)
    for (var j = 0; j < cols; j++) {
      grid[i][j] = new Cell(i, j);
    }

  for (var i = 0; i < rows; i++)
    for (var j = 0; j < cols; j++) {
      grid[i][j].addNeighbors(grid);
    }

  start = grid[0][0];
  end = grid[rows - 1][cols - 1];

  console.log(grid);
  background(222);
  openSet.push(start);
}

function draw() {
  if (openSet.length > 0) {
    // Continuar procurando
    var winner = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }

    var current = openSet[winner];

    if (current === end) {
      console.log("FIM");
    }

    removeFromArray(openSet, current);

    closedSet.push(current);

  } else {
    // sem solução
  }

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid[i][j].show(color(255));
    }
  }


  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0));
  }

  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 255, 0));
  }


}