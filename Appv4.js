import { useState } from "react";

function Square({ value }) {
  return (<button className="square">{value}</button>);
}

function GreenSquare({ value }) {
  return (<button className="greenSquare">{value}</button>);
}

function SolveButton({ onSolveClick }) {
  return <button className="sBtn btn btn-primary btn-lg" onClick={onSolveClick}>solve</button>
}

function RandomButton({ onRandomClick }) {
  return <button className="rBtn btn btn-primary btn-lg" onClick={onRandomClick}>new puzzle</button>
}

function CheckButton({ onCheckClick }) {
  return <button className="cBtn btn btn-primary btn-lg" onClick={onCheckClick}>check</button>
}

export default function Board() {
  let pzlArray = [];
  const [pzlString, setPzlString] = useState("..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3..");
  for (let i = 0; i < pzlString.length; i++) {
    pzlArray[i] = pzlString.slice(i, i + 1);
  }
  const [squares, setSquares] = useState(pzlArray);
  let solvedPuzzle = bruteForce(pzlString);

  function handleSolveClick() {
    let solvedArray = Array(81).fill(null);
    for (let i = 0; i < solvedPuzzle.length; i++) {
      solvedArray[i] = solvedPuzzle.slice(i, i + 1);
    }
    setSquares(solvedArray);
  }

  function handleRandomClick() {
    let randomPzl = generateRandomPuzzle();
    let randomArray = Array(81).fill(null);
    for (let i = 0; i < randomPzl.length; i++) {
      randomArray[i] = randomPzl.slice(i, i + 1);
    }
    setSquares(randomArray);
    setPzlString(randomPzl);
  }

  function handleCheckClick() {
    let cleanedSquares = []; /*making sure that 01 prefixes don't keep getting appended*/
    for(let i = 0; i < squares.length; i++){
      if(squares[i].length===2){cleanedSquares.push(squares[i].charAt(1));}
      else if(squares[i].length===3){cleanedSquares.push(squares[i].charAt(2));}
      else{cleanedSquares.push(squares[i]);}
    }

    let updatedSquares = cleanedSquares.slice();
    for (let i = 0; i < solvedPuzzle.length; i++) {
      if (solvedPuzzle[i] !== cleanedSquares[i] && cleanedSquares[i] !== ".") { /* "." check ignores blank squares when checking */
        /*incorrect input square*/
        updatedSquares[i] = "0" + cleanedSquares[i].toString(); /*appending characters to differentiate accuracy of input*/
      }
      else {
        updatedSquares[i] = cleanedSquares[i];
      }
    }
    /*checking to see if puzzle was solved correctly by the user, every square has to be filled out for this to run*/
    if (updatedSquares.indexOf(".") === -1) {
      let accuracy = true;
      for (let i = 0; i < solvedPuzzle.length; i++) {
        if (solvedPuzzle[i] !== updatedSquares[i]) {
          accuracy = false;
        }
      }
      if (accuracy === true) {
        for (let i = 0; i < updatedSquares.length; i++) {
          updatedSquares[i] = ".." + solvedPuzzle[i];
        }
      }
    }
    setSquares(updatedSquares);
  }

  function handleChange(event, index) { /*updates squares each time input fields change*/
    squares[index] = event.target.value;
  }

  /*creating an array of different types of squares every time the board is rerendered*/
  let boardSquares = [];
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === ".") { boardSquares.push(<input type="text" className="emptySquare" onChange={event => handleChange(event, i)} />); }
    else if (squares[i].length === 2) { boardSquares.push(<input type="text" className="redSquare" onChange={event => handleChange(event, i)} />); }
    else if (squares[i].length === 3) { boardSquares.push(<GreenSquare value={squares[i].charAt(2)} />); }
    else { boardSquares.push(<Square value={squares[i]} />) };
  }
  /*mapping the array of squares into a new array of JSX nodes*/
  const mappedSquares = boardSquares.map((square) => <span>{square}</span>);

  return (<>
    <div id="board">{/*box borders*/}
      <div id="verticalOne"></div><div id="verticalTwo"></div><div id="horizontalOne"></div><div id="horizontalTwo"></div>
      <div id="leftBorder"></div><div id="topBorder"></div><div id="bottomBorder"></div><div id="rightBorder"></div>
      <div className="board-row">{mappedSquares.slice(0, 9)};</div>
      <div className="board-row">{mappedSquares.slice(9, 18)};</div>
      <div className="board-row">{mappedSquares.slice(18, 27)};</div>
      <div className="board-row">{mappedSquares.slice(27, 36)};</div>
      <div className="board-row">{mappedSquares.slice(36, 45)};</div>
      <div className="board-row">{mappedSquares.slice(45, 54)};</div>
      <div className="board-row">{mappedSquares.slice(54, 63)};</div>
      <div className="board-row">{mappedSquares.slice(63, 72)};</div>
      <div className="board-row">{mappedSquares.slice(72, 81)};</div>
    </div>
    <div id="buttons">
      <RandomButton onRandomClick={handleRandomClick} />
      <SolveButton onSolveClick={handleSolveClick} />
      <CheckButton onCheckClick={handleCheckClick} />
    </div>
  </>);
}

