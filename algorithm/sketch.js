function removeFromArray(arr, elt) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(ini, end, method) {
  let d = 0;
  // console.log(method);
  if (method == 'euclidian') {
    d = ((end.i - ini.i) ** 2 + (end.j - ini.j) ** 2) ** 0.5;//Euler
    // console.log('euler');
  } else {
    d = abs(end.i - ini.i) + abs(end.j - ini.j);//Manhattan
    // console.log('manhattan');
  }
  return d;
}

function handleChangeHeuristic(value) {
  // console.log(value);
  method = value;
  // console.log(method);
}

var
  cols,
  rows,
  grid,
  ch,
  cv,
  cd,
  frame = 1;

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
  solve = false,
  statistics = false,
  updateCanvas = true,
  method = 'euclidian',
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

class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.f = Infinity;
    this.g = Infinity;
    this.h = Infinity;
    this.value = 0;

    this.neighbors = [];
    this.previous = null;

    this.show = function (color) {
      leftBuffer.fill(color);
      leftBuffer.strokeWeight(1);
      leftBuffer.rect(this.j * w * rateResize, this.i * h * rateResize, w * rateResize, h * rateResize);
      if (statistics) {
        fill(0, 102, 153);
        textSize(10);
        textAlign(CENTER, TOP);
        text(`C${this.i}.${this.j}\nf: ${getNumber(this.f)}\ng: ${getNumber(this.g)}\nh: ${getNumber(this.h)}`, this.j * w, this.i * h, w, h);
      }
    };

    this.addNeighbors = function (grid) {
      var i = this.i;
      var j = this.j;
      var ni = (i >= 1);
      var pi = ((i + 1) < rows);
      var nj = (j >= 1);
      var pj = ((j + 1) < cols);

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
}

function getNumber(number) {
  if (typeof number === 'number' && number !== Infinity) {
    return number.toFixed(2);
  }
  return '';
};

class Legenda {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.show = function () {
      rightBuffer.color(this.color);
      rightBuffer.fill(this.color);
      rightBuffer.strokeWeight(0);
      rightBuffer.rect(this.x * rateResize, this.y * rateResize, 160 * rateResize, 30 * rateResize);

      rightBuffer.fill("#FAFAFA");
      rightBuffer.textAlign(CENTER);
      rightBuffer.textSize(18);
      rightBuffer.text(this.text, (this.x + 80) * rateResize, (this.y + 20) * rateResize);
    }
  }
}

function custoDeslocamento(pFinal, pInicial) {
  let dx = abs(pFinal.j - pInicial.j);// sem abs(*) o termo dx = {-1,0,1} - com -1 indicando que o ponto final esta antes do inicial, 0 que estão na mesma linha, e 1 quando o ponto final esta a frente do ponto inicial.
  let dy = abs(pFinal.i - pInicial.i);// sem abs(*) o termo dy = {-1,0,1} - com -1 indicando que o ponto final esta antes do inicial, 0 que estão na mesma coluna, e 1 quando o ponto final esta a frente do ponto inicial.

  if (dx > 0 && dy > 0 && diagonal) return cd;// retornar custo de deslocamento horizontal
  if (dy > 0 && dx == 0) return cv;// se mover em y e não em x, retornar custo de movimento vertical
  if (dx > 0 && dy == 0) return ch;// se mover em x e não em y, retornar custo de movimento horizontal
  if (dx == 0 && dy == 0) return 0; // Ponto final e inicial são coincidentes
}
var canvas;
var leftBuffer;
var rightBuffer;

var
  w, // Largura da celula do canvas
  h, // Altura da celula do canvas
  pathCanvas = [], // 
  // xCanvas = 210,
  // yCanvas = 80,
  canvaWidth = 900,
  canvaAux = 200,
  canvaHeight = 400;

function drawLeftBuffer() {
  // leftBuffer.background(0, 255, 0);
  // leftBuffer.fill(255, 255, 255);
  // leftBuffer.textSize(32);
  // leftBuffer.text("This is the left buffer!", 50, 50);
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
}

function drawRightBuffer() {
  // corLivre = color('#EEE');//ok

  let legendaOcupado = new Legenda(10, 10, "OBSTACULO", '#160F29');
  // let legendaOcupado = new Legenda(10,10,"OBSTACULO",'hsl(0, 100%, 50%)');
  let legendaInicio = new Legenda(10, 50, "INICIO", '#FF9F1C');
  let legendaFinal = new Legenda(10, 90, "FINAL", '#C2D076');
  let legendaVerificando = new Legenda(10, 130, "ABERTO", '#98A886');
  let legendaFechado = new Legenda(10, 170, "FECHADO", '#C95D63');
  let legendaCaminho = new Legenda(10, 210, "CAMINHO", '#698DFB');

  legendaOcupado.show();
  legendaInicio.show();
  legendaFinal.show();
  legendaVerificando.show();
  legendaFechado.show();
  legendaCaminho.show();
}

