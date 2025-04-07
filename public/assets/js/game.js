const socket = new WebSocket(`ws://${location.host}`);

const modalDiv = document.getElementById('name-modal');
const nameInput = document.getElementById('player-name');
const confirmBtn = document.getElementById('confirm-name');
const turnIndicatorDiv = document.getElementById('turn-indicator');
const turnIndicatorSpan = document.getElementById('turn-indicator-text');
const gameCells = document.querySelectorAll('.cell');

let playerSymbol;
let playerName;
let currentTurn = 'X';
let userPlay = false;

confirmBtn.addEventListener('click', (e) => {
	e.preventDefault();

	const name = nameInput.value.trim();

	if (!name) {
		nameInput.focus();
	} else {
		localStorage.setItem('player-name', name);

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

socket.addEventListener('open', () => {
	const name = localStorage.getItem('player-name');

	if (!name) {
		modalDiv.style.display = 'flex';
	} else {
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

		if (playerSymbol === currentTurn) {
			turnIndicatorSpan.textContent = 'Your';
			turnIndicatorDiv.classList.add('green-text');
		} else {
			turnIndicatorSpan.textContent = 'Opponent';
			turnIndicatorDiv.classList.add('red-text');
		}

		console.log(playerSymbol);

		return;
	}

	if (type === 'start') {
		console.log('game start');

		if (playerSymbol === currentTurn) {
			flipUserPlay();
		}

		return;
	}

	if (type === 'move') {
		const targetCell = document.querySelector(
			`[data-cell="${payload.location}"]`
		);

		// Update DOM and Enable User Play
		flipCell(targetCell, payload.symbol);
		flipUserPlay();
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
	cell.classList.add('flipped');
};

gameCells.forEach((cell) => {
	cell.addEventListener('click', () => {
		if (!userPlay || cell.classList.contains('flipped')) {
			return;
		}

		// Disable User Action & Update DOM
		flipUserPlay();
		flipCell(cell, playerSymbol);

		// Send socket message
		socket.send(
			JSON.stringify({
				type: 'move',
				payload: {
					name: playerName,
					symbol: playerSymbol,
					location: cell.getAttribute('data-cell')
				}
			})
		);
	});
});

// const createParticles = (x, y) => {
// 	const container = document.body;
// 	const particleCount = 30;
// 	const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C74B50'];

// 	for (let i = 0; i < particleCount; i++) {
// 		const particle = document.createElement('div');
// 		particle.classList.add('particle');
// 		const color = colors[Math.floor(Math.random() * colors.length)];
// 		particle.style.backgroundColor = color;

// 		// Random directions
// 		const angle = Math.random() * 2 * Math.PI;
// 		const distance = Math.random() * 80 + 20;

// 		const dx = Math.cos(angle) * distance + 'px';
// 		const dy = Math.sin(angle) * distance + 'px';

// 		particle.style.left = `${x}px`;
// 		particle.style.top = `${y}px`;
// 		particle.style.setProperty('--dx', dx);
// 		particle.style.setProperty('--dy', dy);

// 		container.appendChild(particle);

// 		// Remove particle after animation
// 		particle.addEventListener('animationend', () => {
// 			particle.remove();
// 		});
// 	}
// };

// const winningCells = []; // Example win
// winningCells.forEach((index) => {
// 	document.querySelectorAll('.cell')[index].classList.add('winning');
// 	winningCells.forEach((index) => {
// 		const cell = document.querySelectorAll('.cell')[index];
// 		const rect = cell.getBoundingClientRect();
// 		const x = rect.left + rect.width / 2;
// 		const y = rect.top + rect.height / 2;
// 		createParticles(x, y);
// 	});
// });
