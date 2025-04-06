import { WebSocketServer } from 'ws';
import { Router } from 'express';
import { nanoid } from 'nanoid';

const rooms = new Map();
const router = new Router();

router.get('/create-room', (req, res) => {
	let roomCode = nanoid();
	let generateCounter = 0;

	while (rooms.has(roomCode)) {
		if (generateCounter < 10) {
			res.status(500).send('Error generating room.');
			return;
		}

		roomCode = nanoid();
		generateCounter++;
	}

	res.status(200).send(roomCode);
});

export const setupWebSocket = (server) => {
	// Create WebSocket server off of HTTP server
	const wss = new WebSocketServer({ server });

	// WebSocket connection logic
	wss.on('connection', (socket) => {
		let currentRoom = null;

		// Connection
		console.log('✅ New WebSocket connection');

		socket.on('message', (data) => {
			console.log(data.toString());
		});

		// Disconnection
		socket.on('close', () => {
			console.log('❌ WebSocket client disconnected');
		});
	});
};

export default router;
