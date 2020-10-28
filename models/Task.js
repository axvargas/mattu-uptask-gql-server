const mongoose = require('mongoose')
const { Schema } = mongoose

const TaskSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    status:{
        type: Boolean,
        default: false
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Task', TaskSchema)