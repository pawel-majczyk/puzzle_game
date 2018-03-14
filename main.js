class Gameboard {
    constructor(size, boardWidth = 512) {
        this.score = 0;
        this.size = size; // square root of total number of puzzles
        this.maxScore = Math.pow(size, 2);
        this.boardWidth = boardWidth;
        this.puzzles = [];

        this.gamearea = document.getElementById('gamearea');
        this.gameboard = document.createElement('div');

        this.bgimg = './img/puzzle_gray.png'; //tmp hardcoded
        this.gameboard.style.background = `url(${this.bgimg})`;
        // this.gameboard.style.border = '1px solid yellow';
        this.gameboard.setAttribute('id', 'gameboard');

        this.gamearea.appendChild(this.gameboard);

    }

    createPuzzles() {
        //generate puzzles
        for (let i = 0; i < this.maxScore; i++) {
            let puzzleSize = (this.boardWidth / this.size);
            let posX, posY, currentPosX, currentPosY;

            currentPosX = Math.random() * this.boardWidth;
            currentPosY = Math.random() * this.boardWidth;
            // if (i < this.size) { //tmp - works only in 2x2conf for now
            //     posX = puzzleSize * i;
            //     posY = 0;
            //     currentPosX = 0; //(Math.random() * (this.boardWidth));
            //     currentPosY = 0; // ((Math.random() * (this.puzzleSpacing)) + -250);
            // } else {
            //     posX = puzzleSize * i;
            //     posY = puzzleSize;
            //     currentPosX = 0; //(Math.random() * (this.boardWidth));
            //     currentPosY = 0; //((Math.random() * (this.puzzleSpacing)) + -250);
            // }
            if (i < this.size) {
                posX = 0 + (i*puzzleSize);
                posY = 0;
            } else {
                posX = 0 + (i-this.size)*puzzleSize;
                posY = puzzleSize;
            }


            let puzzle = new Puzzle(posX, posY, currentPosX, currentPosY, puzzleSize);
            this.puzzles.push(puzzle);
        }
        this.puzzles.forEach(puzzle => {
            this.gameboard.appendChild(puzzle);
        });
    }
}

class Puzzle {
    constructor(posX, posY, currentPosX, currentPosY, puzzleSize) {
        const initialOffset = 350;
        this.posX = posX;
        this.posY = posY;
        this.bgimg = './img/puzzle_org.png'; //tmp hardcoded
        this.currentPosX = currentPosX;
        this.currentPosY = currentPosY + initialOffset;
        this.locked = false;

        const puzzleDiv = document.createElement('div');
        puzzleDiv.className = 'game__puzzle';
        puzzleDiv.style.left = `${this.currentPosX}px`;
        puzzleDiv.style.top = `${this.currentPosY}px`;
        puzzleDiv.style.background = `url(${this.bgimg})`;
        puzzleDiv.style.backgroundPositionX = `${posX}px`;
        puzzleDiv.style.backgroundPositionY = `${posY}px`;
        puzzleDiv.style.width = `${puzzleSize}px`;
        puzzleDiv.style.height = `${puzzleSize}px`;
        // puzzleDiv.style.display = 'none';
        puzzleDiv.style.border = '1px dotted yellow';

        return puzzleDiv;
    }

    move() {
        this.puzzleDiv.style.left = `${this.currentPosX}px`;
        this.puzzleDiv.style.top = `${this.currentPosX+this.initialOffset}px`;
    }

    lock() {
        // if currentPos ~ pos then> set current pos to pos and->
        this.locked = true;
    }
}

//class GameInterface

// create game instance
const game = new Gameboard(2);
game.createPuzzles();



// event handling
const gameboard = document.querySelector('#gamearea');
const puzzles = document.querySelectorAll('.game__puzzle');


gameboard.addEventListener('mousemove', showCursorPos);
puzzles[0].addEventListener('mousemove', showCursorPos);

function showCursorPos(e) {
    headings[0].innerHTML = `cursor pos: X:${e.offsetX} Y:${e.offsetY}<br>
    .${e.target.className}#${e.target.id}`;
}

// temp
const headings = document.getElementsByTagName('h1');