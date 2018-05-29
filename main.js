class GameApp {
    constructor(numOfPuzzles, boardWidth = 512, collectionId) {
        this.collectionId = collectionId;
        this.score = 0;
        this.numOfPuzzles = numOfPuzzles; // square root of total number of puzzles
        this.maxScore = Math.pow(numOfPuzzles, 2);
        this.boardWidth = boardWidth;
        this.puzzles = [];
        this.gameApp = document.getElementById('game_app');
        this.gameContainer = document.createElement('div');
        this.gameContainer.setAttribute('id', 'gameboard');
        this.gameApp.appendChild(this.gameContainer);
        this.board = document.querySelector('#gameboard');
        //get the image and create puzzles!
        this.createPuzzles();
    }
    static getPicture() {
        if (!this.bgimagae) {
            this.bgimage = 'https://source.unsplash.com/random/512x512';
            return this.bgimage; 
        } else {
            return this.bgimage;
        }
    }
    createPuzzles() {
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
            // console.log(`id: ${id} | posX/Y:${posX}/${posY}`); //eslint-disable-line

            let puzzle = new Puzzle(id, posX, posY, currentPosX, currentPosY, puzzleSize);
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
    constructor(id, posX, posY, currentPosX, currentPosY, puzzleSize) {
        const initialOffset = 125;
        this.posX = posX;
        this.posY = posY;
        this.puzzleSize = puzzleSize;
        this.currentPosX = currentPosX;
        this.currentPosY = currentPosY + initialOffset;
        this.locked = false;
        // create puzzle element
        const puzzleDiv = document.createElement('div');
        puzzleDiv.className = 'game__puzzle';
        puzzleDiv.id = id;
        puzzleDiv.style.left = `${this.currentPosX}px`;
        puzzleDiv.style.top = `${this.currentPosY}px`;
        puzzleDiv.style.background = `url(${GameApp.getPicture()})`;
        puzzleDiv.style.backgroundPositionX = `${-posX}px`;
        puzzleDiv.style.backgroundPositionY = `${-posY}px`;
        puzzleDiv.style.width = `${puzzleSize}px`;
        puzzleDiv.style.height = `${puzzleSize}px`;
        //add eventhandlers
        puzzleDiv.addEventListener('mousedown', this.startDragging);
        puzzleDiv.addEventListener('mousemove', this.whileDragging);
        puzzleDiv.addEventListener('mouseup', this.stopDragging);

        this.puzzleDiv = puzzleDiv;
    }

    startDragging(e) {
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
        references.top = game.board.offsetTop + game.puzzles[targetId].posY;
        references.left = game.board.offsetLeft + game.puzzles[targetId].posX;
        return references;
    }


}

let game;
//initial setup
let size = 512; //danger! not yet implemeted
let collection = ['1223439', '582659', '289662']; //aerials, faces, outdoors

game = new GameApp(2, size, collection);
