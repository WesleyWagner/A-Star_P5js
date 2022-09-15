function removeFromArray(arr, elt) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(ini, end) {
  return d = dist(ini.i, ini.j, end.i, end.j);
}

var cols = 10;
var rows = 10;
var grid = new Array(rows);
var ch = 1;
var cv = 2;
var cd = (ch ** 2 + cv ** 2) ** 0.5;

var openSet = [];
var closedSet = [];

var start;
var end;
var corners = false;

var w, h;
var path = [];
var canvaWidth = 500, canvaHeight = 400;

function Cell(i, j) {

  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.value = 0;

  this.neighbors = [];
  this.previous = undefined;

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
      var tempNeighbor = grid[i - 1][j];
      tempNeighbor.g = ch// Atualizar custo de deslocamento
      this.neighbors.push(tempNeighbor);
    }

    if (j - 1 >= 0) {
      var tempNeighbor = grid[i][j - 1];
      tempNeighbor.g = cv// Atualizar custo de deslocamento
      this.neighbors.push(tempNeighbor);
    }

    if (i + 1 < rows) {
      var tempNeighbor = grid[i + 1][j];
      tempNeighbor.g = ch// Atualizar custo de deslocamento
      this.neighbors.push(tempNeighbor);
    }

    if (j + 1 < cols) {
      var tempNeighbor = grid[i][j + 1];
      tempNeighbor.g = cv// Atualizar custo de deslocamento
      this.neighbors.push(tempNeighbor);
    }

    if (corners === true) {
      if (i + 1 < rows && j + 1 < cols) {
        var tempNeighbor = grid[i + 1][j + 1];
        tempNeighbor.g = cd// Atualizar custo de deslocamento
        this.neighbors.push(tempNeighbor);

      }

      if (i + 1 < rows && j - 1 >= 0) {

        var tempNeighbor = grid[i + 1][j - 1];
        tempNeighbor.g = cd// Atualizar custo de deslocamento
        this.neighbors.push(tempNeighbor);
      }

      if (i - 1 >= 0 && j + 1 < cols) {

        var tempNeighbor = grid[i - 1][j + 1];
        tempNeighbor.g = cd// Atualizar custo de deslocamento
        this.neighbors.push(tempNeighbor);
      }

      if (i - 1 >= 0 && j - 1 >= 0) {
        var tempNeighbor = grid[i - 1][j - 1];
        tempNeighbor.g = cd// Atualizar custo de deslocamento
        this.neighbors.push(tempNeighbor);

      }
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
  end = grid[5][5];

  console.log(grid);
  background(222);
  openSet.push(start);
  frameRate(50);
}

function draw() {
  if (openSet.length > 0) {
    // Continuar procurando
    var melhorIndex = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[melhorIndex].f) {
        melhorIndex = i;
      }
    }

    var current = openSet[melhorIndex];

    if (current === end) {
      console.log("FIM");
    }

    removeFromArray(openSet, current);
    closedSet.push(current);

    var neighbors = current.neighbors;

    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      if (!closedSet.includes(neighbor)) {
        var tempG = current.g + 1;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
          }
        } else {
          neighbor.g = tempG;
          openSet.push(neighbor);
        }
        neighbor.h = heuristic(neighbor, end);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.previous = current;
      }
    }

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

  for (var i = 0; i < path.length; i++) {
    path[i].show(color(0, 0, 255));
  }

  path = [];
  var temp = current;
  path.push(temp);
  while (temp.previous == undefined ? false : true) {
    path.push(temp.previous);
    temp = temp.previous;
  }



}
