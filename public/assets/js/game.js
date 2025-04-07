const socket = new WebSocket(`ws://${location.host}`);

const modalDiv = document.getElementById('name-modal');
const nameInput = document.getElementById('player-name');
const confirmBtn = document.getElementById('confirm-name');
const turnIndicatorDiv = document.getElementById('turn-indicator');
const turnIndicatorSpan = document.getElementById('turn-indicator-text');
const currentSymbolSpan = document.getElementById('current-symbol');
const gameCells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset-button');
const resultMessage = document.getElementById('result-message');

let playerSymbol;
let playerName;
let moveCount = 0;
let userPlay = false;
let playerWin = false;
let winningCells = [];

confirmBtn.addEventListener('click', (e) => {
	e.preventDefault();

	const name = nameInput.value.trim();

	if (!name) {
		nameInput.focus();
	} else {
		localStorage.setItem('player-name', name);
		playerName = name;

		// Trigger fade-out
		modalDiv.classList.add('fade-out');

		// Hide modal after animation ends
		modalDiv.addEventListener(
			'animationend',
			() => {
				modalDiv.style.display = 'none';
			},
			{ once: true }
		);

		socket.send(
			JSON.stringify({
				type: 'join',
				roomId: location.pathname.substring(6),
				payload: {
					name
				}
			})
		);
	}
});

nameInput.addEventListener('keydown', (e) => {
	if (e.key === 'Enter' && modalDiv.style.display !== 'none') {
		console.log('test');
		confirmBtn.click();
	}
});

resetButton.addEventListener('click', (e) => {
	e.preventDefault();

	resetButton.textContent = 'Waiting...';

	socket.send(
		JSON.stringify({
			type: 'reset'
		})
	);
});

socket.addEventListener('open', () => {
	const name = localStorage.getItem('player-name');

	if (!name) {
		modalDiv.style.display = 'flex';
	} else {
		playerName = name;
		socket.send(
			JSON.stringify({
				type: 'join',
				roomId: location.pathname.substring(6),
				payload: {
					name
				}
			})
		);
	}
});

socket.addEventListener('message', (event) => {
	const { type, payload } = JSON.parse(event.data);

	if (type === 'error') {
		console.log('Error ocurred');
		console.log(payload);
		return;
	}

	if (type === 'opponent_left') {
		console.log('you are all alone');

		return;
	}

	if (type === 'joined') {
		playerSymbol = payload.symbol;

		if (playerSymbol === 'X') {
			turnIndicatorSpan.textContent = 'Your';
			turnIndicatorDiv.classList.add('green-text');
			currentSymbolSpan.textContent = 'X';
		} else {
			turnIndicatorSpan.textContent = 'Opponent';
			turnIndicatorDiv.classList.add('red-text');
			currentSymbolSpan.textContent = 'O';
		}

		return;
	}

	if (type === 'start') {
		console.log('game start');

		turnIndicatorDiv.style.display = 'block';

		if (playerSymbol === 'X') {
			flipUserPlay();
		}

		return;
	}

	if (type === 'move') {
		const { location, symbol } = payload;
		const targetCell = document.querySelector(`[data-cell="${location}"]`);
		moveCount++;

		// Update DOM and Enable User Play
		flipCell(targetCell, symbol);
		flipUserPlay();
		switchTurnMessage();
	}

	if (type === 'game-over') {
		const { name, symbol, location, result, cells } = payload;
		const targetCell = document.querySelector(`[data-cell="${location}"]`);

		// Flip over last played cell
		flipCell(targetCell, symbol);
		turnIndicatorDiv.style.display = 'none';

		// Update DOM
		if (result === 'loss') {
			resultMessage.textContent = `You lose! ${name} got three in a row.`;

			// Show losing cells animation
			cells.forEach((cellText) => {
				const cell = document.querySelector(`[data-cell="${cellText}"]`);
				const cellBack = cell.querySelector('.cell-back');
				cellBack.classList.add('losing');
			});
		} else {
			resultMessage.textContent = `It's a tie!`;
		}

		resetButton.classList.remove('d-none');
	}

	if (type === 'reset') {
		const { symbol } = payload;
		console.log(symbol);
		reset(symbol === playerSymbol);
		return;
	}
});

const flipUserPlay = () => {
	userPlay = !userPlay;

	gameCells.forEach((cell) => {
		if (!cell.classList.contains('flipped')) {
			const front = cell.querySelector('.cell-front');
			if (userPlay) {
				front.classList.add('active-cell');
			} else {
				front.classList.remove('active-cell');
			}
		}
	});
};

const flipCell = (cell, symbol) => {
	// Update DOM & Run Animation
	const back = cell.querySelector('.cell-back');
	back.textContent = symbol;

	cell.setAttribute('data-value', symbol);
	cell.classList.add('flipped');
};

const switchTurnMessage = (override) => {
	if (userPlay) {
		turnIndicatorSpan.textContent = 'Your';
		turnIndicatorDiv.setAttribute('class', 'message green-text');
		currentSymbolSpan.textContent = playerSymbol;
	} else {
		turnIndicatorSpan.textContent = 'Opponent';
		turnIndicatorDiv.setAttribute('class', 'message red-text');
		currentSymbolSpan.textContent = playerSymbol === 'X' ? 'O' : 'X';
	}
};

