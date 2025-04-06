const createRoomBtn = document.getElementById('create-room');
const joinRoomBtn = document.getElementById('join-room');
const roomCodeInput = document.getElementById('room-code');

// Change to secure for deployment.
const url = `http://${location.host}/game`;

createRoomBtn.addEventListener('click', async (e) => {
	e.preventDefault();

	const response = await window.fetch('/room/create-room');

	if (!response.ok) throw new Error('oops');
	const roomCode = await response.text();

	window.location.href = `${url}/${roomCode}`;
});

joinRoomBtn.addEventListener('click', (e) => {
	e.preventDefault();

	console.log(roomCodeInput.value);
	if (!roomCodeInput.value) {
		return;
	}

	const newUrl = `${url}/${roomCodeInput.value}`;
	roomCodeInput.value = '';

	window.location.href = newUrl;
});
