// Import external dependencies
import express from 'express';
import setupWebSocket from './socketHandler.js';

// Import required Node packages
import { fileURLToPath } from 'url';
import http from 'http';
import path from 'path';

// Express setup
const app = express();
const PORT = process.env.PORT || 3001;

// Build static asset path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Valid routes
app.get('/game', (req, res) => {
	res.status(200).sendFile(path.join(__dirname, 'public', 'game.html'));
});

app.get('/', (req, res) => {
	res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler should come last
app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, 'public', 'notFound.html'));
});

// Create HTTP server and setup WebSocket
const server = http.createServer(app);
setupWebSocket(server);

// Start the server
server.listen(PORT, () => {
	console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