const checkWinScenarios = () => {
	if (moveCount < 5) {
		return;
	}

	const boardMap = [[], [], []];
	gameCells.forEach((cell, index) => {
		const map = {
			element: cell,
			location: cell.getAttribute('data-cell'),
			value: cell.getAttribute('data-value') || null
		};

		if (index < 3) {
			boardMap[0][index] = map;
		} else if (index > 2 && index < 6) {
			boardMap[1][index - 3] = map;
		} else {
			boardMap[2][index - 6] = map;
		}
	});

	const rowCombinations = boardMap.map((row) => row);
	const columnCombinations = [];
	const diagonalCombinations = [
		[boardMap[0][0], boardMap[1][1], boardMap[2][2]],
		[boardMap[0][2], boardMap[1][1], boardMap[2][0]]
	];

	for (let y = 0; y < 3; y++) {
		const colArray = [];

		for (let x = 0; x < 3; x++) {
			colArray.push(boardMap[x][y]);
		}

		columnCombinations.push(colArray);
	}

	const winningCombinations = [
		// Row Wins
		rowCombinations,
		// Column Wins
		columnCombinations,
		// Diagonal Wins
		diagonalCombinations
	];

	winningCombinations.flat().forEach((arr) => {
		const values = arr.map(({ value }) => value);

		if (values.every((x) => x === values[0] && x !== null)) {
			winningCells = arr.map(({ element }) => element);
			return;
		}
	});

	return;
};

const createParticles = (x, y) => {
	const container = document.body;
	const particleCount = 30;
	const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C74B50'];

	for (let i = 0; i < particleCount; i++) {
		const particle = document.createElement('div');
		particle.classList.add('particle');
		const color = colors[Math.floor(Math.random() * colors.length)];
		particle.style.backgroundColor = color;

		// Random directions
		const angle = Math.random() * 2 * Math.PI;
		const distance = Math.random() * 80 + 20;

		const dx = Math.cos(angle) * distance + 'px';
		const dy = Math.sin(angle) * distance + 'px';

		particle.style.left = `${x}px`;
		particle.style.top = `${y}px`;
		particle.style.setProperty('--dx', dx);
		particle.style.setProperty('--dy', dy);

		container.appendChild(particle);

		// Remove particle after animation
		particle.addEventListener('animationend', () => {
			particle.remove();
		});
	}
};

const endGame = (playerWin) => {
	if (playerWin) {
		playerWin = true;

		// Winning Cells animation
		winningCells.forEach((cell) => {
			const cellBack = cell.querySelector('.cell-back');
			cellBack.classList.add('winning');

			const rect = cell.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const y = rect.top + rect.height / 2;
			createParticles(x, y);
		});

		resultMessage.textContent = 'You win! You got three in a row.';
	} else {
		resultMessage.textContent = "It's a tie!";
	}

	// Update DOM
	turnIndicatorDiv.style.display = 'none';
	resetButton.classList.remove('d-none');
};

const userMove = (cell) => {
	// Update game data
	const location = cell.getAttribute('data-cell');
	moveCount++;

	// Disable User Action & Update DOM
	flipUserPlay();
	flipCell(cell, playerSymbol);
	switchTurnMessage();

	// Check win scenarios
	checkWinScenarios();
	if (winningCells.length > 0) {
		socket.send(
			JSON.stringify({
				type: 'game-over',
				payload: {
					name: playerName,
					symbol: playerSymbol,
					location,
					result: 'loss',
					cells: winningCells.map((cell) => cell.getAttribute('data-cell'))
				}
			})
		);

		endGame(true);
		return;
	}

	// Tie scenario
	if (moveCount === 9) {
		socket.send(
			JSON.stringify({
				type: 'game-over',
				payload: {
					name: playerName,
					symbol: playerSymbol,
					location,
					result: 'tie'
				}
			})
		);

		endGame(false);
		return;
	}

	// Send socket message
	socket.send(
		JSON.stringify({
			type: 'move',
			payload: {
				name: playerName,
				symbol: playerSymbol,
				location
			}
		})
	);
};

const reset = (userFirst) => {
	// Reset Game Cells
	gameCells.forEach((cell) => {
		cell.setAttribute('data-value', '');
		cell.setAttribute('class', 'cell');

		const cellFront = cell.querySelector('.cell-front');
		const cellBack = cell.querySelector('.cell-back');

		cellFront.setAttribute(
			'class',
			userFirst ? 'cell-front active-cell' : 'cell-front'
		);
		cellBack.setAttribute('class', 'cell-back');
	});

	// Reset DOM
	resultMessage.textContent = '';
	resetButton.classList.add('d-none');
	resetButton.textContent = 'Play Again?';

	// Reset Game Variables
	moveCount = 0;
	winningCells = [];
	playerWin = false;
	userPlay = userFirst;

	switchTurnMessage();
	turnIndicatorDiv.style.display = 'block';
};

gameCells.forEach((cell) => {
	cell.addEventListener('click', () => {
		if (userPlay && !cell.classList.contains('flipped')) {
			userMove(cell);
		}

		return;
	});
});