function setup() {
  corLivre = color('#EEE');//ok
  corInicio = color('#FF9F1C');//ok
  corFim = color('#C2D076');//ok
  corOcupado = color('#160F29');//ok
  corVerificar = color('#98A886');//ok
  corCaminho = color('#698DFB');
  corFechado = color('#C95D63');//ok
  // windowResized();
  canvas = createCanvas((canvaWidth + canvaAux) * rateResize, canvaHeight * rateResize);
  canvas.parent('container');
  leftBuffer = createGraphics(canvaWidth * rateResize, canvaHeight * rateResize);
  rightBuffer = createGraphics(canvaAux * rateResize, canvaHeight * rateResize);

  // 800 x 400 (double width to make room for each "sub-canvas")
  //    createCanvas(800, 400);
  // Create both of your off-screen graphics buffers

  frameRate(frame);
  canvas.background('#EEE');
  // canvas.position(xCanvas,yCanvas);
}

function changeFPS(value) {
  // console.log(`TIPO ${typeof value}: VALOR: ${value}`);
  let defaultValue = 10;
  let frameBox = document.getElementById('frameRateBox');
  let frameBoxValue = parseInt(frameBox.value);
  if (value == '-') {
    frameBoxValue -= 1;
  }

  if (value == '+') {
    frameBoxValue += 1;
  }

  if (typeof frameBoxValue == 'number') {
    const MIN = 0;
    const MAX = 200;
    let boundedValue = Math.min(Math.max(frameBoxValue, MIN), MAX);
    frameBox.value = boundedValue;
    frameRate(boundedValue);
  } else {
    frameRate(defaultValue);//Default 
    frameBox.value = defaultValue;
  }
}

function handleValueConfigs(elemento) {
  let lastCH = ch, lastCV = cv, lastCD = cd;
  let arrayParse = elemento.split(':');
  let checkCX;
  if (arrayParse[0] == 'CD') {
    let valueTextBox = parseFloat(arrayParse[1]); // Armazenar valor recebido do box de texto
    // console.log(`CD valor ${valueTextBox}`);
    if (typeof valueTextBox == 'number' && !Object.is(valueTextBox, NaN)) { // Verificar se o valor recebido é um numero
      checkCX = document.getElementById('checkCD'); // Selecionar checkbox correspondente
      // console.log(`Atualizado `);
      if (checkCX.checked) { // Se estiver habilitado altere para o valor indicado
        const MIN = 0;
        const MAX = 50;
        let boundedValue = Math.min(Math.max(valueTextBox, MIN), MAX); // Ajustar valor recebido para estar dentro do intervalo
        cd = boundedValue;
      }
    } else {
      cd = 1;
    }
  };

  if (arrayParse[0] == 'CV') {
    let valueTextBox = parseFloat(arrayParse[1]); // Armazenar valor recebido do box de texto
    if (typeof valueTextBox == 'number' && !Object.is(valueTextBox, NaN)) { // Verificar se o valor recebido é um numero
      checkCX = document.getElementById('checkCV'); // Selecionar checkbox correspondente
      if (checkCX.checked) { // Se estiver habilitado altere para o valor indicado
        const MIN = 0;
        const MAX = 50;
        let boundedValue = Math.min(Math.max(valueTextBox, MIN), MAX); // Ajustar valor recebido para estar dentro do intervalo
        cv = boundedValue;
      }
    } else {
      cv = 1;
    }
  };

  if (arrayParse[0] == 'CH') {
    let valueTextBox = parseFloat(arrayParse[1]); // Armazenar valor recebido do box de texto
    if (typeof valueTextBox == 'number' && !Object.is(valueTextBox, NaN)) { // Verificar se o valor recebido é um numero
      checkCX = document.getElementById('checkCH'); // Selecionar checkbox correspondente
      if (checkCX.checked) { // Se estiver habilitado altere para o valor indicado
        const MIN = 0;
        const MAX = 50;
        let boundedValue = Math.min(Math.max(valueTextBox, MIN), MAX); // Ajustar valor recebido para estar dentro do intervalo
        ch = boundedValue;
      }
    } else {
      ch = 1;
    }
  }
  let infoCustosEl = document.getElementById('infoCustos');
  infoCustosEl.textContent = `Custo de deslocamento vertical: ${cv} | Custo de deslocamento horizontal: ${ch} | Custo de deslocamento diagonal: ${cd.toFixed(3)}`;
  updateValueBox();
}

