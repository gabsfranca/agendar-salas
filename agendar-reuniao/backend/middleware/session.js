const session = require('express-session');

const sessionMiddleware = session({
    secret: '123456', //tem que trocar 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, //so https
        httpOnly: true, //impede xss
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000  // em um mes a sessao expira
    },
});

module.exports = sessionMiddleware;