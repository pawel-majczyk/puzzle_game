class Gameboard {
    constructor(size, boardWidth = 512) {
        this.score = 0;
        this.size = size; // square root of total number of puzzles
        this.maxScore = Math.pow(size, 2);
        this.boardWidth = boardWidth;
        this.puzzles = [];

        this.gamearea = document.getElementById('gamearea');
        this.gameboard = document.createElement('div');

        this.bgimg = './img/puzzle_gray.png'; //temporary hardcoded
        this.gameboard.style.background = `url(${this.bgimg})`;
        this.gameboard.setAttribute('id', 'gameboard');

        this.gamearea.appendChild(this.gameboard);
    }

    createPuzzles() {
        //generate puzzles
        for (let i = 0; i < this.maxScore; i++) {
            let puzzleSize = (this.boardWidth / this.size);
            let posX, posY, currentPosX, currentPosY;

            currentPosX = Math.random() * this.boardWidth; //randomize starting position
            currentPosY = Math.random() * this.boardWidth;

            if (i < this.size) { // temporary - works only for 2x2 gameboards
                posX = 0 + (i * puzzleSize);
                posY = 0;
            } else {
                posX = 0 + (i - this.size) * puzzleSize;
                posY = puzzleSize;
            }
            let puzzle = new Puzzle(posX, posY, currentPosX, currentPosY, puzzleSize);
            this.puzzles.push(puzzle);
        }
        console.log(this.puzzles); //eslint-disable-line
        this.puzzles.forEach(puzzle => {
            this.gameboard.appendChild(puzzle.puzzleDiv);
        });
    }
}

class Puzzle {
    constructor(posX, posY, currentPosX, currentPosY, puzzleSize) {
        const initialOffset = 350;
        this.posX = posX;
        this.posY = posY;
        this.bgimg = './img/puzzle_org.png'; //temporary hardcoded
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
        puzzleDiv.style.border = '1px dotted yellow';
        this.puzzleDiv = puzzleDiv;
        return this;
    }

    move() {
        this.puzzleDiv.style.left = `${this.currentPosX}px`;
        this.puzzleDiv.style.top = `${this.currentPosX+this.initialOffset}px`;
    }

    lock() {
        // if currentPos ~ pos then> set current pos to pos and->
        this.locked = true;
    }

    highlight() {
        this.style.border = '4px solid #6cff6c';
        alert('asd');
    }
}

const game = new Gameboard(2);
game.createPuzzles();

const gameboard = document.querySelector('#gameboard');
const puzzles = document.querySelectorAll('.game__puzzle');
const headings = document.getElementsByTagName('h1');

puzzles.forEach(puzzle => {
    puzzle.addEventListener('mousedown', startDragging);
});

let beingDragged = false;

function startDragging(e) {
    e.preventDefault();
    beingDragged = true;
    this.style.border = '1px solid red';
    this.addEventListener('mousemove', whileDragging);
    this.addEventListener('mouseup', stopDragging);
}

function whileDragging(e) {
    this.style.opacity = 0.5;
    this.style.top = e.clientY - 128 + 'px';
    this.style.left = e.clientX - 128 + 'px';
    showCursorPos(e);
    checkForLock(e);
}

function stopDragging() {
    beingDragged = false;
    this.removeEventListener('mousemove', whileDragging);
    this.style.opacity = 1;
    this.style.border = '1px solid green';
}


function checkForLock(e) {
    console.log(gameboard.offsetLeft - e.target.offsetLeft); //eslint-disable-line
    if (
        (gameboard.offsetLeft - e.target.offsetLeft <= 10 &&
            gameboard.offsetLeft - e.target.offsetLeft >= -10)
        &&
        (gameboard.offsetTop - e.target.offsetTop <= 10 &&
            gameboard.offsetTop - e.target.offsetTop >= -10)
    ) {
        
        e.target.style.border = '4px solid #4F4';
    }
}



function showCursorPos(e) {
    headings[0].innerHTML = `.${e.target.className}#${e.target.id} <br>
    e.clientX = ${e.clientX} e.clientY = ${e.clientY};<br>
     cursor pos: X:${e.offsetX} Y:${e.offsetY} ||${e.target.offsetLeft+e.offsetX}:${e.target.offsetTop+e.offsetY} <br>
    posX:${e.target.offsetLeft}/posY:${e.target.offsetTop}<br>
    calc:<br>
    gameboard.offsetLeft ${gameboard.offsetLeft} <br>
    gameboard.offsetTop ${gameboard.offsetTop} <br>
    e.target.offsetLeft  ${e.target.offsetLeft}<br>
    e.target.offsetTop  ${e.target.offsetTop}<br>
    
    `;
}