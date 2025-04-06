const socket = new WebSocket(`ws://${location.host}`);

socket.addEventListener('open', () => {
	socket.send(location.pathname.substring(6));
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
