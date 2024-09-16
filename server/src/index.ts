import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import short from 'short-uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const http = createServer(app);
const io = new Server(http, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
    },
});

setInterval(() => {
    io.emit('ping');
    logRooms();
}, 20000);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

interface Player {
    id: string;
    name: string;
    roomId: string;
    vote?: string | number;
}

interface Ticket {
    id: string;
    roomId: string;
    votingOn: boolean;
    score?: string | number;
}

interface GameType {
    name: string;
    values: (string | number)[];
}

interface RoomGameType {
    id: string;
    gameType: GameType;
    roomId: string;
}

const players: Player[] = [];
let tickets: Ticket[] = [];
const gameTypes: GameType[] = [
    { name: 'Fib', values: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'] },
    { name: 'T-Shirt', values: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '?'] },
    { name: 'Powers of 2', values: [0, 1, 2, 4, 8, 16, 32, 64, '?'] },
];
const roomGameTypes: RoomGameType[] = [];

io.on('connection', (socket: Socket) => {
    console.log('A user connected', socket.id);

    // Add this line to store the roomId for each socket
    let currentRoomId: string | null = null;

    socket.on('createRoom', (data: { id: string }, callback: (response: { success: boolean, error?: string }) => void) => {
        console.log('Creating room:', data.id);
        currentRoomId = data.id || short.generate();
        socket.join(currentRoomId);
        roomGameTypes.push({ id: socket.id, gameType: gameTypes[0], roomId: currentRoomId });
        callback({ success: true });
        console.log('Room created:', currentRoomId);
    });

    socket.on('joinRoom', (data: { id: string, name: string }, callback: (response: { success: boolean, error?: string, player?: Player }) => void) => {
        console.log('Joining room:', data.id, 'with name:', data.name);
        currentRoomId = data.id;
        socket.join(currentRoomId);
        const player: Player = { id: socket.id, name: data.name, roomId: currentRoomId };
        players.push(player);
        callback({ success: true, player });
        updateClientsInRoom(currentRoomId);
        console.log('Player joined room:', currentRoomId);
    });

    socket.on('name', (name: string) => {
        const player = players.find((p) => p.id === socket.id);
        console.log(`User entered name ${name}`);
        if (player) {
            console.log(`Changing name from ${player.name} to ${name}`);
            player.name = name;
        }
        if (currentRoomId) {
            updateClientsInRoom(currentRoomId);
        }
    });

    socket.on('vote', (vote: string | number) => {
        const player = players.find((p) => p.id === socket.id);
        if (player) {
            player.vote = vote;
        }
        console.log(`Player ${player?.name} voted ${player?.vote}`);

        if (currentRoomId) {
            const playersInRoom = players.filter((p) => p.roomId === currentRoomId);
            if (playersInRoom.every((p) => p.vote !== undefined)) {
                showVotes(currentRoomId);
            }
            updateClientsInRoom(currentRoomId);
        }
    });

    socket.on('show', () => {
        if (currentRoomId) {
            showVotes(currentRoomId);
        }
    });

    socket.on('restart', () => {
        if (currentRoomId) {
            restartGame(currentRoomId);
        }
    });

    socket.on('gameTypeChanged', (newGameType: GameType) => {
        if (currentRoomId) {
            const roomGameType = roomGameTypes.find((p) => p.roomId === currentRoomId);
            if (roomGameType) {
                roomGameType.gameType = newGameType;
            }
            updateClientsInRoom(currentRoomId);
        }
    });

    socket.on('ticket', (updatedTickets: Ticket[]) => {
        if (currentRoomId) {
            tickets = tickets.filter((ticket) => ticket.roomId !== currentRoomId);
            for (const ticket of updatedTickets) {
                ticket.roomId = currentRoomId;
            }
            if (updatedTickets.length === 1) {
                updatedTickets[0].votingOn = true;
            }

            tickets.push(...updatedTickets);
            updateClientsInRoom(currentRoomId);
        }
    });

    socket.on('disconnect', () => {
        const player = players.find((player) => player.id === socket.id);
        if (player) {
            console.log(`Player ${player.name} has disconnected`);
            players.splice(players.indexOf(player), 1);
            if (currentRoomId) {
                updateClientsInRoom(currentRoomId);
            }
        }
    });
});

