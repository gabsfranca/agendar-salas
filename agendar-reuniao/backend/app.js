require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const https = require('https');
const fs = require('fs');

const { Pool } = require('pg');
const { OIDCStrategy } = require('passport-azure-ad');

//pool db

const pool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'agendamentos',
    password:'senha',
    port:5432,
});

pool.connect((err) => {
    if (err) {
        console.log('erro ao conectar no banco: ', err);
    } else {
        console.log('conectado ao pg');
    }
});



const app = express();
app.use(cors({
    origin: 'https://localhost:4000',
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(
    session({
        secret: '123456',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);
app.use(passport.initialize());
app.use(passport.session());

//passaporte outlook

passport.use(
    new OIDCStrategy(
        {
            identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUrl: 'https://localhost:4000/auth/callback',
            responseType: 'code',
            responseMode: 'query',
            scope: ['openid', 'profile', 'email', 'offline_access'],
            validateIssuer: false,
            passReqToCallback: true,
            loggingLevel: 'info',
            loggingNoPII: false,
            usePKCE: true,
            state: true
        },
        async (req, iss, sub, profile, accessToken, refreshToken, done) => {
            try {
                console.log('tokens recebidos: ', {
                    accessTokenPresent: !!accessToken,
                    refreshTokenPresent: !!refreshToken
                });
                console.log('perfil: ', profile);

                if (!profile || !profile._json) {
                    console.log('dados do perfil faltando');
                    return done(null, false);
                }

                const email = profile._json.preferred_username;

                if (!email) {
                    console.log('email faltando');
                    return done(null, false);
                }

                const userQuery = await pool.query(
                    'SELECT * FROM usuarios WHERE email = $1',
                    [email]
                );

                if (userQuery.rowCount === 0) {
                    console.log('usuario nao encontrado, inserindo no banco: ', email);
                    await pool.query(
                        `INSERT INTO usuarios (email, nome) VALUES ($1, $2)`,
                        [email, profile.displayName]
                    );
                }

                return done(null, { email, name: profile.displayName });
            } catch (error) {
                console.log('erro no callbakc do passport: ', error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));






app.get(
    '/auth/login',
    function(req, res, next) {
        passport.authenticate('azuread-openidconnect', {
            failureRedirect: '/',
            session: true,
            response: res,
            failureFlash: true
        })(req, res, next);
    }
);

app.get(
    '/auth/callback',
    function(req, res, next) {
        passport.authenticate('azuread-openidconnect', {
            failureRedirect: '/',
            failureFlash: true,
            session: true,
            response: res
        })(req, res, next);
    },
    function(req, res) {
        console.log('Authentication successful');
        res.redirect('/profile');
    }
);


app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login');
    }
    res.json({ user: req.user });
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'erro ao deslogar'});
        res.redirect('https://login.microsoftonline.com/common/oauth2/logout');
    });
});

app.post('/agendar',  async (req, res) => {


    const { name, topic, sede, date, time } = req.body;

    if (!name || !topic || !sede || !date || !time) {
        return res.status(400).json({ error: 'todos os campos sao obrigatorios.' });
    }

    try{ 
        const query = `
            INSERT INTO agendamentos (name, topic, sede, date, time)
            VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;

        const values = [name, topic, sede, date, time.join(',')];
        const result = await pool.query(query, values);

        res.status(201).json({ message: 'Agendamento salvo com sucesso! ', id: result.rows[0].id });
    } catch (error) {
        console.log('erro ao salvar agendamento: ', error);
        res.status(500).json({ error: 'erro ao salvar agendamento '});
    }
});

 

app.get('/horarios', async (req, res) => {
    const { date, sede } = req.query;

    if (!date || !sede) {
        return res.status(400).json({ error: 'falta coisa'});
    }

    try {
        const query = `
            SELECT time, name, topic FROM agendamentos WHERE date = $1 AND sede = $2; 
        `;
        const result = await pool.query(query, [date, sede]);

        const horariosOcupados = result.rows.flatMap((row) => 
            row.time.split(',').map((time) => ({
                time: time.trim(), 
                name: row.name,
                topic: row.topic,
            }))
        );

        res.status(200).json(horariosOcupados);
    }catch (error) {
        console.log('erro ao buscar horarios: ', error);
        res.status(500).json({ error: 'erro ao buscar horarios ocupados'})
    }
});

app.get('/', async(req, res) => {
    return res.status(200).json({ message: 'oie'})
})


async function setupServer() {
    try {
        const httpsOptions = {
            key: fs.readFileSync('./certificates/private.key'),
            cert: fs.readFileSync('./certificates/certificate.crt'),
        };

        https.createServer(httpsOptions, app).listen(4000, () => {
            console.log('TAMO HTTPS PORRAAAA');
        });
    } catch (error) {
        console.error('erro no https: ', error);
    }
}

setupServer().catch(console.error)