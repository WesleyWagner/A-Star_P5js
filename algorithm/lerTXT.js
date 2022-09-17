const CELL_STATE = {
    START: 2,
    FINISH: 3,
    WALL: 1,
    EMPTY: 0
};

class nodePoint {
    constructor(row, col, father, id) {
        this.row = row;
        this.col = col;
        this.father = father;
        this.id = id;
        this.children = [];
    }
    addChild(nodeChild) {
        this.children.push(nodeChild);
    }
}

function cost(startPoint, endPoint) {
    return (((startPoint.row - endPoint.row) ** 2 + (startPoint.col - endPoint.col) ** 2) ** 0.5);
}


function tableColor(obj) {
    console.log(obj);
}

function tableCreate(nrows, ncols, matrix) {
    const
        tableDiv = document.getElementById('myTable'),
        elTable = document.createElement('table');

    elTable.style.height = '60px';
    elTable.style.width = '60px';
    elTable.style.border = '1px solid black';

    for (let i = 0; i < nrows; i++) {
        const tr = elTable.insertRow();
        for (let j = 0; j < ncols; j++) {
            const td = tr.insertCell();
            td.appendChild(document.createTextNode(`P${i}${j}`));
            td.style.border = '1px solid black';
            td.style.backgroundColor = '#DDD';
            // console.log(`ROW: ${i} x COL: ${ncols}`)
            if (matrix[i][j] == 2) td.style.backgroundColor = 'cyan';
            if (matrix[i][j] == 3) td.style.backgroundColor = 'green';
            if (matrix[i][j] == 1) td.style.backgroundColor = 'red';
        }
    }

    while (tableDiv.firstChild) {
        //The list is LIVE so it will re-index each call
        tableDiv.removeChild(tableDiv.firstChild);
    }
    tableDiv.appendChild(elTable);
}
var arquivo;
var configs;
var matrix = [];
var grafoBusca;

document.getElementById('inputfile').addEventListener('change', readTXT);

function readTXT() {
    console.log("ARQUIVO ENVIADO")
    // var outputHTML = document.getElementById('output');
    var fr = new FileReader();
    fr.readAsText(this.files[0]);
    fr.onload = function () {
        // outputHTML.textContent = fr.result;
        arquivo = fr.result;
        // console.log(outputHTML.textContent);
        let splited = arquivo.split(/\r\n/);
        let header = splited[0].split(' ');
        let nrows = header[0];
        let ncols = header[1];
        let weightX = header[2];
        let weightY = header[3];
        configs = { nrows, ncols, weightX, weightY };
        matrix = [];
        for (let i = 0; i < splited.length; i++) {
            matrix[i] = splited[i].split(' ');
        }
        matrix.shift();

        // tableCreate(nrows, ncols, matrix);
        // tableColor(matrix);
        matrix = ArrayRemove(matrix, '');
        initCanvas = true;

        cols = configs.ncols;
        rows = configs.nrows;
        grid = new Array(rows);
        cv = 1;
        ch = 1;
        cv = configs.weightY;
        ch = configs.weightX;
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
                grid[i][j].value = matrix[i][j];
                if(grid[i][j].value == 2){
                    start = grid[i][j];
                }
                if(grid[i][j].value == 3){
                    end = grid[i][j];
                }
            }

        for (var i = 0; i < rows; i++)
            for (var j = 0; j < cols; j++) {
                grid[i][j].addNeighbors(grid);
            }

        

        console.log(grid);
        stopLoop = false;
        openSet = [];
        closedSet = [];
        start.h = heuristic(start,end);//Inicializar custo total inicial 0 e recalcular para os próximos nós
        start.g = 0;//Inicializar custo total inicial 0 e recalcular para os próximos nós
        start.f = start.g+ start.h;
        // pathResolvido.push(start);
        openSet.push(start);
        resolvido = false;
        solve =false;
        boolPathMake = true;
        draw();
        let infoCustosEl = document.getElementById("infoCustos");
        infoCustosEl.textContent = `Custo de deslocamento vertical: ${cv} | Custo de deslocamento horizontal: ${ch} | Custo de deslocamento diagonal: ${cd.toFixed(3)}`;
    }
}

function getStart(matrix) {
    let solvePoint = new nodePoint;
    let i;
    let j;
    matrix.forEach(function (value, index) {
        i = index;
        j = value.findIndex(function (value) {
            return value == CELL_STATE.START;
        });
        if (j >= 0) {
            console.log(`Matrix[${i}][${j}]`);
        }
    });
    solvePoint.row = i;
    solvePoint.col = j;
    solvePoint.father = true;
    return solvePoint;
}

function getEnd(matrix) {
    let solvePoint = new nodePoint;
    let i;
    let j;
    matrix.forEach(function (value, index) {
        i = index;
        j = value.findIndex(function (value) {
            return value == CELL_STATE.FINISH;
        });
        if (j >= 0) {
            console.log(`Matrix[${i}][${j}]`);
        }
    });
    solvePoint.row = i;
    solvePoint.col = j;
    return solvePoint;
}

function ArrayRemove(array, value) {

    return array.filter(function (ele) {
        return ele != value;
    });
}