const socket = io();

document.getElementById('new-round').addEventListener('click', () => {
    socket.emit('new round');
});

socket.on('secret', secret => {
    document.getElementById('secret').textContent = secret;
});

socket.on('number of players', numPlayers => {
    document.getElementById('num-players').textContent = numPlayers;
});
