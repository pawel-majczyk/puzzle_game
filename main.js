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
            console.log(this.puzzles[i].posX, this.puzzles[i].posY); //eslint-disable-line
        }
        this.puzzles.forEach(puzzle => {
            this.gameboard.appendChild(puzzle.puzzleDiv);
        });
    }
}

class Puzzle {
    constructor(id, posX, posY, currentPosX, currentPosY, puzzleSize) {
        const initialOffset = 350;
        this.posX = posX;
        this.posY = posY;
        this.bgimg = './img/puzzle_org.png'; //temporary hardcoded
        this.currentPosX = currentPosX;
        this.currentPosY = currentPosY + initialOffset;
        this.locked = false;

        const puzzleDiv = document.createElement('div');
        puzzleDiv.className = 'game__puzzle';
        puzzleDiv.id = id;
        puzzleDiv.style.left = `${this.currentPosX}px`;
        puzzleDiv.style.top = `${this.currentPosY}px`;
        puzzleDiv.style.background = `url(${this.bgimg})`;
        puzzleDiv.style.backgroundPositionX = `${posX}px`;
        puzzleDiv.style.backgroundPositionY = `${posY}px`;
        puzzleDiv.style.width = `${puzzleSize}px`;
        puzzleDiv.style.height = `${puzzleSize}px`;
        puzzleDiv.style.border = '1px dotted yellow';
        this.puzzleDiv = puzzleDiv;
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
let correctSpot = false;

function startDragging(e) {
    e.preventDefault();
    this.style.border = '1px solid red';
    this.style.zIndex = '100'; //move on top, so other puzzles do not block moving
    this.addEventListener('mousemove', whileDragging);
}

function whileDragging(e) {
    beingDragged = true;
    this.style.opacity = 0.5;
    this.style.top = e.clientY - 128 + 'px';
    this.style.left = e.clientX - 128 + 'px';
    showCursorPos(e);
    checkForLock(e);
    this.addEventListener('mouseup', stopDragging);
}

function stopDragging() {
    beingDragged = false;
    this.removeEventListener('mousemove', whileDragging);
    this.style.opacity = 1;
    this.style.zIndex = '10';
    if (correctSpot) {
        this.style.border = 'none';
        console.log(this); //eslint-disable-line

        this.style.top = getRefPoints(this.id).top + 'px';
        this.style.left = getRefPoints(this.id).left + 'px';
        this.style.zIndex = 10;
        this.removeEventListener('mousedown', startDragging);
    } else {
        this.style.border = '2px solid green';
    }
}


function checkForLock(e) {
    let refPoints = getRefPoints(e.target.id);
    if (
        (refPoints.left - e.target.offsetLeft <= 10 &&
            refPoints.left - e.target.offsetLeft >= -10) &&
        (refPoints.top - e.target.offsetTop <= 10 &&
            refPoints.top - e.target.offsetTop >= -10)
    ) {
        e.target.style.border = '2px solid #ccc';
        correctSpot = true;
    } else {
        e.target.style.border = '2px solid brown';
        correctSpot = false;
    }
}

function getRefPoints(targetId) {
    let references = {};
    references.top = gameboard.offsetTop + game.puzzles[targetId].posY;
    references.left = gameboard.offsetLeft + game.puzzles[targetId].posX;
    return references;
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