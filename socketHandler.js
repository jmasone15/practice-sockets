import { WebSocketServer } from 'ws';
import { Router } from 'express';
import { nanoid } from 'nanoid';

const rooms = new Map();
export const router = new Router();

// API Routes
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

	rooms.set(roomCode, []);
	res.status(200).send(roomCode);
});

// Websocket Setup
export const setupWebSocket = (server) => {
	// Create WebSocket server off of HTTP server
	const wss = new WebSocketServer({ server });

	// WebSocket connection logic
	wss.on('connection', (socket) => {
		let currentRoomId = null;
		let symbol = null;

		// Connection
		console.log('✅ New WebSocket connection');

		socket.on('message', (data) => {
			const { type, roomId, payload } = JSON.parse(data);

			// Join Event
			if (type === 'join') {
				// Check if room exists
				if (!rooms.has(roomId)) {
					socket.send(
						JSON.stringify({
							type: 'error',
							payload: { code: 'ROOM_NOT_FOUND' }
						})
					);
					return;
				}

				const players = rooms.get(roomId);

				// Check if room is full
				if (players.length === 2) {
					socket.send(
						JSON.stringify({
							type: 'error',
							payload: { code: 'ROOM_FULL' }
						})
					);
					return;
				}

				// Set roomId and update players
				currentRoomId = roomId;
				symbol = players.length === 1 ? 'O' : 'X';
				players.push({
					socket,
					symbol,
					name: payload.name
				});

				// Log and alert user they joined successfully
				console.log(`${payload.name} has joined room ${currentRoomId}`);
				socket.send(JSON.stringify({ type: 'joined', payload: { symbol } }));

				// Start game if room is full
				if (players.length === 2) {
					players.forEach((player) => {
						player.socket.send(
							JSON.stringify({
								type: 'start'
							})
						);
					});
				}

				return;
			}

			// Move Event
			if (type === 'move') {
				const { name, symbol, location } = payload;
				const room = rooms.get(currentRoomId);

				console.log(`${name} played ${symbol} in cell ${location}`);

				room.forEach((player) => {
					if (player.socket !== socket) {
						player.socket.send(
							JSON.stringify({
								type,
								payload
							})
						);
					}
				});

				return;
			}

			return;
		});

		// Disconnection Event
		socket.on('close', () => {
			if (currentRoomId && rooms.has(currentRoomId)) {
				const room = rooms.get(currentRoomId);

				// Find disconnected player data and log
				const disconnectedPlayer = room.filter(
					(player) => player.socket === socket
				)[0];
				console.log(
					`${disconnectedPlayer.name} has left room ${currentRoomId}`
				);

				// Delete Room if no players left
				if (room.length - 1 === 0) {
					console.log(`${currentRoomId} has been deleted`);
					rooms.delete(currentRoomId);
				} else {
					// Alert other player that opponent left the room
					const remainingPlayer = room.filter(
						(player) => player.socket !== socket
					);
					remainingPlayer[0].socket.send(
						JSON.stringify({ type: 'opponent_left' })
					);
					rooms.set(currentRoomId, remainingPlayer);
				}
			}

			console.log('❌ WebSocket client disconnected');
		});
	});
};
