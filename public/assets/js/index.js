function createFloatingSymbols(count = 50) {
	const symbols = ['X', 'O'];
	const colors = ['#333', '#4D96FF', '#FF6B6B'];

	for (let i = 0; i < count; i++) {
		const symbol = document.createElement('span');
		symbol.classList.add('floating-symbol');

		// Randomize symbol
		symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];

		// Random direction
		if (Math.random() < 0.5) {
			symbol.classList.add('up');
			symbol.style.bottom = `${Math.random() * -100}px`;
		} else {
			symbol.classList.add('down');
			symbol.style.top = `${Math.random() * -100}px`;
		}

		// Random X position
		symbol.style.left = `${Math.random() * 100}%`;

		// Random size & color
		const fontSize = 1 + Math.random() * 4; // 1rem to 5rem
		symbol.style.fontSize = `${fontSize}rem`;
		symbol.style.color = colors[Math.floor(Math.random() * colors.length)];

		// Slightly random animation duration
		const duration = 15 + Math.random() * 15;
		symbol.style.animationDuration = `${duration}s`;

		// Remove the symbol after animation completes
		symbol.addEventListener('animationend', () => {
			symbol.remove();
		});

		document.body.appendChild(symbol);
	}
}

// createFloatingSymbols();

// setInterval(() => {
// 	createFloatingSymbols(10); // Add 5 more every few seconds
// }, 5000);

const toggleBtn = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Load preferred theme
if (
	localStorage.getItem('theme') === 'dark' ||
	(!localStorage.getItem('theme') && prefersDark)
) {
	document.body.classList.add('dark');
	toggleBtn.textContent = '🌚';
} else {
	toggleBtn.textContent = '🌞';
}

toggleBtn.addEventListener('click', () => {
	document.body.classList.toggle('dark');
	const isDark = document.body.classList.contains('dark');

	toggleBtn.textContent = isDark ? '🌚' : '🌞';
	localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
