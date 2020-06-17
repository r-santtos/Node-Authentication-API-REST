const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');

module.exports = (request, response, next) => {
    const authHeader = request.headers.authorization;
    
    // Verificar se foi informado o token
    if (!authHeader) {
        return response.status(401).send({ error: 'No token provided' });
    }

    // Separando o tolen em duas partes
    const parts = authHeader.split(' ');

    // Verificando se tenho duas partes para pode separar
    const [ scheme, token ] = parts;

    if (!parts.length === 2) {
        return response.status(401).send({ error: 'token error' });
    } else {
        // Verificando se exite uma palavra no token igual a Bearer
        if (!/^Bearer$/i.test(scheme)) {
            return response.status(401).send({ error: 'token errado' });
        }
    }

    // Verificando token se é valido
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return response.status(401).send({ error: 'token invalid' });
        } 
        request.userId = decoded.id;
        return next();
    });
};