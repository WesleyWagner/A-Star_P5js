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
    d = ((end.i - ini.i) ** 2 + (end.j - ini.j) ** 2) * 0.5;//Euler
  } else {
    d = abs(end.i - ini.i) + abs(end.j - ini.j);//Manhattan
  }
  return d;
}

var
  cols,
  rows,
  grid,
  ch,
  cv,
  cd,
  fr = 60;

var
  openSet = [],
  closedSet = [];

var
  start, // Celula Inicial
  end,  // Celula Final
  diagonal = true, // Permitir diagonal
  // manhatan = true, // Metodo de Navegação para calculo Heuristico
  stopLoop = false, // Parar loop de calculo
  initCanvas = false, // Iniciar desenho do Canvas na tela
  resolvido = false, // Flag de resolvido
  boolPathMake = true; // Flag de construção do caminho final

var
  corLivre,
  corInicio,
  corFim,
  corOcupado,
  corVerificar,
  corCaminho,
  corFechado;

var
  arquivo,
  configs,
  matrix = [];

var
  w, // Largura da celula do canvas
  h, // Altura da celula do canvas
  pathCanvas = [], // 
  canvaWidth = 1000,
  canvaHeight = 600;

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

    // fill(0, 102, 153);
    // textSize(10);
    // textAlign(CENTER, CENTER);
    // text(`C${this.i}.${this.j}=${this.value}`, this.j * w, this.i * h, w, h);
  }

  this.addNeighbors = function (grid) {
    var i = this.i;
    var j = this.j;
    var ni = (i >= 1);
    var pi = (i + 1 < rows);
    var nj = (j >= 1);
    var pj = (j + 1 < cols);

    if (ni) {
      var tempNeighbor = grid[i - 1][j];
      if (tempNeighbor.value != 1) {
        this.neighbors.push(tempNeighbor);
      }
    }

    if (nj) {
      var tempNeighbor = grid[i][j - 1];
      if (tempNeighbor.value != 1) {
        this.neighbors.push(tempNeighbor);
      }
    }

    if (pi) {
      var tempNeighbor = grid[i + 1][j];
      if (tempNeighbor.value != 1) {
        this.neighbors.push(tempNeighbor);
      }
    }

    if (pj) {
      var tempNeighbor = grid[i][j + 1];
      if (tempNeighbor.value != 1) {
        this.neighbors.push(tempNeighbor);
      }
    }

    if (diagonal === true) {
      if (pi && pj) {
        var tempNeighbor = grid[i + 1][j + 1];
        if (tempNeighbor.value != 1) {
          this.neighbors.push(tempNeighbor);
        }

      }

      if (pi && nj) {

        var tempNeighbor = grid[i + 1][j - 1];
        if (tempNeighbor.value != 1) {
          this.neighbors.push(tempNeighbor);
        }
      }

      if (ni && pj) {
        var tempNeighbor = grid[i - 1][j + 1];
        if (tempNeighbor.value != 1) {
          this.neighbors.push(tempNeighbor);
        }
      }

      if (ni && nj) {
        var tempNeighbor = grid[i - 1][j - 1];
        if (tempNeighbor.value != 1) {
          this.neighbors.push(tempNeighbor);
        }
      }
    }
  }
}

function custoDeslocamento(pFinal, pInicial) {
  let dx = abs(pFinal.i - pInicial.i);// sem abs(*) o termo dx = {-1,0,1} - com -1 indicando que o ponto final esta antes do inicial, 0 que estão na mesma linha, e 1 quando o ponto final esta a frente do ponto inicial.
  let dy = abs(pFinal.j - pInicial.j);// sem abs(*) o termo dy = {-1,0,1} - com -1 indicando que o ponto final esta antes do inicial, 0 que estão na mesma coluna, e 1 quando o ponto final esta a frente do ponto inicial.

  if (dx > 0 && dy > 0 && diagonal) return cd;// retornar custo de deslocamento horizontal
  if (dy > 0 && dx == 0) return cv;// se mover em y e não em x, retornar custo de movimento vertical
  if (dx > 0 && dy == 0) return ch;// se mover em x e não em y, retornar custo de movimento horizontal
  if (dx == 0 && dy == 0) return 0; // Ponto final e inicial são coincidentes
}

function setup() {
  corLivre = color('#EEE');//ok
  corInicio = color('#FF9F1C');//ok
  corFim = color('#C2D076');//ok
  corOcupado = color('#160F29');//ok
  corVerificar = color('#98A886');//ok
  corCaminho = color('#698DFB');
  corFechado = color('#C95D63');//ok
  createCanvas(canvaWidth, canvaHeight);
  frameRate(fr);
  background(222);
}

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
      console.log("PONTO DE CHEGADA ALCANÇADO");
      stopLoop = true;
      resolvido = true;
    }

    if (!stopLoop) {
      removeFromArray(openSet, current);
      closedSet.push(current);

      var neighbors = current.neighbors;

      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        var tempH = heuristic(neighbor,end);
        var tempF = tempG + tempH;
        if (!closedSet.includes(neighbor)) {
          var tempG = current.g + custoDeslocamento(neighbor, current);
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              let indexNeighbor = openSet.indexOf(neighbor);
              openSet[indexNeighbor].g = tempG;
              // openSet[indexNeighbor].f = tempF;
              // openSet[indexNeighbor].h = tempH;
            }
          } else {// Nó novo
             
            neighbor.h = heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.g = tempG;
             
            neighbor.previous = current;
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

  for (var i = 0; i < pathCanvas.length; i++) {
    try {
      pathCanvas[i].show(corCaminho);
    } catch { };

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



  pathCanvas = [];
  var temp = current;
  pathCanvas.push(temp);
  try {
    while (temp.previous != null) {
      pathCanvas.push(temp.previous);
      temp = temp.previous;
    }
  } catch { };

  if (boolPathMake && resolvido) {
    let lengthPath = pathCanvas.length; // Reverter ordem para iniciar do nó de partida para o nó de chegada
    let arrayPath = [];
    for (var it = 0; it < lengthPath; it++) {
      arrayPath.push(`C${pathCanvas[lengthPath - it - 1].i}.${pathCanvas[lengthPath - it - 1].j}`);
    }
    console.log(arrayPath.join("=>"));
    boolPathMake = false;
  }
}
