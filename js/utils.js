function renderBoard(board, selector) {
  var strHTML = '<tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j];
      var cellId = `${i},${j}`
      var cellContent = (cell.isMine) ? MINE : cell.minesAroundCount
      strHTML += `<td id="${cellId}" onmousedown="cellMarked(event,this)" onclick="cellClicked(this,${i},${j})"><span class="hidden">${cellContent}</span></td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

// location such as: {i: 2, j: 7}
function showCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
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
  // console.log(emptyCells[randIdx]);
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
  var elCellContent = elCell.querySelector('span')
  elCellContent.classList.remove('hidden')
}

function hideCell(idxI, idxJ) {
  var elCell = document.getElementById(`${idxI},${idxJ}`);
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
  }
  
}

