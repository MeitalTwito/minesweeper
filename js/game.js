'use strict'

var gStartTime = 0;
var gEndTime = 0;
const timer = document.getElementById('stopwatch');
var gSec = 0;
var gStoptime = true;

var MINE = '<img src="img/mine.png">'
var FLAG = '🚩'
var LIFE = '💛'
var VICTORY = '😎'
var NORMAL = '😀'
var LOSE = '🤯'

// The model - Matrix containing cell objects: 
var gBoard


// Determins the Mat Size and number of mines
var gLevel = {
    SIZE: 12,
    MINES: 30
}

// This is an object which updates the current game state:
var gGame = {}
var gIsVictory = false

function init() {
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = NORMAL 
    stopTimer()
    resetTimer()

    gGame = {
        isFirstClick: true,
        isOn: false,
        lives: 3,
        safeClicks: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    updateLives()
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard, '.game-board')
}

function startGame(idxI, idxJ) {
    gGame.isOn = true
    startTimer();
    getMines(gBoard, gLevel.MINES, idxI, idxJ)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.game-board')
    showCell(idxI, idxJ)
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


function getMines(board, count, idxI, idxJ) {
    console.log('hello');
    for (var i = 0; i < count; i++) {
        var cellIdx = getEmptyCell(board)
        if (idxI === cellIdx.i && cellIdx.j === idxJ){
            i-- 
            continue 
            // continue for another round with the count wanted
        } 
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

function cellClicked(elcell, idxI, idxJ) {

    // Avoiding a Mine on first click
    if (gGame.isFirstClick) {
        gGame.isFirstClick = false
        startGame(idxI, idxJ)
    }

    if (!gGame.isOn) return // if game is over retrn

    var clickedCell = gBoard[idxI][idxJ]
    if (clickedCell.isShown) return // id cell is already open retrn

    // If the cell clicked is a Mine
    if (clickedCell.isMine) {
        // User has lives - make an alert sound and decrese lives
        if (gGame.lives > 0) {
            var audioStop = new Audio('sound/stop.mp3');
            audioStop.play()
            gGame.lives--
            updateLives()
            return
        }

        // User has 0 lives - Game Over 
        showCell(idxI, idxJ)
        gameOver()
    }

    // Make the step
    // Update Model
    clickedCell.isShown = true
    gGame.shownCount++
    // Update Dom
    showCell(idxI, idxJ)

    // If cell clicked has 0 mines next to it, open all neighbors. 
    if (clickedCell.minesAroundCount === 0) {
        expandShown(idxI, idxJ)
    }

    // checks if game is over
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

            if (gBoard[i][j].minesAroundCount === 0){
                expandShown(i,j)
            }
        }
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
    if (currCell.isShown) return

    // toggle mark on Model
    currCell.isMarked = !currCell.isMarked

    // toggle mark on DOM
    markToggle(elCell, cellI, cellJ)

    gIsVictory = checkVictory()
    if (gIsVictory) {
        gameOver()
    }
}

function checkVictory() {
    var winShowCount = gLevel.SIZE ** 2 - gLevel.MINES
    var winMarkCount = gLevel.MINES

    return (winShowCount === gGame.shownCount && winMarkCount === gGame.markedCount)
}

function gameOver() {
    var elSmiley = document.querySelector('.smiley')
    gGame.isOn = false;
    stopTimer()
    if (gIsVictory) {
        elSmiley.innerText = VICTORY 
    } else {
        elSmiley.innerText = LOSE 
        revelBoard(gBoard)
    }

}

function resetGame() {
    init(gLevel.SIZE,gLevel.MINES)
}

function userLevel(arr) {
    gLevel.SIZE = arr[0]
    gLevel.MINES = arr[1]
    init(gLevel.SIZE,gLevel.MINES)
}

function updateLives() {
    var elLivesPane = document.querySelector('.lives')

    var lifeStr = ''
    for (var i = 0; i < gGame.lives; i++) {
        lifeStr += LIFE
    }

    elLivesPane.innerText = lifeStr
}

function revelBoard(board) {
    for ( var i = 0; i < board.length; i++){
        for (var j = 0; j < board[0].length; j++){
            var currCell = board[i][j]
            if (currCell.isShown) continue
            showCell(i,j)
        }
    }
    
}

function safeClick(){
    
    if (!gGame.isOn) return
    if ( gGame.safeClicks ===0) return
    var safeCells = []
    for ( var i = 0; i < gBoard.length; i++){
        for (var j = 0; j < gBoard[0].length; j++){
            var currCell = gBoard[i][j]
            if (currCell.isShown || currCell.isMine) continue
            var safeCell = {i,j}
            safeCells.push(safeCell)
        }
    }

    if (safeCells.length === 0) return
    randIdx = getRandomInt(0, safeCells.length)
    var safeCellI = safeCells[randIdx].i
    var safeCellJ = safeCells[randIdx].j
    
    markSafe(safeCellI, safeCellJ)
    gGame.safeClicks--
}