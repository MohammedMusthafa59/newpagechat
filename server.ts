import express from "express";
import path from "path";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";

interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

interface Room {
  code: string;
  users: User[];
  messages: Message[];
}

const activeRooms = new Map<string, Room>();

// Helper to generate a 6-digit alphanumeric code
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const httpServer = createHttpServer(app);
  
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Track map of socket.id to { roomCode, name } for quick disconnect lookup
  const socketToUserMap = new Map<string, { roomCode: string; name: string }>();

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // CREATE ROOM
    socket.on("create-room", ({ name }: { name: string }) => {
      if (!name || name.trim() === "") {
        socket.emit("room-error", "Name cannot be empty");
        return;
      }

      // Generate unique room code
      let code = generateRoomCode();
      while (activeRooms.has(code)) {
        code = generateRoomCode();
      }

      const room: Room = {
        code,
        users: [{ id: socket.id, name: name.trim() }],
        messages: []
      };

      activeRooms.set(code, room);
      socketToUserMap.set(socket.id, { roomCode: code, name: name.trim() });
      socket.join(code);

      console.log(`Room created: ${code} by ${name}`);
      socket.emit("room-created", { code, room });
    });

    // JOIN ROOM
    socket.on("join-room", ({ name, code }: { name: string; code: string }) => {
      if (!name || name.trim() === "") {
        socket.emit("room-error", "Name cannot be empty");
        return;
      }
      if (!code || code.trim() === "") {
        socket.emit("join-error", "Room Code cannot be empty");
        return;
      }

      const normalizedCode = code.trim().toUpperCase();
      const room = activeRooms.get(normalizedCode);

      if (!room) {
        socket.emit("join-error", "Room not found. Please verify the code.");
        return;
      }

      if (room.users.length >= 2) {
        socket.emit("join-error", "This room is full (maximum 2 participants).");
        return;
      }

      // Add user to room
      const newUser = { id: socket.id, name: name.trim() };
      room.users.push(newUser);
      socketToUserMap.set(socket.id, { roomCode: normalizedCode, name: name.trim() });
      socket.join(normalizedCode);

      console.log(`User ${name} joined room: ${normalizedCode}`);

      // Emit room joined back to the joining user
      socket.emit("room-joined", { code: normalizedCode, room });
      
      // Notify both users that room is active with updated room data
      io.to(normalizedCode).emit("room-updated", { room });
      
      // Also broadcast a system message inside the room
      const systemMsg: Message = {
        id: `system-${Date.now()}-${Math.random()}`,
        senderId: "system",
        senderName: "System",
        text: `${name.trim()} has joined the chat!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      room.messages.push(systemMsg);
      io.to(normalizedCode).emit("message-received", systemMsg);
    });

    // SEND MESSAGE
    socket.on("send-message", ({ text }: { text: string }) => {
      const userInfo = socketToUserMap.get(socket.id);
      if (!userInfo) {
        socket.emit("room-error", "You are not in a room");
        return;
      }

      const { roomCode, name } = userInfo;
      const room = activeRooms.get(roomCode);
      if (!room) {
        socket.emit("room-error", "Room not found");
        return;
      }

      const newMsg: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        senderId: socket.id,
        senderName: name,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      room.messages.push(newMsg);
      io.to(roomCode).emit("message-received", newMsg);
    });

    // LEAVE ROOM EXPLICITLY
    socket.on("leave-room", () => {
      handleDisconnectOrLeave(socket.id);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      handleDisconnectOrLeave(socket.id);
    });

    function handleDisconnectOrLeave(socketId: string) {
      const userInfo = socketToUserMap.get(socketId);
      if (!userInfo) return;

      const { roomCode, name } = userInfo;
      socketToUserMap.delete(socketId);
      socket.leave(roomCode);

      const room = activeRooms.get(roomCode);
      if (room) {
        // Remove user from room state
        room.users = room.users.filter(u => u.id !== socketId);

        if (room.users.length === 0) {
          // Clean up room completely if empty
          activeRooms.delete(roomCode);
          console.log(`Cleaned up empty room: ${roomCode}`);
        } else {
          // If there is still a user, notify them that someone left
          const systemMsg: Message = {
            id: `system-${Date.now()}-${Math.random()}`,
            senderId: "system",
            senderName: "System",
            text: `${name} has left the room.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
          };
          room.messages.push(systemMsg);
          io.to(roomCode).emit("message-received", systemMsg);
          io.to(roomCode).emit("user-left", { name, room });
          console.log(`User ${name} left room ${roomCode}. 1 user remains.`);
        }
      }
    }
  });

  // API Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", rooms: activeRooms.size });
  });

  // Vite Integration for dev-server and production bundle standard
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