function generateRandomPuzzle() { //picks a random puzzle instead of generating because validity takes time
  let pzlIdx = Math.floor(Math.random() * 50);
  let puzzles = listOfPuzzles();
  return puzzles[pzlIdx];
}

function generateConstraints(n) {
  let listOfSets = [];
  let rowBeginIdx = 0;
  let rowNumber = 0; //also serves as tracking index of listOfSets
  for (let idx = 0; idx < 3 * n; idx++) {
    listOfSets.push([]);
  }
  for (let i = 0; i < n * n; i = i + n) { //generate constraint sets for rows
    for (let j = rowBeginIdx; j < rowBeginIdx + n; j++) {
      listOfSets[rowNumber].push(j);
    }
    rowNumber = rowNumber + 1;
    rowBeginIdx = rowBeginIdx + n;
  }
  for (let i = 0; i < n; i++) { //generate constraint sets for columns
    for (let j = i; j < n * (n - 1) + i + n; j = j + n) {
      listOfSets[rowNumber].push(j);
    }
    rowNumber = rowNumber + 1;
  }
  let diagonalConstraints = [[0, 1, 2, 9, 10, 11, 18, 19, 20], [3, 4, 5, 12, 13, 14, 21, 22, 23], [6, 7, 8, 15, 16, 17, 24, 25, 26],
  [27, 28, 29, 36, 37, 38, 45, 46, 47], [30, 31, 32, 39, 40, 41, 48, 49, 50], [33, 34, 35, 42, 43, 44, 51, 52, 53],
  [54, 55, 56, 63, 64, 65, 72, 73, 74], [57, 58, 59, 66, 67, 68, 75, 76, 77], [60, 61, 62, 69, 70, 71, 78, 79, 80]];
  for (let k = 0; k < 9; k++) {
    listOfSets[k + rowNumber] = (diagonalConstraints[k]);
  }
  return listOfSets;
}

function bruteForce(pzl) {
  if (isInvalid(pzl)) { return ""; }
  if (isFinished(pzl)) {
    return pzl;
  }
  let choices = findChoices(pzl);
  for (let i = 0; i < choices.length; i++) {
    let subPzl = choices[i];
    let bF = bruteForce(subPzl);
    if (bF) {
      return bF;
    }
  }
  return "";
}

function findChoices(pzl) {
  let unfilled = pzl.indexOf(".");
  let choices = [];
  let tileType = [1, 2, 3, 4, 5, 6, 7, 8, 9]; //testing all 9 possible numbers, very inefficient
  for (let i = 0; i < tileType.length; i++) {
    let choice = pzl.slice(0, unfilled) + tileType[i].toString() + pzl.slice(unfilled + 1, pzl.length);
    choices.push(choice);
  }
  return choices;
}

function isFinished(pzl) {
  if (pzl.indexOf(".") === -1) { return true; }
  else { return false; }
}

function isInvalid(pzl) {
  //collecting characters from constraint indexes - if set length < list length, there were repeats and the pzl is invalid
  let checkList = [];
  let checkSet = new Set([]);
  let constraints = generateConstraints(9);
  for (let i = 0; i < constraints.length; i++) {
    for (let j = 0; j < constraints[i].length; j++) {
      if (constraints[i][j] >= 0 && constraints[i][j] <= 100) {
        if (pzl[constraints[i][j]] !== ".") { //constraints only apply to blank spaces
          checkList.push(pzl[constraints[i][j]]);
          checkSet.add(pzl[constraints[i][j]]);
        }
      }
    }
    if (checkSet.size !== checkList.length) {
      return true;
    }
    checkList = [];
    checkSet = new Set([]);
  }
  return false;
}

