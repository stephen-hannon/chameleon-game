const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

// CONSTANTS AND FUNCTIONS //
const PORT = process.env.PORT || 5000;
const COLUMNS = 'ABCD';

const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const randomString = (length = 6, base = 36) => Array(length).fill().map(() => randomInt(0, base).toString(base)).join('');

const emitNumClients = (roomId) => {
	io.to(`room-${roomId}`).clients((error, clients) => {
		if (error) throw error;

		io.to(`room-${roomId}`).emit('number of players', clients.length);
	});
}

// START SERVER //
const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.set('port', PORT);
app.use(express.static('public'));

app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
	console.log(`Starting server on port ${PORT}`);
});

const rooms = new Set();

io.on('connection', socket => {
	console.log(`Client ${socket.id} connected`);

	socket.on('new room', () => {
		const roomId = randomString();
		console.log('Created new room', roomId);
		rooms.add(roomId);
		socket.join(`room-${roomId}`);
		socket.emit('room id', roomId);
		emitNumClients(roomId);
	});

	socket.on('join room', ({ roomId }) => {
		roomId = roomId.trim();
		if (!rooms.has(roomId)) {
			console.error(`Room ${roomId} does not exist`);
			return;
		}

		console.log('Joined room', roomId);
		socket.join(`room-${roomId}`);
		socket.emit('room id', roomId);
		emitNumClients(roomId);
	});

	socket.on('leave room', ({ roomId }) => {
		console.log('Left room room', roomId);
		socket.leave(`room-${roomId}`)
		emitNumClients(roomId);
	});

	socket.on('new round', ({ roomId }) => {
		console.log(`Starting round for room`, roomId);
		console.log('rooms', socket.rooms);

		io.to(`room-${roomId}`).clients((error, clients) => {
			if (error) throw error;

			console.log(clients);
			const chameleon = randomInt(0, clients.length);
			console.log('Chameleon is', chameleon);

			const row = randomInt(1, 5);
			const col = randomInt(0, 4);
			const secret = `${COLUMNS[col]}${row}`;
			console.log('Secret is', secret);

			clients.forEach((client, clientIndex) => {
				const message = (clientIndex === chameleon) ? 'CHAMELEON' : secret;

				io.to(client).emit('secret', message);
			});
		});
	});

	socket.on('disconnect', reason => {
		console.log(`Client ${socket.id} disconnected:`, reason);
		// emitNumClients();
	});
});
