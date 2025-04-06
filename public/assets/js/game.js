const socket = new WebSocket(`ws://${location.host}`);

const modalDiv = document.getElementById('name-modal');
const nameInput = document.getElementById('player-name');
const confirmBtn = document.getElementById('confirm-name');
const turnIndicatorDiv = document.getElementById('turn-indicator');
const turnIndicatorSpan = document.getElementById('turn-indicator-text');

let playerSymbol;
let currentTurn = 'X';

confirmBtn.addEventListener('click', (e) => {
	e.preventDefault();

	const name = nameInput.value.trim();

	if (!name) {
		nameInput.focus();
	} else {
		// localStorage.setItem('player-name', name);

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
	}

	if (type === 'start') {
		console.log('game start');
	}
});

// document.querySelectorAll('.cell').forEach((cell) => {
// 	cell.addEventListener('click', () => {
// 		if (!cell.classList.contains('flipped')) {
// 			const back = cell.querySelector('.cell-back');
// 			back.textContent = Math.random() > 0.5 ? 'X' : 'O';
// 			cell.classList.add('flipped');
// 		}
// 	});
// });

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