function listOfPuzzles() { //50 valid puzzles
  let puzzles = ['..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3..',
    '2...8.3...6..7..84.3.5..2.9...1.54.8.........4.27.6...3.1..7.4.72..4..6...4.1...3',
    '......9.7...42.18....7.5.261..9.4....5.....4....5.7..992.1.8....34.59...5.7......',
    '.3..5..4...8.1.5..46.....12.7.5.2.8....6.3....4.1.9.3.25.....98..1.2.6...8..6..2.',
    '.2.81.74.7....31...9...28.5..9.4..874..2.8..316..3.2..3.27...6...56....8.76.51.9.',
    '1..92....524.1...........7..5...81.2.........4.27...9..6...........3.945....71..6',
    '.43.8.25.6.............1.949....4.7....6.8....1.2....382.5.............5.34.9.71.',
    '48...69.2..2..8..19..37..6.84..1.2....37.41....1.6..49.2..85..77..9..6..6.92...18',
    '...9....2.5.1234...3....16.9.8.......7.....9.......2.5.91....5...7439.2.4....7...',
    '..19....39..7..16..3...5..7.5......9..43.26..2......7.6..1...3..42..7..65....68..',
    '...1254....84.....42.8......3.....95.6.9.2.1.51.....6......3.49.....72....1298...',
    '.6234.75.1....56..57.....4.....948..4.......6..583.....3.....91..64....7.59.8326.',
    '3..........5..9...2..5.4....2....7..16.....587.431.6.....89.1......67.8......5437',
    '63..........5....8..5674.......2......34.1.2.......345.....7..4.8.3..9.29471...8.',
    '....2..4...8.35.......7.6.2.31.4697.2...........5.12.3.49...73........1.8....4...',
    '361.259...8.96..1.4......57..8...471...6.3...259...8..74......5.2..18.6...547.329',
    '.5.8.7.2.6...1..9.7.254...6.7..2.3.15.4...9.81.3.8..7.9...762.5.6..9...3.8.1.3.4.',
    '.8...5........3457....7.8.9.6.4..9.3..7.1.5..4.8..7.2.9.1.2....8423........1...8.',
    '..35.29......4....1.6...3.59..251..8.7.4.8.3.8..763..13.8...1.4....2......51.48..',
    '...........98.51...519.742.29.4.1.65.........14.5.8.93.267.958...51.36...........',
    '.2..3..9....9.7...9..2.8..5..48.65..6.7...2.8..31.29..8..6.5..7...3.9....3..2..5.',
    '..5.....6.7...9.2....5..1.78.415.......8.3.......928.59.7..6....3.4...1.2.....6..',
    '.4.....5...19436....9...3..6...5...21.3...5.68...2...7..5...2....24367...3.....4.',
    '..4..........3...239.7...8.4....9..12.98.13.76..2....8.1...8.539...4..........8..',
    '36..2..89...361............8.3...6.24..6.3..76.7...1.8............418...97..3..14',
    '5..4...6...9...8..64..2.........1..82.8...5.17..5.........9..84..3...6...6...3..2',
    '..72564..4.......5.1..3..6....5.8.....8.6.2.....1.7....3..7..9.2.......4..63127..',
    '..........79.5.18.8.......7..73.68..45.7.8.96..35.27..7.......5.16.3.42..........',
    '.3.....8...9...5....75.92..7..1.5..8.2..9..3.9..4.2..1..42.71....2...8...7.....9.',
    '2..17.6.3.5....1.......6.79....4.7.....8.1.....9.5....31.4.......5....6.9.6.37..2',
    '.......8.8..7.1.4..4..2..3.374...9......3......5...321.1..6..5..5.8.2..6.8.......',
    '.......85...21...996..8.1..5..8...16.........89...6..7..9.7..523...54...48.......',
    '6.8.7.5.2.5.6.8.7...2...3..5...9...6.4.3.2.5.8...5...3..5...2...1.7.4.9.4.9.6.7.1',
    '.5..1..4.1.7...6.2...9.5...2.8.3.5.1.4..7..2.9.1.8.4.6...4.1...3.4...7.9.2..6..1.',
    '.53...79...97534..1.......2.9..8..1....9.7....8..3..7.5.......3..76412...61...94.',
    '..6.8.3...49.7.25....4.5...6..317..4..7...8..1..826..9...7.2....75.4.19...3.9.6..',
    '..5.8.7..7..2.4..532.....84.6.1.5.4...8...5...7.8.3.1.45.....916..5.8..7..3.1.6..',
    '...9..8..128..64...7.8...6.8..43...75.......96...79..8.9...4.1...36..284..1..7...',
    '....8....27.....54.95...81...98.64...2.4.3.6...69.51...17...62.46.....38....9....',
    '...6.2...4...5...1.85.1.62..382.671...........194.735..26.4.53.9...2...7...8.9...',
    '...9....2.5.1234...3....16.9.8.......7.....9.......2.5.91....5...7439.2.4....7...',
    '38..........4..785..9.2.3...6..9....8..3.2..9....4..7...1.7.5..495..6..........92',
    '...158.....2.6.8...3.....4..27.3.51...........46.8.79..5.....8...4.7.1.....325...',
    '.1.5..2..9....1.....2..8.3.5...3...7..8...5..6...8...4.4.1..7.....7....6..3..4.5.',
    '.8.....4....469...4.......7..59.46...7.6.8.3...85.21..9.......5...781....6.....1.',
    '9.42....7.1..........7.65.....8...9..2.9.4.6..4...2.....16.7..........3.3....57.2',
    '...7..8....6....31.4...2....24.7.....1..3..8.....6.29....8...7.86....5....2..6...',
    '..1..7.9.59..8...1.3.....8......58...5..6..2...41......8.....3.1...2..79.2.7..4..',
    '.....3.17.15..9..8.6.......1....7.....9...2.....5....4.......2.5..6..34.34.2.....',
    '3..2........1.7...7.6.3.5...7...9.8.9...2...4.1.8...5...9.4.3.1...7.2........8..6'];
  return puzzles;
}







