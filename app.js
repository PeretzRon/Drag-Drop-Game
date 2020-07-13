Date.prototype.addMinutes = function (minutes) {
    this.setMinutes(this.getMinutes() + minutes);
    return this;
};

Date.prototype.addMilliseconds = function (milliseconds) {
    this.setMilliseconds(this.getMilliseconds() + milliseconds);
    return this;
};

let isAllowToDragItems = false;
let isGamePause = false;
let isDropSuccess = false;
let isElementBShow = false;
let userScore = 0;
let timerTimeout;
let roundCycleInterval;
let dragItemSecondsInterval;
let overallTimeInMillisecond;
let currentDragItem; // detect which element (A/B) was dragged
let gameTime;
let offsetToAddWhenTimePause;
let roundCycleTime;
let offsetToAddRoundCycle;
const gameTimeInMinutes = 10; // 10 minuets

const dragItemA = document.getElementById('elementA');
const dragItemB = document.getElementById('elementB');
const dropZone = document.querySelector('.drop-zone');
const btnPlayPause = document.querySelector('.control-time');
const timeLeftToDrag = document.querySelector('.drag-item-left-time');
const timeLeftForTheGame = document.getElementById("count-down-timer");

dragItemA.addEventListener('dragstart', onDragStart);
dragItemA.addEventListener('dragend', onDragEnd);
dragItemB.addEventListener('dragstart', onDragStart);
dragItemB.addEventListener('dragend', onDragEnd);
dropZone.addEventListener('dragenter', onDragenter);
dropZone.addEventListener('dragover', onDragover);
dropZone.addEventListener('drop', onDrop);

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
let randomTimeElementB = getRandom(20, 30); // element B will show every 20-30 seconds

function onDragStart() {
    currentDragItem = this;
    if (isAllowToDragItems && !isGamePause) {
        this.classList.add('drag-start'); // reducing opacity during dragging
        this.classList.remove('cancel-drag');
        setTimeout(() => {
            this.classList.add('invisible');
        }, 0);
    } else {
        this.classList.add('cancel-drag');
    }
}

function onDragEnd() {
    dragItemA.id === 'elementA' ? this.classList.remove('invisible') : '';
    this.classList.remove('drag-start');
    this.classList.remove('cancel-drag');
}

function onDragenter(event) {
    if (isAllowToDragItems) {
        event.preventDefault();
        currentDragItem.classList.remove('cancel-drag');
    } else {
        currentDragItem.classList.remove('cancel-drag');
    }
}

function onDragover(event) {
    if (isAllowToDragItems) {
        event.preventDefault();
        currentDragItem.classList.remove('cancel-drag');
    } else {
        currentDragItem.classList.remove('cancel-drag');
    }
}

const blinkDropZone = (dropZone, color) => {
    dropZone.classList.add(`blink-${color}`);
    setTimeout(() => {
        dropZone.classList.remove(`blink-${color}`);
    }, 2000);
};

// calculate how many points need to be raised or lowered + blink the drop zone accordingly
const getPointsAfterDropAndBlinkDropZone = () => {
    let points;
    if (isElementBShow && currentDragItem.id === 'elementB') {
        // element B appears on the screen and is also dropped
        points = 2;
        blinkDropZone(dropZone, 'green');
        isElementBShow = false;
        randomTimeElementB = getRandom(10, 17) + Math.floor(overallTimeInMillisecond / 1000);
    } else if (isElementBShow && currentDragItem.id === 'elementA') {
        // element B appears on the screen and element A is dropped
        points = -4;
        blinkDropZone(dropZone, 'red');
    } else {
        // element B not appears on the screen and element A is dropped
        points = 1;
        blinkDropZone(dropZone, 'green');
    }

    return points;
};

function onDrop(event) {
    event.preventDefault();
    if (isAllowToDragItems) {
        isDropSuccess = true;
        currentDragItem.classList.add('center'); // center the element inside the drop zone
        currentDragItem.classList.add('cancel-drag');
        this.append(currentDragItem);
        userScore += getPointsAfterDropAndBlinkDropZone(); // get how much need to add/sub and blink the drop zone
        updateScoreGameUI(userScore);
        if (userScore >= 10) {
            gameOver('won'); // user won -> game over
        }

    } else {
        currentDragItem.classList.remove('cancel-drag');
    }
}

const millisToMinutesAndSeconds = milliseconds => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return (seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
};

// the global time left to play
const countdown = () => {
    timerTimeout = setInterval(function () {
        if (!isGamePause) {
            const timeInMilliseconds = offsetToAddWhenTimePause + gameTime.getTime() - new Date().getTime();
            timeLeftForTheGame.innerHTML = millisToMinutesAndSeconds(timeInMilliseconds);
            // If the count down is finished
            if (timeInMilliseconds < 0) {
                gameOver('lost');
            }
        }
    }, 10);
};

const initializeTimers = () => {
    gameTime = new Date().addMinutes(gameTimeInMinutes).addMilliseconds(500); // set the global countdown for X min
    offsetToAddRoundCycle = 0;
    offsetToAddWhenTimePause = 0;
    roundCycleTime = new Date();
};

// event listener when the user clicks on start game
document.getElementById('start-game-btn').addEventListener('click', () => {
    initializeTimers();
    document.querySelector('.alert').classList.add('invisible');
    dragItemA.classList.remove('invisible');
    countdown();
    roundCycle();
});