function handleChangeConfigs(elemento) {
  let textBox = document.getElementById(`${elemento.name}Value`);
  // console.log(textBox.value);
  textBox.disabled = !elemento.checked;
  try {
    if (!elemento.checked) {
      if (elemento.name == 'checkCH') {
        // console.log("RESET CH");
        ch = parseFloat(configs.weightX);
      }
      if (elemento.name == 'checkCV') {
        cv = parseFloat(configs.weightY);
      }
      if (elemento.name == 'checkCD') {
        cd = parseFloat(configs.cd);
      }
      let infoCustosEl = document.getElementById('infoCustos');
      infoCustosEl.textContent = `Custo de deslocamento vertical: ${cv} | Custo de deslocamento horizontal: ${ch} | Custo de deslocamento diagonal: ${cd.toFixed(3)}`;
    }
  } catch { };
}

function draw() {
  canvas.background('#EEE');

  image(leftBuffer, 0, 0);
  image(rightBuffer, canvaWidth, 0);
  if (!initCanvas) {
    return;
  }

  if (updateCanvas) {
    drawLeftBuffer();
    drawRightBuffer();
  }

  if (solve) {
    if (openSet.length > 0) {
      // console.log("CONTROLE'\n'");
      // console.log(grid[0][0]);
      // Continuar procurando
      var melhorIndex = 0;
      for (var i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[melhorIndex].f) {
          melhorIndex = i;
        }
      }

      var current = openSet[melhorIndex];

      if (current.value == 3) {
        // console.log("PONTO DE CHEGADA ALCANÇADO");
        stopLoop = true;
        resolvido = true;
        // solve =false;
      }

      if (!stopLoop) {
        removeFromArray(openSet, current);
        closedSet.push(current);

        var neighbors = current.neighbors; // Vizinhos do nó atual

        for (var i = 0; i < neighbors.length; i++) {
          var neighbor = neighbors[i];

          if (!openSet.includes(neighbor) && !closedSet.includes(neighbor)) {//No descoberto

            var tempH = heuristic(neighbor, end, method);
            var tempG = current.g + custoDeslocamento(neighbor, current);
            neighbor.h = tempH;
            neighbor.g = tempG;
            // console.log(`CURRENT ${i} G: ${current.g}`);
            // console.log(`CUSTO ${i} G: ${custoDeslocamento(neighbor, current)}`);
            // console.log(`TYPEOF CUSTO ${i} G: ${typeof custoDeslocamento(neighbor, current)}`);
            neighbor.f = tempG + tempH;
            // console.log(`VALOR ${i} F: ${tempF}`);
            // console.log(`VIZINHO ${i} F: ${neighbor.f}`);
            neighbor.previous = current;
            openSet.push(neighbor);
            // console.log(`VIZINHO NOVO: C ${neighbor.i}.${neighbor.j}\nh: ${neighbor.h}\ng: ${neighbor.g}\nf: ${neighbor.f}`);
          };
          if (openSet.includes(neighbor) && !closedSet.includes(neighbor)) {//No redescoberto
            var tempG = current.g + custoDeslocamento(neighbor, current);
            var tempH = heuristic(neighbor, end, method);
            var tempF = tempG + tempH;
            var indexRedescoberto = openSet.indexOf(neighbor);
            var gAtual = openSet[indexRedescoberto].g;
            var fAtual = openSet[indexRedescoberto].f;
            if (tempG < gAtual) {
              // console.log("ATUALIZANDO NÓ");
              openSet[indexRedescoberto].h = tempH;
              openSet[indexRedescoberto].g = tempG;
              openSet[indexRedescoberto].f = tempF;
              openSet[indexRedescoberto].previous = current;
            }
          };
        }
      }
    } else {
      console.log("SEM SOLUÇÃO");
      stopLoop = true;
      let outputPath = document.getElementById("resultadoText");
      outputPath.innerText = "SEM SOLUÇÃO";
      // solve =false;
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
    let outputPath = document.getElementById("outputPath");
    txtToDownload = arrayPath.join(" => ");
    outputPath.innerText = txtToDownload;
    // console.log(arrayPath.join("=>"));
    boolPathMake = false;
  }
}

var txtToDownload;

