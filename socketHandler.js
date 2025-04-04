import { WebSocketServer } from 'ws';

const setupWebSocket = (server) => {
	// Create WebSocket server off of HTTP server
	const wss = new WebSocketServer({ server });

	// WebSocket connection logic
	wss.on('connection', (socket) => {
		// Connection
		console.log('✅ New WebSocket connection');
		socket.send('Hello from WebSocket server!');

		// Message event
		socket.on('message', (message) => {
			console.log(`📨 Received: ${message}`);
		});

		// Disconnection
		socket.on('close', () => {
			console.log('❌ WebSocket client disconnected');
		});
	});
};

export default setupWebSocket;
