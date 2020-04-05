const socket = io();

const vm = new Vue({
    el: '#app',
    data: {
        numPlayers: 0,
        roomId: '',
        roomIdInput: '',
        secret: '',
    },

    methods: {
        joinRoom: function () {
            socket.emit('join room', { roomId: this.roomIdInput });
        },
        leaveRoom: function () {
            socket.emit('leave room', { roomId: this.roomId });
            this.roomId = '';
            this.secret = '';
        },
        newRound: function () {
            socket.emit('new round', { roomId: this.roomId });
        },
        newRoom: function () {
            socket.emit('new room');
        },
    }
});

socket.on('secret', secret => {
    vm.secret = secret;
});

socket.on('room id', roomId => {
    vm.roomId = roomId;
});

socket.on('number of players', numPlayers => {
    vm.numPlayers = numPlayers;
});
