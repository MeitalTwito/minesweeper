'use strict'

// timer variables
var gStartTime = 0;
var gEndTime = 0;
const timer = document.getElementById('stopwatch');
var gSec = 0;
var gStoptime = true;

// game elemnts
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

    var elSafeClickBtn = document.querySelector('.safe-click')
    elSafeClickBtn.classList.add('avilable')
    elSafeClickBtn.classList.remove('over')

    var elHintBtn = document.querySelector('.hint')
    elHintBtn.classList.add('avilable')
    elHintBtn.classList.remove('on')
    elHintBtn.classList.remove('over')

    gGame = {
        isFirstClick: true,
        isOn: false,
        lives: 3,
        safeClicks: 3,
        shownCount: 0,
        markedCount: 0,
        hintIsOn: false,
        hints: 3
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
        if (idxI === cellIdx.i && cellIdx.j === idxJ) {
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

    // if hint mode is on, go to hint function and don't open the cell
    if (gGame.hintIsOn) {
        getHint(idxI, idxJ)
        return
    }

    var clickedCell = gBoard[idxI][idxJ]
    if (clickedCell.isShown) return // id cell is already open retrn

    // If the cell clicked is a mine
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

            // BONUS - Full Expand 
            if (gBoard[i][j].minesAroundCount === 0) {
                expandShown(i, j)
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

// checks if the user won the game on each click (left or right)
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

// when user clicks on smiley, reset the game
function resetGame() {
    init(gLevel.SIZE, gLevel.MINES)
}

// set the gBoard lvl to user choise 
function userLevel(arr) {
    gLevel.SIZE = arr[0]
    gLevel.MINES = arr[1]
    init(gLevel.SIZE, gLevel.MINES)
}

// if user clicks on a mine, update life count
function updateLives() {
    var elLivesPane = document.querySelector('.lives')

    var lifeStr = ''
    for (var i = 0; i < gGame.lives; i++) {
        lifeStr += LIFE
    }

    elLivesPane.innerText = lifeStr
}

// when game is over - show all board
function revelBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (currCell.isShown) continue
            showCell(i, j)
        }
    }
}

// BONUS - Safe Clicks

function safeClick() {
    var elsafeClickBtn = document.querySelector('.safe-click')
    
    if (!gGame.isOn) return // makes sure game is on

    if (gGame.safeClicks === 0) {
        // if user has no clicks remining close the option and color btn red
        elsafeClickBtn.classList.remove('avilable')
        elsafeClickBtn.classList.add('over')
        return
    }

    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isShown || currCell.isMine) continue // skips mines and open cells
            // adds safe cell location to the arry
            var safeCell = { i, j }
            safeCells.push(safeCell)
        }
    }


    if (safeCells.length === 0) return // if no safe cells, return
    randIdx = getRandomInt(0, safeCells.length) // get random idx for the cells array
    var safeCellI = safeCells[randIdx].i
    var safeCellJ = safeCells[randIdx].j

    // show user the safe cell
    markSafe(safeCellI, safeCellJ)

    // makes the button red
    if (gGame.safeClicks === 1) {
        elsafeClickBtn.classList.remove('avilable')
        elsafeClickBtn.classList.add('over')
    }

    // reduce the safe cells clicks amount
    gGame.safeClicks--
}

function hint(elHint) {
    if (gGame.hints < 0) return
    elHint.classList.add('on')
    gGame.hintIsOn = true
}


// BONUS - Add support for HINTS
function getHint(idxI, idxJ) {
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            // Ignore shown cells
            if (gBoard[i][j].isShown) continue;
            // Show current Cell
            showCell(i, j)

        }
        // Show chosen Cell
        showCell(idxI, idxJ)
    }
    // hide hint after 1s
    setTimeout(hideHints, 1000, idxI, idxJ)

    // close hint mode and decrece hint count
    gGame.hintIsOn = false
    gGame.hints--
    var elHintBtn = document.querySelector('.hint')
    elHintBtn.classList.remove('on')

    // if user has no hints color the btn red
    if (gGame.hints === 0) {
        elHintBtn.classList.add('over')

    }
}

function hideHints(idxI, idxJ) {
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            
            // make sure open cells say open
            if (gBoard[i][j].isShown) continue;
           
            // hide hint cells
            hideHint(i, j)
        }
    }

    // closes the selected cell, if was not alredy open
    if(!gBoard[idxI][idxJ].isShown){
        hideHint(idxI, idxJ)
    }

}