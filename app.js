require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const aiModelsRouter = require('./routes/aiModels');
const roomsRouter = require('./routes/rooms');
const authRouter = require('./routes/auth');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Middleware
app.use(express.json());

// Routes
app.use('/api/ai-models', aiModelsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/auth', authRouter);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// استقبال الرسائل الحية في الغرف
io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
    });

    socket.on('chatMessage', ({ roomId, message }) => {
        // بث الرسالة لجميع المشاركين في الغرفة
        io.to(roomId).emit('newMessage', message);
    });
});

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});