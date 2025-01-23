require('dotenv').config();

const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const sessionMiddleware = require('./middleware/session');
const passport = require('./passport/azure');
const routes = require('./routes');


const app = express();
app.use(cors({
    origin: ['https://localhost:3000', 'https://192.168.0.178:3000'],
    credentials: true
}));
app.use(sessionMiddleware);
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

app.use((err, req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session:', req.session);
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});


async function setupServer() {
    try {
        const httpsOptions = {
            key: fs.readFileSync('../certificates/private.key'),
            cert: fs.readFileSync('../certificates/certificate.crt'),
        };

        https.createServer(httpsOptions, app).listen(4000, () => {
            console.log('TAMO HTTPS PORRAAAA');
        });
    } catch (error) {
        console.error('erro no https: ', error);
        process.exit(1);
    }
}

setupServer().catch(console.error)