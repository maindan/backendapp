const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();


// inicializando aplicação
const app = express();
app.use(cors())
app.use(express.json());


// Public Route
app.get('/', (req, res) => {
    return res.send('Bem vindo a API!')
})

// Private Route
app.get('/user/:id', checkToken, async (req, res) => {

    const id = req.params.id

    try{
        const user = await collection.findById(id, '-password');

        if(!user) {
            return res.status(404).json({msg:"usuário não encontrado"})
        };
        res.status(200).json({user});
    } catch(err) {
        console.log(err)
        if (err instanceof mongoose.Error.CastError) {
            return res.status(400).json({ msg: "ID inválido" });
        }

        res.status(500).json({ msg: "Erro interno do servidor" });
    }
});

// ******* checkToken *******

function checkToken(req, res, next){
    
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader && tokenHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({msg:"credenciais inválidas!"})
    };

    try{
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        next();
    } catch(err) {
        return res.status(400).json({msg:"Token inválido"});
    }
}

// Register Route

app.post('/register', async(req, res) => {
    const { name, email, password } = req.body;
    
    // Validações
    if(!name) {
        return res.status(400).json({msg: 'nome é obrigatório!'})
    }
    if(!email) {
        return res.status(400).json({msg: 'email é obrigatório!'})
    }
    if(!password) {
        return res.status(400).json({msg: 'senha é obrigatório!'})
    }

    const userInvalid = await collection.findOne({email: email});
    if(userInvalid){
        return res.status(400).json({msg: 'o email informado já está em uso!'})
    }
    
    // criptografando password

    const saltRounds = 13
    const hashedPass = await bcrypt.hash(password, saltRounds);
    const data = {
        name: name,
        email: email,
        password: hashedPass,
    }
    try{
        const sendData = await collection.insertMany(data);
        return res.status(200).json({msg: 'Usuário criado com sucesso!'});
    } catch(err){
        return res.status(500).json({msg:"um erro aconteceu"});
    }
});

// Login Route

app.post('/login/auth', async (req, res) => {
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
        return res.status(400).json({ msg: 'Email e senha são obrigatórios!' });
    }

    const checkUser = await collection.findOne({ email: email });

    if (!checkUser) {
        return res.status(400).json({ msg: 'Usuário não encontrado' });
    }

    const passMatch = await bcrypt.compare(password, checkUser.password);

    if (!passMatch) {
        return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    try{
        const secret = process.env.SECRET;
        const token = jwt.sign({
            id: checkUser._id,
        },
        secret,
        )

        res.status(200).json({msg:"autenticação realizada com sucesso", token})

    } catch(err) {
        console.log(err)
    }
});

// ******* BANCO DE DADOS *******

// Credentials

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

// DB Connection
const connect = mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.lpb7on1.mongodb.net/?retryWrites=true&w=majority`)
connect.then(() => {
    console.log('Conectado ao DB!');
})
.catch(()=> {
    console.log('Conexão ao DB falhou!');
})

//Mongoose Schema

//Mongoose Schema
const loginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

//Collection

const collection = new mongoose.model('usuarios', loginSchema);
// Ligando servidor

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`servidor rodando na porta ${port}`);
})
