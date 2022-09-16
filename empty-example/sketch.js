// document.getElementById('inputfile').addEventListener('change', readTXT);

function removeFromArray(arr, elt) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}


function heuristic(ini, end, euler = true) {
  let d;
  if (euler) {
    d = dist(ini.i, ini.j, end.i, end.j);//Euler
  } else {
    d = abs(end.i - ini.i) + abs(end.j - ini.j);//Manhatan
  }

  return d;
}

var cols = 10;
var rows = 10;
var grid = new Array(rows);
var ch;
var cv;
var cd;

var openSet = [];
var closedSet = [];

var start;
var end;
var diagonal = !true;
var manhatan = true;
let stopLoop = false;
var initCanvas = false;

var arquivo;
var configs;
var matrix = [];

var w, h;
var path = [];
var canvaWidth = 800, canvaHeight = 600;

function Cell(i, j) {

  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = Infinity;
  this.h = Infinity;
  this.value = 0;

  this.neighbors = [];
  this.previous = null;

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

    if (diagonal === true) {
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

function custoDeslocamento(pFinal, pInicial) {
  let dx = abs(pFinal.i - pInicial.i);
  let dy = abs(pFinal.j - pInicial.j);


  if (dx && dy && diagonal) return cd;
  if (dy) return cv;
  if (dx) return ch;
}

function setup() {
  createCanvas(canvaWidth, canvaHeight);
  frameRate(50);
  background(222);
  loadAll();
}

function loadAll() {
  initCanvas = true;

  cols = 10;
  rows = 10;
  cv = 1;
  ch = 2;
  cd = (cv ** 2 + ch ** 2) ** 0.5;

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

  openSet.push(start);
}

function draw() {

  // if (!initCanvas) {
  //   return;
  // }

  if (openSet.length > 0) {
    // Continuar procurando
    var melhorIndex = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[melhorIndex].f) {
        melhorIndex = i;
      }
    }

    var current = openSet[melhorIndex];

    if (current.i === end.i && current.j === end.j) {
      console.log("FIM");
      stopLoop = true;
    }

    if (!stopLoop) {
      removeFromArray(openSet, current);
      closedSet.push(current);

      var neighbors = current.neighbors;

      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        if (!closedSet.includes(neighbor)) {
          var tempG = current.g + custoDeslocamento(neighbor, current);
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
    }



  } else {
    console.log("SEM SOLUÇÃO");
    stopLoop = true;
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
