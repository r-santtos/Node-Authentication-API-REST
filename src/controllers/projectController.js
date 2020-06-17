const express = require('express');
const routes = express.Router();
const authMidd = require('../midd/auth');

routes.use(authMidd);

routes.get('/', (request, response) => {
    response.send({ ok: true, user: request.userId });
});

module.exports = app => app.use('/projects', routes);