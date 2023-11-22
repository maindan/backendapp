const express = require('express');
const routes = express.Router()
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();


// Credentials

const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

// Database Connection

const connect = mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.lpb7on1.mongodb.net/?retryWrites=true&w=majority`)
connect.then(() => {
    console.log('banco de dados conectado');
})
.catch(() => {
    console.log('connection failed');
});

//Mongoose Schema
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
});

// Collection
const collection = new mongoose.model('users', LoginSchema)

// Login

routes.post('/login', async (req, res) => {
    const { username, password} = req.body;
    const user = await collection.findOne({name: username})
    if(user){
        res.status(200).json('exist')
    } else {
        res.status(404).json('does not exist')
    }
});

module.exports = routes

