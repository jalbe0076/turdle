// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];
let words;

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
const totalGames = document.querySelector('#stats-total-games');
const percentCorrect = document.querySelector('#stats-percent-correct');
const guessAverage = document.querySelector('#stats-average-guesses');
const playedYet = document.querySelector('.played-yet')
var gameOverBox = document.querySelector('#game-over-section');
var gameOverBoxLost = document.querySelector('#game-over-section-loss');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');


// Event Listeners
window.addEventListener('load', function () {
  getData().then(response => {
    words = response;
    setGame();
  })
});

inputs.forEach(input => input.addEventListener('keyup', function() { moveToNextInput(event) }));

keyLetters.forEach(keyLetter => keyLetter.addEventListener('click', function() { clickLetter(event) }));

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function setGame() {
  currentRow = 1;
  winningWord = getRandomWord();
  updateInputPermissions();
  console.log('winning word: ', winningWord);
}

function getRandomWord() {
  var randomIndex = Math.floor(Math.random() * 2500);
  return words[randomIndex];
}

function updateInputPermissions() {
  inputs.forEach(input => {
    if(!input.id.includes(`-${currentRow}-`)) {
      input.disabled = true;
    } else {
      input.disabled = false;
    }
  })

  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode; // keyCode is depreciated and not recommended, keydown

  if( key !== 8 && key !== 46 ) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  inputs.forEach(input => {
    if(input.id.includes(`-${currentRow}-`) && !input.value && !activeInput) {
      activeInput = input;
      activeIndex = i;
    }
  });
  
  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}


function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin() || currentRow > 5) {
      setTimeout(declareWinner, 1000);
    } else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  inputs.forEach(input => {
    if(input.id.includes(`-${currentRow}-`)) {
      guess += input.value;
    }
  });
  
  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  guessLetters.forEach((guess, i) => {
    if (winningWord.includes(guess) && winningWord.split('')[i] !== guess) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guess, 'wrong-location-key');
    } else if (winningWord.split('')[i] === guess) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guess, 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guess, 'wrong-key');
    }
  })

}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  keyLetters.forEach(keyLetter => {
    if (keyLetter.innerText === letter) {
      keyLetter = keyLetter;
    }
  })

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  letterKey.classList.add('hidden');
  recordGameStats();
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}

function recordGameStats() {
  gamesPlayed.push({ solved: checkForWin(), guesses: currentRow });
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('correct-location', 'wrong-location', 'wrong');
  })
}

function clearKey() {
  keyLetters.forEach(keyLetter => {
    keyLetter.classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  })
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed');
  gameOverBoxLost.classList.add('collapsed');
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
  const seeStats = calculateStats();
  totalGames.innerText = `${gamesPlayed.length}`;
  percentCorrect.innerText = `${seeStats.winPercent}`;
  if(!gamesPlayed.length) {
    playedYet.classList.add('collapsed');
  } else {
    playedYet.classList.remove('collapsed');
    guessAverage.innerText = `${seeStats.guessAverage}`;
  }
}

function viewGameOverMessage() {
  gameBoard.classList.add('collapsed');
  if(checkForWin()) {
    gameOverBox.classList.remove('collapsed');
  } else {
    gameOverBoxLost.classList.remove('collapsed');
  }
}

const calculateStats = () => {
  let numberOfWins = 0;
  let totalRounds = 0;
  gamesPlayed.forEach(game => {
    if(game.solved) {
      numberOfWins++;
    }
    totalRounds += game.guesses;
  });
  let guessAverage = Math.floor(totalRounds/gamesPlayed.length);
  let percentageOfWins = Math.floor(numberOfWins/gamesPlayed.length * 100);

  return {winPercent: percentageOfWins || 0, guessAverage: guessAverage || 0};

}

// =========== fetch api's =============

const getData = () => {
  return fetch('http://localhost:3001/api/v1/words')
              .then(response => response.json())
              .catch(err => console.log(err));
}