function updateClientsInRoom(roomId: string): void {
    const roomPlayers = players.filter((p) => p.roomId === roomId);
    const roomTickets = tickets.filter((p) => p.roomId === roomId);
    const roomGameType = roomGameTypes.find((p) => p.roomId === roomId)?.gameType ?? gameTypes[0];
    io.to(roomId).emit('update', {
        players: roomPlayers,
        tickets: roomTickets,
        gameType: roomGameType,
    });
}

function restartGame(roomId: string): void {
    const roomPlayers = players.filter((p) => p.roomId === roomId);
    const roomTickets = tickets.filter((p) => p.roomId === roomId);
    const roomGameType = roomGameTypes.find((p) => p.roomId === roomId)?.gameType ?? gameTypes[0];

    roomPlayers.forEach((p) => (p.vote = undefined));

    const ticketVotingOn = roomTickets.find((f) => f.votingOn);
    if (!(ticketVotingOn && !ticketVotingOn.score)) {
        roomTickets.forEach((p) => (p.votingOn = false));
        const ticketToVoteOn = roomTickets.find((t) => !t.score);
        if (ticketToVoteOn) {
            ticketToVoteOn.votingOn = true;
        }
    }
    console.log(
        `Restarted game with Players: ${roomPlayers
            .map((p) => p.name)
            .join(', ')}`
    );
    io.to(roomId).emit('restart');
    io.to(roomId).emit('update', {
        players: roomPlayers,
        tickets: roomTickets,
        gameType: roomGameType,
    });
}

function logRooms(): void {
    const rooms = players.map((e) => e.roomId);
    if (rooms) {
        for (const room of rooms.filter(
            (val, i, arr) => arr.indexOf(val) === i
        )) {
            const playersInRoom = players
                .filter((p) => p.roomId === room)
                .map((p) => p.name);
            console.log(`Room: ${room} - Players: ${playersInRoom.join(', ')}`);
        }
    }
}

function showVotes(roomId: string): void {
    const roomTickets = tickets.filter((p) => p.roomId === roomId);
    const roomGameType = roomGameTypes.find((p) => p.roomId === roomId)?.gameType;

    if (!roomGameType) {
        console.error(`No game type found for room ${roomId}`);
        return;
    }

    const average = getAverage(roomId);
    const values = roomGameType.values;

    let closest: string | number;
    let avg: number;

    if (typeof values[0] === 'number') {
        const numericValues = values.filter((v): v is number => typeof v === 'number');
        closest = findClosestNumeric(numericValues, average);
        avg = average;
    } else {
        const index = Math.round(average);
        closest = values[index] ?? values[values.length - 1];
        avg = index;
    }

    const ticketToUpdate = roomTickets.find((f) => f.votingOn);
    if (ticketToUpdate) {
        ticketToUpdate.score = closest;
    }

    io.to(roomId).emit('show', { average: avg, closest: closest });
}

function findClosestNumeric(values: number[], target: number): number {
    return values.reduce((prev, curr) => 
        Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
}

function getAverage(roomId: string): number {
    const roomPlayers = players.filter((p) => p.roomId === roomId);
    const roomGameType = roomGameTypes.find((p) => p.roomId === roomId)?.gameType ?? gameTypes[0];
    let count = 0;
    let total = 0;
    for (const player of roomPlayers) {
        if (player.vote && player.vote !== '?') {
            const index = roomGameType.values.indexOf(player.vote);
            const numberValue = Number(player.vote);
            const value = isNaN(numberValue) ? index : numberValue;
            if (value !== -1) {
                total += value;
                count++;
            }
        }
    }
    return count > 0 ? total / count : 0;
}

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});
