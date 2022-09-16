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

var cols;
var rows;
var grid;
var ch;
var cv;
var cd;
var fr = 10;

var openSet = [];
var closedSet = [];

var start;
var end;
var diagonal = false;
var manhatan = true;
let stopLoop = false;
var initCanvas = false;
var resolvido = false;
var pathResolvido;

var
  corLivre,
  corInicio,
  corFim,
  corOcupado,
  corVerificar,
  corCaminho,
  corFechado;

var arquivo;
var configs;
var matrix = [];

var w, h;
var path = [];
var canvaWidth = 1000, canvaHeight = 600;

function Cell(i, j) {

  this.i = i;
  this.j = j;
  this.f = Infinity;
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
    textSize(10);
    textAlign(CENTER, CENTER);
    text(`C${this.i}${this.j}:${this.value}`, this.j * w, this.i * h, w, h);
  }

  this.addNeighbors = function (grid) {
    var i = this.i;
    var j = this.j;
    if (i - 1 >= 0) {
      var tempNeighbor = grid[i - 1][j];
      if (tempNeighbor.value != 1) {
        // tempNeighbor.g = ch// Atualizar custo de deslocamento
        this.neighbors.push(tempNeighbor);
      }
    }

    if (j - 1 >= 0) {
      var tempNeighbor = grid[i][j - 1];
      if (tempNeighbor.value != 1) {
        // tempNeighbor.g = cv// Atualizar custo de deslocamento
        this.neighbors.push(tempNeighbor);
      }
    }

    if (i + 1 < rows) {
      var tempNeighbor = grid[i + 1][j];
      if (tempNeighbor.value != 1) {
        // tempNeighbor.g = ch// Atualizar custo de deslocamento
        this.neighbors.push(tempNeighbor);
      }
    }

    if (j + 1 < cols) {
      var tempNeighbor = grid[i][j + 1];
      if (tempNeighbor.value != 1) {
        // tempNeighbor.g = cv// Atualizar custo de deslocamento
        this.neighbors.push(tempNeighbor);
      }
    }

    if (diagonal === true) {
      if (i + 1 < rows && j + 1 < cols) {
        var tempNeighbor = grid[i + 1][j + 1];
        if (tempNeighbor.value != 1) {
          // tempNeighbor.g = cd// Atualizar custo de deslocamento
          this.neighbors.push(tempNeighbor);
        }

      }

      if (i + 1 < rows && j - 1 >= 0) {

        var tempNeighbor = grid[i + 1][j - 1];
        if (tempNeighbor.value != 1) {
          // tempNeighbor.g = cd// Atualizar custo de deslocamento
          this.neighbors.push(tempNeighbor);
        }
      }

      if (i - 1 >= 0 && j + 1 < cols) {

        var tempNeighbor = grid[i - 1][j + 1];
        if (tempNeighbor.value != 1) {
          // tempNeighbor.g = cd// Atualizar custo de deslocamento
          this.neighbors.push(tempNeighbor);
        }
      }

      if (i - 1 >= 0 && j - 1 >= 0) {
        var tempNeighbor = grid[i - 1][j - 1];
        if (tempNeighbor.value != 1) {
          // tempNeighbor.g = cd// Atualizar custo de deslocamento
          this.neighbors.push(tempNeighbor);
        }
      }
    }
  }
}

function custoDeslocamento(pFinal, pInicial) {
  let dx = abs(pFinal.i - pInicial.i);
  let dy = abs(pFinal.j - pInicial.j);


  if (dx > 0 && dy > 0 && diagonal) return cd;
  if (dy > 0 && dx == 0) return cv;
  if (dx > 0 && dy == 0) return ch;
  if (dx == 0 && dy == 0) return 0; // Ponto final e inicial sao coincidentes
}

function setup() {

  corLivre = color('#EEE');//ok
  corInicio = color('#496DDB');//ok
  corFim = color('#C2D076');//ok
  corOcupado = color('#160F29');//ok
  corVerificar = color('#98A886');//ok
  corCaminho = color('#597DEB');
  corFechado = color('#C95D63');//ok
  createCanvas(canvaWidth, canvaHeight);
  frameRate(fr);
  background(222);
  // loadAll();
}

// function loadAll() {
//   initCanvas = true;
//   cols = configs.ncols;
//   rows = 10;
//   grid = new Array(rows);
//   cv = 1;
//   ch = 2;
//   cd = (cv ** 2 + ch ** 2) ** 0.5;

//   w = canvaWidth / cols;
//   h = canvaHeight / rows;

//   for (var i = 0; i < rows; i++) {
//     grid[i] = new Array(cols);
//   }

//   for (var i = 0; i < rows; i++)
//     for (var j = 0; j < cols; j++) {
//       grid[i][j] = new Cell(i, j);
//     }

//   for (var i = 0; i < rows; i++)
//     for (var j = 0; j < cols; j++) {
//       grid[i][j].addNeighbors(grid);
//     }

//   start = grid[0][0];
//   end = grid[5][5];

//   console.log(grid);

//   openSet.push(start);
// }

function draw() {

  if (!initCanvas) {
    return;
  }

  if (openSet.length > 0) {
    // Continuar procurando
    var melhorIndex = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[melhorIndex].f) {
        melhorIndex = i;
      }
    }

    var current = openSet[melhorIndex];

    if (current.value == 3) {
      console.log("FIM");
      stopLoop = true;
      resolvido = true;
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
              let indexNeighbor = openSet.indexOf(neighbor);
              openSet[indexNeighbor].g = tempG;
              // neighbor.g = tempG;
            }
          } else {
            neighbor.h = heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
            neighbor.g = tempG;
            openSet.push(neighbor);
          }
          
        }
      }
    }
  } else {
    console.log("SEM SOLUÇÃO");
    stopLoop = true;
  }
  
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      if (grid[i][j].value == 0) {
        grid[i][j].show(corLivre);
      }
      if (grid[i][j].value == 1) {
        grid[i][j].show(corOcupado);
      }
      if (grid[i][j].value == 2) {
        grid[i][j].show(corInicio);
      }
      if (grid[i][j].value == 3) {
        grid[i][j].show(corFim);
      }
    }
  }
  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(corFechado);
  }

  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(corVerificar);
  }

  for (var i = 0; i < path.length; i++) {
    try{
      path[i].show(corCaminho);
    }catch{};
    
  }

  for (var i = 0; i < rows; i++) 
    for (var j = 0; j < cols; j++) {
      if (grid[i][j].value == 2) {
        grid[i][j].show(corInicio);
      }
      if (grid[i][j].value == 3) {
        grid[i][j].show(corFim);
      }
    }

  
  
  path = [];
  var temp = current;
  path.push(temp);
  try{
    while (temp.previous!=null?true:false) {
      path.push(temp.previous);
      temp = temp.previous;
    }
  }catch{
    console.log("null catch");
  };
  if(resolvido){
    let reversePath = (path.reverse());
    // console.log(pathResolvido);
    resolvido = false;
  }
}
