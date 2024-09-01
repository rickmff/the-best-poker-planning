import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import shortUuid from 'short-uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const http = createServer(app);
const io = new Server(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    path: '/socket.io'
});

interface Player {
    id: string;
    name: string;
    roomId: string;
    vote?: string;
}

interface Ticket {
    id: string;
    roomId: string;
    votingOn: boolean;
    score?: number;
}

let players: Player[] = [];
let tickets: Ticket[] = [];

// keeping the connection alive
setInterval(() => {
    io.emit('ping');
    logRooms();
}, 8000);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

console.log(process.env.ORIGIN);
http.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
});

// Add this before your other routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ORIGIN || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

io.on('connection', (socket: Socket) => {
    console.log('A user connected', socket.id);
    let roomId = socket.handshake.query['roomId'] as string;
    if (!roomId) {
        roomId = shortUuid.generate();
        socket.emit('room', roomId);
    }
    socket.join(roomId);

    players.push({id: socket.id, name: '', roomId: roomId});

    socket.on('name', (name: string) => {
        let player = players.find(p => p.id == socket.id);
        console.log(`User entered name ${name}`);
        if (player) {
            console.log(`Changing name from ${player.name} to ${name}`)
            player.name = name;
        }
        updateClientsInRoom(roomId);
    });

    socket.on('vote', (vote: string) => {
        let player = players.find(p => p.id == socket.id);
        if (player) {
            player.vote = vote;
        }
        console.log(`Player ${player?.name} voted ${player?.vote}`);

        const playersInRoom = players.filter(p => p.roomId == roomId);
        if (playersInRoom.every(p => p.vote)) {
            showVotes(roomId);
        }
        updateClientsInRoom(roomId);
    });

    socket.on('show', () => {
        showVotes(roomId);
    });

    socket.on('restart', () => {
        restartGame(roomId);
    });

    socket.on('ticket', (updatedTickets: Ticket[]) => {
        tickets = tickets.filter(ticket => ticket.roomId !== roomId);
        for (const ticket of updatedTickets) {
            ticket.roomId = roomId;
        }
        if (updatedTickets.length === 1) {
            updatedTickets[0].votingOn = true;
        }

        tickets.push(...updatedTickets)
        updateClientsInRoom(roomId);
    });

    socket.on('disconnect', () => {
        const player = players.find(player => player.id === socket.id);
        console.log(`Player ${player?.name} has disconnected`);
        players = players.filter(player => player.id !== socket.id);
        updateClientsInRoom(roomId);
    });

    // keeping the connection alive
    socket.on('pong', () => {
        let player = players.find(p => p.id == socket.id);
    })
});

function updateClientsInRoom(roomId: string): void {
    const roomPlayers = players.filter(p => p.roomId == roomId);
    const roomTickets = tickets.filter(p => p.roomId == roomId);
    io.to(roomId).emit('update', {
        players: roomPlayers,
        tickets: roomTickets
    });
}

function restartGame(roomId: string): void {
    const roomPlayers = players.filter(p => p.roomId == roomId);
    const roomTickets = tickets.filter(p => p.roomId == roomId);
    roomPlayers.forEach(p => p.vote = undefined);

    const ticketVotingOn = roomTickets.find(f => f.votingOn);
    if (!(ticketVotingOn && !ticketVotingOn.score)) {
        roomTickets.forEach(p => p.votingOn = false);
        const ticketToVoteOn = roomTickets.find(t => !t.score);
        if (ticketToVoteOn) {
            ticketToVoteOn.votingOn = true;
        }
    }
    console.log(`Restarted game with Players: ${roomPlayers.map(p => p.name).join(", ")}`);
    io.to(roomId).emit('restart');
    io.to(roomId).emit('update', {
        players: roomPlayers,
        tickets: roomTickets
    });
}

function logRooms(): void {
    const rooms = players.map(e => e.roomId);
    if (rooms) {
        for (const room of rooms.filter((val, i, arr) => arr.indexOf(val) == i)) {
            const playersInRoom = players.filter(p => p.roomId == room).map(p => p.name);
            console.log(`Room: ${room} - Players: ${playersInRoom.join(", ")}`);
        }
    }
}

function showVotes(roomId: string): void {
    const roomTickets = tickets.filter(p => p.roomId == roomId);

    if (roomTickets) {
        const average = getAverage(roomId);
        const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
        let closest = 0;
        let smallestDiff = Number.MAX_VALUE;
        for (const number of fib) {
            const difference = Math.abs(number - average);
            if (difference < smallestDiff) {
                smallestDiff = difference;
                closest = number;
            }
        }

        const ticket = roomTickets.find(f => f.votingOn);
        if (ticket) {
            ticket.score = closest;
        }
    }

    io.to(roomId).emit('show');
}

function getAverage(roomId: string): number {
    const roomPlayers = players.filter(p => p.roomId == roomId);
    let count = 0;
    let total = 0;
    for (const player of players) {
        if (player.vote && player.vote !== "?") {
            total += parseInt(player.vote);
            count++;
        }
    }
    return total / count;
}