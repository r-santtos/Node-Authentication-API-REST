const mongoose = require('../services/api');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },

    email: {
        type: String,
        require: true,
        lowercase: true,
    },

    password: {
        type: String,
        require: true,
        select: false,
    },

    passRestToken: {
        type: String,
        select: false,
    },

    passRestExpires: {
        type: Date,
        select: false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Criptografando o password antes de salva no banco de dados
userSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;