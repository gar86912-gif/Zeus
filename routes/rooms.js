const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message');
const AIModel = require('../models/AIModel');
const auth = require('../middleware/auth');

// جلب جميع الغرف
router.get('/', auth, async (req, res) => {
    const rooms = await Room.find().populate('participants');
    res.json(rooms);
});

// إنشاء غرفة جديدة
router.post('/', auth, async (req, res) => {
    const { title, createdBy, participants, participantsModel } = req.body;
    const room = new Room({ title, createdBy, participants, participantsModel });
    await room.save();
    res.status(201).json(room);
});

// جلب غرفة محددة
router.get('/:id', auth, async (req, res) => {
    const room = await Room.findById(req.params.id).populate('participants');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
});

// جلب رسائل غرفة
router.get('/:id/messages', auth, async (req, res) => {
    const messages = await Message.find({ room: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
});

// إرسال رسالة في غرفة
router.post('/:id/messages', auth, async (req, res) => {
    const { sender, senderModel, text } = req.body;
    const message = new Message({
        room: req.params.id,
        sender,
        senderModel,
        text
    });
    await message.save();
    res.status(201).json(message);
});

module.exports = router;
