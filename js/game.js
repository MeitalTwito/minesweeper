'use strict'

var gStartTime = 0;
var gEndTime = 0;
const timer = document.getElementById('stopwatch');
var gSec = 0;
var gStoptime = true;

var MINE = '💥'
var FLAG = '🚩'

// The model - Matrix containing cell objects: 
var gBoard


// Determins the Mat Size and number of mines
var gLevel = {}

// This is an object which updates the current game state:
var gGame = {}
var gIsVictory = false

function init(size = 4, mineCount = 2) {
    stopTimer()
    resetTimer()
    gLevel = {
        SIZE: size,
        MINES: mineCount
    }
    gGame = {
        isFirstClick: true,
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard, '.game-board')
}

function startGame(idxI,idxJ){
    gGame.isOn = true
    startTimer();
    getMines(gBoard, gLevel.MINES,idxI,idxJ)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.game-board')
    showCell(idxI,idxJ)
    // console.log(gBoard);
    
}

function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    return board;
}


function getMines(board, count, idxI,idxJ) {
    console.log('hello');
    for (var i = 0; i < count; i++) {
        var cellIdx = getEmptyCell(board)
        if (idxI === cellIdx.i && cellIdx.j ===idxJ) continue
        var randCell = gBoard[cellIdx.i][cellIdx.j]
        randCell.isMine = true
    }
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var numOfNeighbors = countNeighbors(i, j, board);
            cell.minesAroundCount = numOfNeighbors;
        }
    }
}

function cellClicked(elcell,idxI,idxJ) {
    if (gGame.isFirstClick){
        gGame.isFirstClick = false
        startGame(idxI,idxJ)
    } 
    if (!gGame.isOn) return
    var clickedCell = gBoard[idxI][idxJ]
    if (clickedCell.isShown) return

    console.log('cell Clicked');
    // If the cell clicked is a Mine, don't show it
    if (clickedCell.isMine) {
        showCell(idxI,idxJ)
        gameOver()
    }
    
    // Update Model
    clickedCell.isShown = true
    gGame.shownCount++

    // Update Dom
    var elCellContent = elcell.querySelector('span')
    elCellContent.classList.remove('hidden')
  
    // If cell clicked has 0 mines next to it, open all neighbors. 
    if (clickedCell.minesAroundCount === 0) {
        expandShown(idxI, idxJ)
    }
    gIsVictory = checkVictory()
    if (gIsVictory) {
        gameOver()
    }
}

function cellMarked(ev, elCell) {
    // if not right click return
    if (ev.which !== 3) return
    
    // find cell location on model
    var location = elCell.id.split(',')
    var cellI = +location[0]
    var cellJ = +location[1]
    var currCell = gBoard[cellI][cellJ]

    // can't flag displayed cell 
    if (currCell.isShown)return

    // toggle mark on Model
    currCell.isMarked = !currCell.isMarked
          
    // toggle mark on DOM
    markToggle(elCell,cellI,cellJ)
    
    gIsVictory = checkVictory()
    if (gIsVictory) {
        gameOver()
    }
}


function expandShown(idxI, idxJ) {
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            
            // Model
            if (gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true
            gGame.shownCount++
            // Dom
            showCell(i, j)
        }
    }
}

function checkVictory() {
    var winShowCount = gLevel.SIZE**2 -gLevel.MINES
    var winMarkCount = gLevel.MINES

    return (winShowCount === gGame.shownCount && winMarkCount === gGame.markedCount)
}

function gameOver() {
    gGame.isOn = false;
    stopTimer()
    document.querySelector('.rest').style.display = 'inline'
    if (gIsVictory){
        document.querySelector('h2').innerText = 'You Win!'
    } else{
        document.querySelector('h2').innerText = 'Game Over'
    }
    
}

function resetGame(){
    document.querySelector('.rest').style.display = 'none'
    init()
}