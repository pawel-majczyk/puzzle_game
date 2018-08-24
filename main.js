'use strict';
class GameApp {
  constructor(options) {
    /**
     * @param {Object} options - contains these properties:
     * @param {Number} size - size of the gameboard
     * @param {Number} difficulty - amount of puzzles in axis
     * @param {Object} theme - contains data for image request
     * @param {String} theme.name - collection name
     * @param {Number} theme.id - collection ID
     */
    const { size, difficulty, theme } = options;
    this.theme = theme;
    this.score = 0;
    this.numOfPuzzles = difficulty; // square root of total number of puzzles
    this.maxScore = Math.pow(difficulty, 2);
    this.boardWidth = size;
    this.puzzles = [];
    this.gameApp = document.getElementById('game_app');
    this.gameApp.style.height = `${this.boardWidth}px`;
    this.gameApp.style.width = `${this.boardWidth}px`;
    this.gameContainer = document.createElement('div');
    this.gameContainer.setAttribute('id', 'gameboard');
    this.gameApp.appendChild(this.gameContainer);
    this.selectedPuzzle = {};
    this.selectedPuzzle.isDraggable = null;

    //add eventhandlers
    this.gameApp.addEventListener('mousedown', event => this.startDragging(event));
    this.gameApp.addEventListener('mousemove', event => this.whileDragging(event));
    this.gameApp.addEventListener('mouseup', event => this.stopDragging(event));

    this.puzzleImage = ((boardWidth, collection) => {
      console.log(collection.name); //eslint-disable-line
      //this game uses unsplash API to generate random puzzles to solve
      fetch(`https://source.unsplash.com/collection/${collection.id}/${boardWidth}x${boardWidth}`)
        .then(imgData => imgData.url)
        .then(url =>
          this.createPuzzles(url));
    })(size, theme);
  }

  createPuzzles(puzzleImage) {
    //generate puzzles
    for (let i = 0; i < this.maxScore; i++) {
      let puzzleSize = (this.boardWidth / this.numOfPuzzles);
      this.puzzleSize = puzzleSize;
      let positionX, positionY, currentPositionX, currentPositionY;
      let id = i;
      currentPositionX = Math.random() * this.boardWidth; //randomize starting position
      currentPositionY = Math.random() * this.boardWidth;

      /** Calculate origns of each puzzle
       * values below are later used to determine background offset
       * @param {number} positionX - puzzle origin position on horizontal axis
       * @param {number} positionY - puzzle origin position on vertical axis
       */
      positionX = (i % Math.sqrt(this.maxScore)) * puzzleSize;
      positionY = (Math.floor(i / Math.sqrt(this.maxScore))) * puzzleSize;
      let puzzle = new Puzzle(id, positionX, positionY, currentPositionX, currentPositionY, puzzleSize, puzzleImage);
      this.puzzles.push(puzzle);
    }
    this.puzzles.forEach(puzzle => {
      this.gameContainer.appendChild(puzzle.puzzleDiv);
    });
  }

  getPuzzleSize(factor = 1) {
    return this.puzzleSize * factor;
  }

  checkScore() {
    if (this.score >= this.maxScore) {
      setTimeout(() => {
        alert('Gratuluję! Wygrałeś(aś)!');
      }, 250);
    }
  }

  // puzzle methods
  startDragging(e) {
    if (e.target.classList.contains('game__puzzle')) {
      this.selectedPuzzle = this.puzzles[e.target.id];
      e.preventDefault(); //disable OLE/ActiveX
      if (!this.selectedPuzzle.isLocked) {
        this.selectedPuzzle.puzzleDiv.classList.add('--dragged');
        this.selectedPuzzle.isDraggable = !this.selectedPuzzle.isLocked;
      }
    }
    return false;
  }

  whileDragging(e) {
    // this.selectedPuzzle = this.puzzles[e.target.id];
    if (this.selectedPuzzle.isDraggable) {
      this.selectedPuzzle.puzzleDiv.style.top = (e.clientY - this.getPuzzleSize(1 / 2) + window.pageYOffset) + 'px';
      this.selectedPuzzle.puzzleDiv.style.left = (e.clientX - this.getPuzzleSize(1 / 2) + window.pageXOffset) + 'px';
      let fits = this.isPuzzleOnSpot(e);
      if (fits) {
        this.selectedPuzzle.puzzleDiv.classList.add('--it-fits');
      } else {
        this.selectedPuzzle.puzzleDiv.classList.remove('--it-fits');
      }
    }
  }

