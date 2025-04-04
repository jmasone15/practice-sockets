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
app.use('/game', express.static(path.join(__dirname, 'public/game.html')));

// Create HTTP server and setup WebSocket
const server = http.createServer(app);
setupWebSocket(server);

// Start the server
server.listen(PORT, () => {
	console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
