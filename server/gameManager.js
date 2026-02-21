class GameManager {
    constructor() {
        this.rooms = new Map();
    }

    createRoom(roomId) {
        if (this.rooms.has(roomId)) return false;
        this.rooms.set(roomId, {
            players: [],
            gameState: 'waiting', // waiting, playing, gameOver
            turnIndex: 0,
            numbersStruck: [],
            winner: null
        });
        return true;
    }

    joinRoom(roomId, player) {
        const room = this.rooms.get(roomId);
        if (!room) return { error: 'Room not found' };
        if (room.players.length >= 2) return { error: 'Room full' };

        // Generate grid for player
        const grid = this.generateGrid();
        const newPlayer = {
            ...player,
            grid,
            bingoCount: 0,
            bingoLetters: ''
        };

        room.players.push(newPlayer);

        if (room.players.length === 2) {
            room.gameState = 'playing';
            room.turnIndex = 0; // Player 1 starts
        }

        return { room };
    }

    generateGrid() {
        const nums = Array.from({ length: 25 }, (_, i) => i + 1);
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        // Convert to 5x5 matrix
        const grid = [];
        for (let i = 0; i < 5; i++) {
            grid.push(nums.slice(i * 5, (i + 1) * 5));
        }
        return grid;
    }

    makeMove(roomId, playerId, number) {
        const room = this.rooms.get(roomId);
        if (!room || room.gameState !== 'playing') return { error: 'Invalid room state' };

        const currentPlayer = room.players[room.turnIndex];
        if (currentPlayer.id !== playerId) return { error: 'Not your turn' };

        if (room.numbersStruck.includes(number)) return { error: 'Number already struck' };

        room.numbersStruck.push(number);

        // After a number is struck, calculate BINGO for both players
        room.players.forEach(p => {
            this.updateBingoProgress(p, room.numbersStruck);
        });

        // Check if any player won
        const winner = room.players.find(p => p.bingoCount >= 5);
        if (winner) {
            room.gameState = 'gameOver';
            room.winner = winner.id;
        } else {
            // Alternate turn
            room.turnIndex = (room.turnIndex + 1) % 2;
        }

        return { room };
    }

    updateBingoProgress(player, numbersStruck) {
        let lines = 0;
        const grid = player.grid;

        // Rows
        for (let i = 0; i < 5; i++) {
            if (grid[i].every(num => numbersStruck.includes(num))) lines++;
        }

        // Columns
        for (let j = 0; j < 5; j++) {
            let colComplete = true;
            for (let i = 0; i < 5; i++) {
                if (!numbersStruck.includes(grid[i][j])) {
                    colComplete = false;
                    break;
                }
            }
            if (colComplete) lines++;
        }

        // Diagonals
        let diag1 = true;
        let diag2 = true;
        for (let i = 0; i < 5; i++) {
            if (!numbersStruck.includes(grid[i][i])) diag1 = false;
            if (!numbersStruck.includes(grid[i][4 - i])) diag2 = false;
        }
        if (diag1) lines++;
        if (diag2) lines++;

        player.bingoCount = lines;
        const bingoStr = "BINGO";
        player.bingoLetters = bingoStr.substring(0, Math.min(lines, 5));
    }

    restartGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return { error: 'Room not found' };

        room.gameState = 'playing';
        room.turnIndex = 0;
        room.numbersStruck = [];
        room.winner = null;

        room.players.forEach(p => {
            p.grid = this.generateGrid();
            p.bingoCount = 0;
            p.bingoLetters = '';
        });

        return { room };
    }
}

module.exports = new GameManager();
