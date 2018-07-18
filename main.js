'use strict';
class GameApp {
    constructor(numOfPuzzles, boardWidth = 512, collectionId) {
        this.collectionId = collectionId;
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
        let self = this;
        this.puzzleImage = (function getPicture(boardWidth, collectionId) {
            console.log('collectionId :', collectionId); //eslint-disable-line
            fetch(`https://source.unsplash.com/random/${boardWidth}x${boardWidth}`)
                .then(imgData => imgData.url)
                .then(url =>
                    self.createPuzzles(url));
        })(boardWidth, collectionId);



    }


    createPuzzles(puzzleImage) {
        //generate puzzles
        for (let i = 0; i < this.maxScore; i++) {
            let puzzleSize = (this.boardWidth / this.numOfPuzzles);
            this.puzzleSize = puzzleSize;
            let posX, posY, currentPosX, currentPosY;
            let id = i;
            currentPosX = Math.random() * this.boardWidth; //randomize starting position
            currentPosY = Math.random() * this.boardWidth;

            /** Calculate origns of each puzzle
             * values below are later used to determine background offset
             * @param {number} posX - puzzle origin position on horizontal axis
             * @param {number} posY - puzzle origin position on vertical axis
             */
            posX = (i % Math.sqrt(this.maxScore)) * puzzleSize;
            posY = (Math.floor(i / Math.sqrt(this.maxScore))) * puzzleSize;
            // console.log(`id: ${id} | posX/Y:${posX}/${posY}`); 

            let puzzle = new Puzzle(id, posX, posY, currentPosX, currentPosY, puzzleSize, puzzleImage);
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
    constructor(id, posX, posY, currentPosX, currentPosY, puzzleSize, puzzleImage) {
        const initialOffset = 125;
        this.posX = posX;
        this.posY = posY;
        this.puzzleSize = puzzleSize;
        this.puzzleImage = puzzleImage;
        this.currentPosX = currentPosX;
        this.currentPosY = currentPosY + initialOffset;
        this.locked = false;
        // create puzzle element
        const puzzleDiv = document.createElement('div');
        puzzleDiv.className = 'game__puzzle';
        puzzleDiv.id = id;
        puzzleDiv.style.left = `${this.currentPosX}px`;
        puzzleDiv.style.top = `${this.currentPosY}px`;
        puzzleDiv.style.background = `url(${this.puzzleImage})`;
        puzzleDiv.style.backgroundPositionX = `${-posX}px`;
        puzzleDiv.style.backgroundPositionY = `${-posY}px`;
        puzzleDiv.style.width = `${puzzleSize}px`;
        puzzleDiv.style.height = `${puzzleSize}px`;
        //add eventhandlers
        puzzleDiv.addEventListener('mousedown', this.startDragging);
        puzzleDiv.addEventListener('mousemove', this.whileDragging);
        puzzleDiv.addEventListener('mouseup', this.stopDragging);
        puzzleDiv.addEventListener('mouseleave', this.stopDragging);

        this.puzzleDiv = puzzleDiv;
    }

    startDragging(e) {
        e.preventDefault(); //disable OLE/ActiveX
        this.classList.add('--dragged');
        Puzzle.checkForLock(e);
        if (!this.locked) {
            this.draggabble = true;
        }
    }

    whileDragging(e) {
        if (this.draggabble) {
            this.style.top = (e.clientY - game.getPuzzleSize(1 / 2) + window.pageYOffset) + 'px';
            this.style.left = (e.clientX - game.getPuzzleSize(1 / 2) + window.pageXOffset) + 'px';
            let fits = Puzzle.checkForLock(e);
            if (fits) {
                this.classList.add('--it-fits');
            } else {
                this.classList.remove('--it-fits');
            }
        }
    }

    stopDragging(e) {
        this.removeEventListener('mousemove', this.whileDragging);
        this.classList.remove('--dragged', '--it-fits');
        this.draggabble = false;
        if (Puzzle.checkForLock(e)) {
            this.classList.add('--fitted');
            this.style.top = Puzzle.getRefPoints(this.id).top + 'px';
            this.style.left = Puzzle.getRefPoints(this.id).left + 'px';
            if (!this.locked) {
                game.score += 1;
                game.checkScore();
            }
            this.locked = true;
        }
    }

    static checkForLock(e) {
        let correctSpot = false;
        const refPoints = Puzzle.getRefPoints(e.target.id);
        // snap puzzle to its origin
        const snapRange = 18;
        const elementIsWithinDropZone =
            (refPoints.left - e.target.offsetLeft <= snapRange &&
                refPoints.left - e.target.offsetLeft >= -snapRange) &&
            (refPoints.top - e.target.offsetTop <= snapRange &&
                refPoints.top - e.target.offsetTop >= -snapRange);
        if (elementIsWithinDropZone) {
            correctSpot = true;
        } else {
            correctSpot = false;
        }
        return correctSpot;
    }

    static getRefPoints(targetId) {
        let references = {};
        references.top = game.gameContainer.offsetTop + game.puzzles[targetId].posY;
        references.left = game.gameContainer.offsetLeft + game.puzzles[targetId].posX;
        return references;
    }


}

//initial setup
let size = 512; //experimental
let collection = ['1223439', '582659', '289662']; //[aerials, faces, outdoors] (not implemented yet)

function getRand(collection) {
    return collection[(Math.floor(Math.random() * collection.length))];
}


// execution
let game;
(function () {
    return new Promise((resolve) => {
        let answer = prompt('Please enter difficulty (1-7, default: 3)', 3);
        if (answer > 1 && answer < 8) {
            resolve(answer);
        } else {
            alert(`Don't be ridiculous, "${answer}" is not valid! Giving you defaults...`);
            resolve(2);
        }
    }).then(selection => {

        game = new GameApp(selection, size, getRand(collection));
        game.init();
    });
})();