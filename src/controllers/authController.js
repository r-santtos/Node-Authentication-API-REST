const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const authConfig = require('../config/auth.json');
const crypto = require('crypto');
const mailer = require('../services/email');

// Gerando o token 
function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

// Registrando usuários 
router.post('/register', async (request, response) => {
    const { email } = request.body;

    try {
        // Verificando se já existe usuário com o mesmo email
        if ( await User.findOne({ email })) {
            return response.status(400).send({ error: 'Usuário já registrado' });
        }
        // Crian o usuário caso não exista
        const user = await User.create(request.body);

        // Apagando o retorno em tela da senha cadastrada
        user.password = undefined;

        // Retornando uma resposta após o registro
        return response.send({ 
            user,
            token: generateToken({ id: user.id }),
        });

        // Em caso de erro no registro retorna uma msg
    } catch (err) {
        return response.status(400).send({ error: 'Registration faied' });
    }
});

// Auth Token Validation
router.post('/authenticate', async (request, response) => {
    const { email, password } = request.body;

    // Verificando se exite o usuário
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return response.status(400).send({ error: 'User not found' });
    }

    // Comparando senha digitada com a senha cadastrada no banco
    if (!await bcrypt.compare(password, user.password)) {
        return response.status(400).send({ error: 'Senha errada' });
    }

    // Apagando o retorno em tela da senha cadastrada
    user.password = undefined;

    // retornando usuário mais o token
    response.send({ 
        user, 
        token: generateToken({ id: user.id }),
    });
});

// Rota para recupera senha
router.post('/pass_recover', async (request, response) => {
    const { email } = request.body;

    try { // Verificando se email exite e gerando token exclusivo para o usuário
        const user = await User.findOne({ email });
        if (!user) {
            return response.status(400).send({ error: 'User not found' });
        } else {
            // Caso email exita gera um token que tera vida de uma hora
            const token = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1);

            // Alterando usuário que acabou de gerar o token
            await User.findOneAndUpdate(user.id, {
                '$set': {
                    passRestToken: token,
                    passRestExpires: now,
                }
            });
        }
        // Enviando o email com o token de recuperação de senha
        mailer.sendMail({
            to: email,
            from: 'rsanttos.dev@gmail.com',
            template: '/resource/body_mail.html',
            context: { token },
        }, (err) => {
            if (err) {
                return response.status(400).send({ err: 'err' });
            }
        });

        // Em caso de erro por algum motivo retornara essa msg
    } catch (err) {
        console.log(err);
        response.status(400).send({ erro: 'Erro pass recover '});
    }
});

// Esportando rotas
module.exports = app => app.use('/auth', router);