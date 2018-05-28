class Gameboard {
    constructor(size, boardWidth = 512) {
        this.score = 0;
        this.size = size; // square root of total number of puzzles
        this.maxScore = Math.pow(size, 2);
        this.boardWidth = boardWidth;
        this.puzzles = [];
        this.gameApp = document.getElementById('game_app');
        this.gameboard = document.createElement('div');
        this.gameboard.setAttribute('id', 'gameboard');
        this.gameApp.appendChild(this.gameboard);
        this.createPuzzles();
        this.setBackground();
    }
    static getPicture() {
        if (!this.bgimage) {
            this.bgimage = 'https://source.unsplash.com/random/512x512';
            return this.bgimage;
        } else {
            return this.bgimage;
        }
    }

    setBackground() {
        this.bgimage = 'https://source.unsplash.com/random/512x512';
        // this.gameboard.style.background = `url(${this.bgimage})`; //to-do with filter
    }

    createPuzzles() {
        //generate puzzles
        for (let i = 0; i < this.maxScore; i++) {
            let puzzleSize = (this.boardWidth / this.size);
            let posX, posY, currentPosX, currentPosY;
            let id = i;
            currentPosX = Math.random() * this.boardWidth; //randomize starting position
            currentPosY = Math.random() * this.boardWidth;

            if (i < this.size) { // temporary - works only for 2x2 gameboards
                posX = 0 + (i * puzzleSize);
                posY = 0;
            } else {
                posX = 0 + (i - this.size) * puzzleSize;
                posY = puzzleSize;
            }
            let puzzle = new Puzzle(id, posX, posY, currentPosX, currentPosY, puzzleSize);
            this.puzzles.push(puzzle);
        }
        this.puzzles.forEach(puzzle => {
            this.gameboard.appendChild(puzzle.puzzleDiv);
        });
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
        const initialOffset = 25;
        this.posX = posX;
        this.posY = posY;
        this.currentPosX = currentPosX;
        this.currentPosY = currentPosY + initialOffset;
        this.locked = false;

        const puzzleDiv = document.createElement('div');
        puzzleDiv.className = 'game__puzzle';
        puzzleDiv.id = id;
        puzzleDiv.style.left = `${this.currentPosX}px`;
        puzzleDiv.style.top = `${this.currentPosY}px`;
        puzzleDiv.style.background = `url(${Gameboard.getPicture()})`;
        puzzleDiv.style.backgroundPositionX = `${posX}px`;
        puzzleDiv.style.backgroundPositionY = `${posY}px`;
        puzzleDiv.style.width = `${puzzleSize}px`;
        puzzleDiv.style.height = `${puzzleSize}px`;
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
            this.style.top = e.clientY - 128 + 'px';
            this.style.left = e.clientX - 128 + 'px';
            let fits = Puzzle.checkForLock(e);
            if (fits) {
                this.classList.add('--it-fits');
            } else {
                this.classList.remove('--it-fits');
            }
        }
        // showCursorPos(e); //dev utility
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
        references.top = gameboard.offsetTop + game.puzzles[targetId].posY;
        references.left = gameboard.offsetLeft + game.puzzles[targetId].posX;
        return references;
    }


}

const game = new Gameboard(2);
const gameboard = document.querySelector('#gameboard');

//developer utils
// const headings = document.getElementsByTagName('h1');
// function showCursorPos(e) {
//     headings[0].innerHTML = `.${e.target.className}#${e.target.id} <br>
//     e.clientX = ${e.clientX} e.clientY = ${e.clientY};<br>
//      cursor pos: X:${e.offsetX} Y:${e.offsetY} ||${e.target.offsetLeft+e.offsetX}:${e.target.offsetTop+e.offsetY} <br>
//     posX:${e.target.offsetLeft}/posY:${e.target.offsetTop}<br>
//     calc:<br>
//     gameboard.offsetLeft ${gameboard.offsetLeft} <br>
//     gameboard.offsetTop ${gameboard.offsetTop} <br>
//     e.target.offsetLeft  ${e.target.offsetLeft}<br>
//     e.target.offsetTop  ${e.target.offsetTop}<br>

//     `;
// }