// event listener when the user pause/start again the game
btnPlayPause.addEventListener('click', () => {
    const elem = document.querySelector('.icon-play-pause');
    isAllowToDragItems = !isAllowToDragItems;
    document.getElementById('main').style.userSelect = 'none';
    isGamePause = !isGamePause;
    if (isGamePause) {
        offsetToAddWhenTimePause -= new Date().getTime() - gameTime.getTime();
        offsetToAddRoundCycle += new Date().getTime() - roundCycleTime.getTime();
        elem.classList.replace('fa-pause', 'fa-play');
    } else {
        gameTime = new Date();
        roundCycleTime = new Date();
        elem.classList.replace('fa-play', 'fa-pause');
    }
});

// update the score on UI
const updateScoreGameUI = (updateScore) => {
    const score = document.getElementById('score');
    score.innerHTML = `score: ${updateScore}`;
};

// clear all intervals from memory
const cleanUpTimers = () => {
    clearInterval(timerTimeout);
    clearInterval(roundCycleInterval);
    clearInterval(dragItemSecondsInterval);
};

const cleanUpUI = () => {
    // disable buttons, drag items, make items invisible.
    timeLeftToDrag.innerHTML = '';
    timeLeftForTheGame.innerText = '0:00';
    isAllowToDragItems = false;
    dragItemA.classList.add('invisible');
    dragItemB.classList.add('invisible');
    btnPlayPause.style.pointerEvents = 'none';
};

const gameOver = (message) => {
    cleanUpTimers();
    cleanUpUI();
    showMassageGameOver(message);
};

const showMassageGameOver = (message) => {
    const icon = message === 'won' ? 'fa-smile-wink' : 'fa-frown'; // icon smile or sad
    const markup = `
    <div class="alert">
        <h1>Game Over</h1>
        <p>You ${message}!!</p>
        <span class="fas ${icon} icon-alert"></span>
    </div>`;
    document.querySelector('.main').insertAdjacentHTML('afterbegin', markup);
};

// Display how many seconds are left to drag the item
const showLeftTimeToDragItem = (count) => {
    return setInterval(() => {
        if (!isGamePause) {
            timeLeftToDrag.innerHTML =
                `<span class="number-time-left">
                    ${count - Math.floor((overallTimeInMillisecond / 1000))}
                </span> second left to drag the element`;
        }
    }, 10);
};

// Reposition the items in a different location
const setRandomPosition = (element) => {
    element.classList.remove('center');
    element.style.left = getRandom(10, 90) + '%'; // Horizontally
    element.style.top = getRandom(20, 50) + '%'; // Vertically
};

const removeElementB = () => dragItemB.classList.add('invisible');
const showElementB = () => {
    isElementBShow = true;
    dragItemB.classList.remove('invisible');
    setRandomPosition(dragItemB);
};

// every 4 seconds perform this function
const fourSecondsInterval = (counterFourSeconds) => {
    counterFourSeconds += 4; // prevent from this condition to run again and again because the interval set to 10ms
    isAllowToDragItems = !isAllowToDragItems; // allow/disallow to drag the items
    if (isAllowToDragItems) {
        timeLeftToDrag.style.opacity = '1';
        dragItemSecondsInterval = showLeftTimeToDragItem(counterFourSeconds); // show how much time left to drag the item
    } else {
        clearInterval(dragItemSecondsInterval);
        timeLeftToDrag.innerHTML = '<span class="number-time-left">4</span> second left to drag the element';
        timeLeftToDrag.style.opacity = '0.2';
    }

    return counterFourSeconds;
};

// every 8 seconds perform this function
const eightSecondsInterval = (counterEightSeconds) => {
    counterEightSeconds += 8; // prevent from this condition to run again and again because the interval set to 10ms
    currentDragItem ? document.getElementById('main').append(currentDragItem) : '';
    dropZone.innerHTML = '';
    setRandomPosition(dragItemA); // relocate element A
    if (!isElementBShow) {
        removeElementB();
    }
    if (!isDropSuccess) {
        // pass 8 second and the user didn't do anything (lose 1 point)
        userScore -= 1;
        updateScoreGameUI(userScore);
        blinkDropZone(dropZone, 'red');
    } else {
        isDropSuccess = false;
    }

    return counterEightSeconds;
};

// Perform actions every 4 , 8 seconds and random time to element B
const roundCycle = () => {
    let counterFourSeconds = 4;
    let counterEightSeconds = 8;

    roundCycleInterval = setInterval(function () {
        if (!isGamePause) {
            overallTimeInMillisecond = offsetToAddRoundCycle + (new Date()).getTime() - roundCycleTime.getTime();

            // if true => pass 4 second
            if (Math.floor((overallTimeInMillisecond / 1000) % 4) === 0 && Math.floor(overallTimeInMillisecond / 1000) !== 0 && counterFourSeconds === Math.floor((overallTimeInMillisecond / 1000))) {
                counterFourSeconds = fourSecondsInterval(counterFourSeconds);
            }
            // if true => pass 8 second
            if (Math.floor((overallTimeInMillisecond / 1000) % 8) === 0 &&
                counterEightSeconds === Math.floor((overallTimeInMillisecond / 1000))) {
                counterEightSeconds = eightSecondsInterval(counterEightSeconds);
            }
            // if true => show element B on UI
            if (Math.floor((overallTimeInMillisecond / 1000) % randomTimeElementB) === 0 && Math.floor(overallTimeInMillisecond / 1000) !== 0 && !isElementBShow) {
                showElementB();
            }
        }
    }, 10);
};