  stopDragging(e) {
    this.selectedPuzzle.puzzleDiv.classList.remove('--dragged', '--it-fits');
    this.selectedPuzzle.isDraggable = false;
    if (this.isPuzzleOnSpot(e)) { //check of puzzle is near desired spot
      this.selectedPuzzle.puzzleDiv.classList.add('--fitted');
      this.selectedPuzzle.puzzleDiv.style.top = this.getReferencePoints(this.selectedPuzzle).top + 'px';
      this.selectedPuzzle.puzzleDiv.style.left = this.getReferencePoints(this.selectedPuzzle).left + 'px';
      if (!this.selectedPuzzle.isLocked) {
        this.score += 1;
        this.checkScore();
      }
      this.selectedPuzzle.isLocked = true;
    }
    this.selectedPuzzle = {}; //deselect puzzle
  }

  isPuzzleOnSpot(e) {
    const refPoints = this.getReferencePoints(this.selectedPuzzle);
    // snap puzzle to its origin
    const snapRange = 18;
    const elementIsWithinDropZone =
      (refPoints.left - e.target.offsetLeft <= snapRange &&
        refPoints.left - e.target.offsetLeft >= -snapRange) &&
      (refPoints.top - e.target.offsetTop <= snapRange &&
        refPoints.top - e.target.offsetTop >= -snapRange);
    return elementIsWithinDropZone;
  }

  getReferencePoints(selectedPuzzle) {
    const {
      positionY,
      positionX
    } = selectedPuzzle;
    const {
      offsetTop,
      offsetLeft
    } = this.gameContainer;

    const top = offsetTop + positionY;
    const left = offsetLeft + positionX;

    return {
      top,
      left
    };
  }
}

class Puzzle {
  constructor(id, positionX, positionY, currentpositionX, currentpositionY, puzzleSize, puzzleImage) {
    const initialOffset = 125;
    this.positionX = positionX;
    this.positionY = positionY;
    this.puzzleSize = puzzleSize;
    this.puzzleImage = puzzleImage;
    this.currentpositionX = currentpositionX;
    this.currentpositionY = currentpositionY + initialOffset;
    this.isLocked = false;
    // create puzzle element
    const puzzleDiv = document.createElement('div');
    puzzleDiv.className = 'game__puzzle';
    puzzleDiv.id = id;
    puzzleDiv.style.left = `${this.currentpositionX}px`;
    puzzleDiv.style.top = `${this.currentpositionY}px`;
    puzzleDiv.style.background = `url(${this.puzzleImage})`;
    puzzleDiv.style.backgroundPositionX = `${-positionX}px`;
    puzzleDiv.style.backgroundPositionY = `${-positionY}px`;
    puzzleDiv.style.width = `${puzzleSize}px`;
    puzzleDiv.style.height = `${puzzleSize}px`;
    this.puzzleDiv = puzzleDiv;
  }
}

//initial setup
let imageColllections = [{
  name: 'Z nieba',
  id: 1223439
}, {
  name: 'Ludzie',
  id: 582659
}, {
  name: 'Terenowe',
  id: 289662
}];



//helper
const getRandomArrayItem = (arr) => {
  return arr[(Math.floor(Math.random() * arr.length))];
};


//setup
let options = {
  size: 256,
  difficulty: 3,
  theme: getRandomArrayItem(imageColllections),
};


{
  new Promise((resolve) => {
    let setDifficulty = prompt('Please enter difficulty (1-7, default: 3)', 3);
    if (setDifficulty > 1 && setDifficulty < 8) {
      resolve(setDifficulty);
    } else {
      alert(`Don't be ridiculous, "${setDifficulty}" is not valid! Giving you defaults...`);
      resolve(3);
    }
  }).then(setDifficulty => {
    options.difficulty = setDifficulty;
    new GameApp(options);
  });
}
// game = new GameApp(2, size, getRand(collection)); //for debugging