function handleCopyTextFromParagraph() {
  const body = document.querySelector('body');
  const paragraph = document.getElementById('outputPath');
  const area = document.createElement('textarea');
  body.appendChild(area);

  area.value = paragraph.innerText;
  area.select();
  document.execCommand('copy');
  body.removeChild(area);
  const botao = document.getElementById('btn-copy');
  if (area.value != '') botao.innerText = "Copiado";
}

function handleCheckboxDiagonal() {
  const buttonDiagonal = document.getElementById('diagonalCheck');
  // console.log(buttonDiagonal.checked);
  diagonal = buttonDiagonal.checked;
}

function handleSolve() {
  let checkCDValue = document.getElementById('checkCDValue');
  let checkCVValue = document.getElementById('checkCVValue');
  let checkCHValue = document.getElementById('checkCHValue');
  let provCD = null;
  let provCV = null;
  let provCH = null;
  if (!checkCDValue.disabled) {
    // provCD = handleValueConfigs(`CD:${checkCDValue.value}`);
    provCD = checkCDValue.value;
    // console.log(`Salvando cd ${provCD}`);
  }
  if (!checkCVValue.disabled) {
    provCV = checkCVValue.value;
    // console.log(`Salvando cv ${provCV}`);
  }
  if (!checkCHValue.disabled) {
    provCH = checkCHValue.value;
    // console.log(`Salvando ch ${provCH}`);
  }
  handleReset();
  solve = true;
  if (provCD != null) {
    handleValueConfigs(`CD:${provCD}`);

    let infoCustosEl = document.getElementById('infoCustos');
    infoCustosEl.textContent = `Custo de deslocamento vertical: ${cv} | Custo de deslocamento horizontal: ${ch} | Custo de deslocamento diagonal: ${cd.toFixed(3)}`;
    updateValueBox();
  }
  if (provCV != null) {
    handleValueConfigs(`CV:${provCV}`);
    let infoCustosEl = document.getElementById('infoCustos');
    infoCustosEl.textContent = `Custo de deslocamento vertical: ${cv} | Custo de deslocamento horizontal: ${ch} | Custo de deslocamento diagonal: ${cd.toFixed(3)}`;
    updateValueBox();

  }
  if (provCH != null) {
    handleValueConfigs(`CH:${provCH}`);
    let infoCustosEl = document.getElementById('infoCustos');
    infoCustosEl.textContent = `Custo de deslocamento vertical: ${cv} | Custo de deslocamento horizontal: ${ch} | Custo de deslocamento diagonal: ${cd.toFixed(3)}`;
    updateValueBox();
  }
}

function updateValueBox() {
  let checkCX = document.getElementById('checkCVValue'); // Selecionar checkbox correspondente
  checkCX.value = cv.toFixed(2);

  checkCX = document.getElementById('checkCHValue'); // Selecionar checkbox correspondente
  checkCX.value = ch.toFixed(2);

  checkCX = document.getElementById('checkCDValue'); // Selecionar checkbox correspondente
  checkCX.value = cd.toFixed(2);
}

var rateResize = 1;

// function windowResized() {
//   let canvaWidthTot = canvaWidth+canvaAux+200;
//     let width_percent = windowWidth / canvaWidthTot;
//     let height_percent = windowHeight / canvaHeight;
//     if ((width_percent < 1) || (height_percent < 1)) {
//         if (width_percent <= height_percent) {
//             resizeCanvas(canvaWidthTot*rateResize, width_percent * canvaHeight);
//             rateResize = width_percent;
//         } else {
//             resizeCanvas(height_percent * canvaWidthTot, canvaHeight);
//             rateResize = height_percent;
//         }
//     } else {
//         rateResize = 1;
//         resizeCanvas(canvaWidthTot, canvaHeight);
//     }
// }

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

var outputPayload = '';

