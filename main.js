'use strict';
class GameApp {
    constructor(numOfPuzzles, boardWidth = 512, collectionId) {
        this.collectionId = collectionId; // not used yet
        this.score = 0;
        this.numOfPuzzles = numOfPuzzles; // square root of total number of puzzles
        this.maxScore = Math.pow(numOfPuzzles, 2);
        this.boardWidth = boardWidth;
        this.puzzles = [];
        this.gameApp = document.getElementById('game_app');
        this.gameApp.style.height = `${this.boardWidth}px`;
        this.gameApp.style.width = `${this.boardWidth}px`;
        this.gameContainer = document.createElement('div');
        this.gameContainer.setAttribute('id', 'gameboard');
        this.gameApp.appendChild(this.gameContainer);
    }

    //get the image and create puzzles!
    init(boardWidth = this.boardWidth, collectionId = this.collectionId) {
        this.puzzleImage = ((boardWidth, collectionId) => {
            console.log('collectionId :', collectionId); //eslint-disable-line
            fetch(`https://source.unsplash.com/random/${boardWidth}x${boardWidth}`)
                .then(imgData => imgData.url)
                .then(url =>
                    this.createPuzzles(url));
        })(boardWidth, collectionId);
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
        //add eventhandlers
        puzzleDiv.addEventListener('mousedown', event => this.startDragging(event));
        puzzleDiv.addEventListener('mousemove', event => this.whileDragging(event));
        puzzleDiv.addEventListener('mouseup', event => this.stopDragging(event));
        puzzleDiv.addEventListener('mouseleave', event => this.stopDragging(event));
        this.puzzleDiv = puzzleDiv;
    }

    startDragging(e) {

        e.preventDefault(); //disable OLE/ActiveX
        this.puzzleDiv.classList.add('--dragged');
        // this.checkForLock(e);
        this.isDraggable = !this.isLocked;
        return false;
    }

    whileDragging(e) {
        if (this.isDraggable) {
            this.puzzleDiv.style.top = (e.clientY - game.getPuzzleSize(1 / 2) + window.pageYOffset) + 'px';
            this.puzzleDiv.style.left = (e.clientX - game.getPuzzleSize(1 / 2) + window.pageXOffset) + 'px';
            let fits = this.checkForLock(e);
            if (fits) {
                this.puzzleDiv.classList.add('--it-fits');
            } else {
                this.puzzleDiv.classList.remove('--it-fits');
            }
        }
    }

    stopDragging(e) {
        this.puzzleDiv.removeEventListener('mousemove', this.whileDragging);
        this.puzzleDiv.classList.remove('--dragged', '--it-fits');
        this.isDraggable = false;
        if (this.checkForLock(e)) {
            this.puzzleDiv.classList.add('--fitted');
            this.puzzleDiv.style.top = this.getReferencePoints(e.target.id).top + 'px';
            this.puzzleDiv.style.left = this.getReferencePoints(e.target.id).left + 'px';
            if (!this.isLocked) {
                game.score += 1;
                game.checkScore();
            }
            this.isLocked = true;
        }
    }

    checkForLock(e) {
        const refPoints = this.getReferencePoints(e.target.id);
        // snap puzzle to its origin
        const snapRange = 18;
        const elementIsWithinDropZone =
            (refPoints.left - e.target.offsetLeft <= snapRange &&
                refPoints.left - e.target.offsetLeft >= -snapRange) &&
            (refPoints.top - e.target.offsetTop <= snapRange &&
                refPoints.top - e.target.offsetTop >= -snapRange);
        return elementIsWithinDropZone;
    }

    getReferencePoints(puzzleId) {
        const puzzle = game.puzzles[puzzleId];
        const { positionY, positionX } = puzzle;
        const { offsetTop, offsetLeft } = game.gameContainer;
        
        const top = offsetTop + positionY;
        const left = offsetLeft + positionX;

        return {top, left};
    }
}

//initial setup
let size = 512; //experimental - feel free to fiddle with
let collection = ['1223439', '582659', '289662']; //[aerials, faces, outdoors] (not implemented yet)
function getRand(collection) {
    return collection[(Math.floor(Math.random() * collection.length))];
}

// execution
let game;
// (function () {
//     return new Promise((resolve) => {
//         let answer = prompt('Please enter difficulty (1-7, default: 3)', 3);
//         if (answer > 1 && answer < 8) {
//             resolve(answer);
//         } else {
//             alert(`Don't be ridiculous, "${answer}" is not valid! Giving you defaults...`);
//             resolve(3);
//         }
//     }).then(selection => {

//         game = new GameApp(selection, size, getRand(collection));
//         game.init();
//     });
// })();

game = new GameApp(2, size, getRand(collection));
game.init();