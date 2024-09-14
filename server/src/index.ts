import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { z } from 'zod';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Replace with your frontend URL in production
    methods: ['GET', 'POST'],
  },
});

interface Room {
  id: string;
  players: Player[];
}

interface Player {
  id: string;
  name: string;
  vote: string | null;
}

const rooms = new Map<string, Room>();

const RoomSchema = z.object({
  id: z.string(),
});

const PlayerSchema = z.object({
  name: z.string(),
});

const VoteSchema = z.object({
  vote: z.string(),
});

io.on('connection', (socket) => {
  socket.on('createRoom', (data, callback) => {
    const result = RoomSchema.safeParse(data);
    if (!result.success) {
      return callback({ error: 'Invalid room data' });
    }

    const { id } = result.data;
    if (rooms.has(id)) {
      return callback({ error: 'Room already exists' });
    }

    rooms.set(id, { id, players: [] });
    socket.join(id);
    callback({ success: true });
  });

  socket.on('joinRoom', (data, callback) => {
    const result = RoomSchema.safeParse(data);
    if (!result.success) {
      return callback({ error: 'Invalid room data' });
    }

    const { id } = result.data;
    const room = rooms.get(id);
    if (!room) {
      return callback({ error: 'Room not found' });
    }

    const playerResult = PlayerSchema.safeParse(data);
    if (!playerResult.success) {
      return callback({ error: 'Invalid player data' });
    }

    const { name } = playerResult.data;
    
    // Check if the player is already in the room
    const existingPlayer = room.players.find(p => p.name === name);
    if (existingPlayer) {
      // Update the existing player's socket ID
      existingPlayer.id = socket.id;
      socket.join(id);
      return callback({ success: true, player: existingPlayer });
    }

    const player: Player = { id: socket.id, name, vote: null };
    room.players.push(player);
    socket.join(id);
    io.to(id).emit('playerJoined', { player });
    callback({ success: true, player });
  });

  socket.on('vote', (data, callback) => {
    const result = VoteSchema.safeParse(data);
    if (!result.success) {
      return callback({ error: 'Invalid vote data' });
    }

    const { vote } = result.data;
    const room = Array.from(rooms.values()).find((r) => 
      r.players.some((p) => p.id === socket.id)
    );

    if (!room) {
      return callback({ error: 'Player not in a room' });
    }

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) {
      return callback({ error: 'Player not found' });
    }

    player.vote = vote;
    io.to(room.id).emit('playerVoted', { playerId: socket.id });
    callback({ success: true });
  });

  socket.on('revealVotes', (data, callback) => {
    const result = RoomSchema.safeParse(data);
    if (!result.success) {
      return callback({ error: 'Invalid room data' });
    }

    const { id } = result.data;
    const room = rooms.get(id);
    if (!room) {
      return callback({ error: 'Room not found' });
    }

    io.to(id).emit('votesRevealed', { players: room.players });
    callback({ success: true });
  });

  socket.on('resetVotes', (data, callback) => {
    const result = RoomSchema.safeParse(data);
    if (!result.success) {
      return callback({ error: 'Invalid room data' });
    }

    const { id } = result.data;
    const room = rooms.get(id);
    if (!room) {
      return callback({ error: 'Room not found' });
    }

    room.players.forEach((player) => {
      player.vote = null;
    });
    io.to(id).emit('votesReset');
    callback({ success: true });
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms) {
      const index = room.players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        io.to(roomId).emit('playerLeft', { playerId: socket.id });
        if (room.players.length === 0) {
          rooms.delete(roomId);
        }
        break;
      }
    }
  });
});

// Admin routes
app.get('/admin/rooms', (req, res) => {
  const roomData = Array.from(rooms.values()).map((room) => ({
    id: room.id,
    playerCount: room.players.length,
  }));
  res.json(roomData);
});

app.get('/admin/room/:id', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});