function novo(linhas, colunas, custoV, custoH, bloqueios, inicio, fim) {
  let
    nrow = parseInt(linhas),
    ncol = parseInt(colunas),
    ncv = parseInt(custoV),
    nch = parseInt(custoH),
    nblocks = parseInt(bloqueios),
    nstart = { i: inicio.i, j: inicio.j },
    nend = { i: fim.i, j: fim.j };

     
    nstart.i = Math.min(Math.max(nstart.i, 0), nrow-1); // Ajustar valor recebido para estar dentro do intervalo
    

  console.log(`Linhas:${nrow}|Colunas:${ncol}|CustoV:${ncv}|CustoH:${nch}|Blocks:${nblocks}|Start i:${nstart.i}|Start j:${nstart.j}|End i:${nend.i}|End j:${nend.j}`);
  // console.log(`Ponto Inicial:${nstart}`);
  let newGrid = new Array(nrow); //Criar linhas
  console.log("Criado newGrid");
  // w = canvaWidth / ncol;
  // h = canvaHeight / nrow;

  for (var i = 0; i < nrow; i++) {
    newGrid[i] = new Array(ncol); //Criar colunas
  }

  for (var i = 0; i < nrow; i++)
    for (var j = 0; j < ncol; j++) {
      newGrid[i][j] = new Cell(i, j);
    }

  for (var i = 0; i < nrow; i++) // Zerar newGrid
    for (var j = 0; j < ncol; j++) {
      newGrid[i][j].value = 0;
    }
  console.log("Matriz Completa");

  try {
    newGrid[nstart.i][nstart.j].value = 2;//Indicar posição inicial
    newGrid[nend.i][nend.j].value = 3;//Indicar posição final
  } catch {
    console.log(`ERRO AO INICIAR VALORES INICIAIS - ATRIBUINDO POSICAO 0,0 - ${nrow - 1},${ncol - 1}`);
    newGrid[0][0].value = 2;//Indicar posição inicial
    newGrid[nrow-1][ncol-1].value = 3;//Indicar posição final
  }


  let shuffleArray = [];
  for (var i = 0; i < nrow; i++)
    for (var j = 0; j < ncol; j++) {
      if (newGrid[i][j].value == 0) {
        shuffleArray.push(newGrid[i][j]);//Guardar posição livre
      }
    }
  // let contadorBlocks = 0;
  // console.log("ANTERS");
  for (var contBlocks = 0; contBlocks < nblocks; contBlocks++) {

    let indexRandomElement = getRandomInt(shuffleArray.length - 1);//sortear uma posição dentro do array com os elementos da newGrid
    let randomCell = shuffleArray[indexRandomElement];
    let i = randomCell.i, j = randomCell.j;
    newGrid[i][j].value = 1; // Associar estado bloqueado
    removeFromArray(shuffleArray, randomCell) // remover celula escolhida do array de sorteio
    if (shuffleArray.length == 0) {
      break;
    }
    // console.log(`BLOQUEADO:I${i}.J${j}`);
    // Repetir processo até finalizar a contagem de blocos de bloqueio
  }
  console.log("Depois do laço shuffle");
  // console.log(newGrid);

  try{
    for (var i = 0; i < nrow; i++)
    for (var j = 0; j < ncol; j++) {
      newGrid[i][j].addNeighbors(newGrid);
    }
  }catch{console.log(`ERRO AO ADICIONAR VIZINHOS`)}

  

    console.log("Adicionou Vizinhos");
  let outputArray = [];
  outputPayload = `${nrow} ${ncol} ${nch} ${ncv}\r\n`;//Cabeçalho

  for (var i = 0; i < nrow; i++) {
    for (var j = 0; j < ncol; j++) {
      outputArray.push(newGrid[i][j].value);
    }
    outputPayload += outputArray.join(" ");
    if (i < (nrow - 1))//Inserir \r\n exeto na ultima linha
    {
      outputPayload += '\r\n';
    }
    outputArray = [];
  }
  console.log(outputPayload);

  grid = newGrid;

  configs = { nrows: nrow, ncols: ncol, weightX: nch, weightY: ncv };
  parserPayload(outputPayload);

  // loadConfigs();
  handleReset();
}

function downloadNovo() {
  download("Labir.txt", outputPayload);
}

function collectModal() {
  try {
    let modalRow = document.getElementById("nrow");
    let modalCol = document.getElementById("ncol");
    let modalCV = document.getElementById("ncv");
    let modalCH = document.getElementById("nch");
    let modalBlocks = document.getElementById("nblocks");
    let modalStartI = document.getElementById("nstarti");
    let modalStartJ = document.getElementById("nstartj");
    let modalEndI = document.getElementById("endi");
    let modalEndJ = document.getElementById("endj");

    let pStart = { i: modalStartI.value, j: modalStartJ.value };
    let pEnd = { i: modalEndI.value, j: modalEndJ.value };

    novo(modalRow.value, modalCol.value, modalCV.value, modalCH.value, modalBlocks.value, pStart, pEnd);
    // loadConfigs();
    // handleReset();
    console.log("Arquivo criado");
  } catch { alert("Falha ao criar nova matriz") };

  // closeModal();
}


//Retorna um inteiro pseudo-aleatório entre 0 - [max]
function getRandomInt(max) {
  return (Math.round(Math.random() * max));
}

function openModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "block";
}

function closeModal() {
  // When the user clicks on <span> (x), close the modal
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
}

window.onclick = function (event) { // Fechar modal quando clicar fora da tela
  var modal = document.getElementById("myModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}