const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameManager = require('./gameManager');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, playerName }) => {
        socket.join(roomId);

        if (!gameManager.rooms.has(roomId)) {
            gameManager.createRoom(roomId);
        }

        const result = gameManager.joinRoom(roomId, { id: socket.id, name: playerName });

        if (result.error) {
            socket.emit('error_msg', result.error);
        } else {
            io.to(roomId).emit('room_update', result.room);
        }
    });

    socket.on('make_move', ({ roomId, number }) => {
        const result = gameManager.makeMove(roomId, socket.id, number);

        if (result.error) {
            socket.emit('error_msg', result.error);
        } else {
            io.to(roomId).emit('room_update', result.room);
        }
    });

    socket.on('restart_game', ({ roomId }) => {
        const result = gameManager.restartGame(roomId);
        if (result.error) {
            socket.emit('error_msg', result.error);
        } else {
            io.to(roomId).emit('room_update', result.room);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Optional: Handle room cleanup or player leaving logic
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
