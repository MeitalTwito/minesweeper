


function renderBoard(board, selector) {

  // setting diffrent colors to each number
  var numColors = {
    1: 'blue',
    2: 'green',
    3: 'red',
    4: 'brown',
    5: 'purple',
    6: 'orange',
    7: 'grey',
    8: 'black'
  }

  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j];
      var cellId = `${i},${j}`
      var cellContent = (cell.isMine) ? MINE : cell.minesAroundCount
      if (cellContent === 0) {
        cellContent = ''
      }
      strHTML += `<td class="closed" id="${cellId}" onmousedown="cellMarked(event,this)" onclick="cellClicked(this,${i},${j})"><span style="color: ${numColors[cell.minesAroundCount]};" class="hidden">${cellContent}</span></td>`
    }
    strHTML += '</tr>'
  }
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getEmptyCell(board) {
  var emptyCells = []

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j]

      if (!currCell.isMine) {
        emptyCells.push({ i, j })
      }
    }
  }

  if (emptyCells.length === 0) return false
  randIdx = getRandomInt(0, emptyCells.length)

  return emptyCells[randIdx]
}


function countNeighbors(cellI, cellJ, mat) {
  var neighborsCount = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= mat[i].length) continue;

      if (mat[i][j].isMine) neighborsCount++;
    }
  }
  return neighborsCount;
}


function showCell(idxI, idxJ) {
  var elCell = document.getElementById(`${idxI},${idxJ}`);
  elCell.classList.remove('closed')
  var className = (gBoard[idxI][idxJ].isMarked) ? 'marked' : 'open'
  elCell.classList.add(className)

  // shows cell's content
  var elCellContent = elCell.querySelector('span')
  elCellContent.classList.remove('hidden')
}


function hideCell(idxI, idxJ) {
  var elCell = document.getElementById(`${idxI},${idxJ}`);
  elCell.classList.add('closed')
  elCell.classList.remove('marked')
  var elCellContent = elCell.querySelector('span')
  elCellContent.classList.add('hidden')
}

function markToggle(elCell, idxI, idxJ) {
  var cell = gBoard[idxI][idxJ]
  if (cell.isMarked) {
    var elCellContent = elCell.querySelector('span')
    elCellContent.innerText = FLAG
    showCell(idxI, idxJ)
    gGame.markedCount++

  } else {
    hideCell(idxI, idxJ)
    var cellContent = (cell.isMine) ? MINE : cell.minesAroundCount
    var elCellContent = elCell.querySelector('span')
    elCellContent.innerText = cellContent
    gGame.markedCount--
    console.log(cell);
  }

}

// BONUS - Marks a non mine cell for 0.5s
function markSafe(idxI, idxJ) {
  var elCell = document.getElementById(`${idxI},${idxJ}`);
  elCell.classList.add('safe')
  console.log(elCell);

  setTimeout(() => {
    elCell.classList.remove('safe')
  }, 500);
}


// These functions control the stopwatch
function startTimer() {
  if (gStoptime) {
    gStoptime = false;
    timerCycle();
  }
}

function stopTimer() {
  if (!gStoptime) {
    gStoptime = true;
  }
}

function timerCycle() {
  if (gStoptime == false) {
    gSec = parseInt(gSec);


    gSec++

    if (gSec < 10) {
      gSec = '0' + gSec;
    }
    if (gSec < 100) {
      gSec = '0' + gSec;
    }
    timer.innerHTML = gSec;

    setTimeout("timerCycle()", 1000);
  }
}

function resetTimer() {
  timer.innerHTML = '000';
  gSec = 0;

}