const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle new user
  socket.on('newUser', (username) => {
    users.push({ id: socket.id, username });
    socket.broadcast.emit('chatMessage', { username: 'System', message: `${username} has joined the chat.` });
  });

  // Handle incoming chat messages
  socket.on('chatMessage', (data) => {
    io.emit('chatMessage', data); // Broadcast message to all users
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    const user = users.find(u => u.id === socket.id);
    if (user) {
      users = users.filter(u => u.id !== socket.id);
      socket.broadcast.emit('chatMessage', { username: 'System', message: `${user.username} has left the chat.` });
    }
    console.log('A user disconnected');
  });
});

// Set server to listen on a port
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
