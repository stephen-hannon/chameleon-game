const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const PORT = 5000;
const COLUMNS = 'ABCD';
const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

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

const emitNumClients = () => {
	io.clients((error, clients) => {
		if (error) throw error;

		io.sockets.emit('number of players', clients.length);
	});
}

io.on('connection', socket => {
	console.log(`Client ${socket.id} connected`);
	emitNumClients();

	socket.on('new round', () => {
		console.log(`Starting round`);

		io.clients((error, clients) => {
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
		emitNumClients();
	});
});
