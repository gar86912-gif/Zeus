const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'participantsModel'
    }],
    participantsModel: [{
        type: String,
        enum: ['User', 'AIModel']
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
