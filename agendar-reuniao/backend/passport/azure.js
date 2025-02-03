const passport = require('passport');
const { OIDCStrategy } = require('passport-azure-ad');
const pool = require('../config/db');


passport.serializeUser((user, done) => {
    console.log('Serializing user: ', user);
    done(null, user)
});

passport.deserializeUser((obj, done) => {
    // console.log('deserializing user w email: ', email);
    try {
        done(null, obj);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new OIDCStrategy(
        {
            identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUrl: 'https://192.168.0.178:4000/auth/callback',
            responseType: 'code',
            responseMode: 'query',
            scope: ['openid', 'profile', 'email', 'offline_access'],
            validateIssuer: false,
            passReqToCallback: true,
            loggingLevel: 'info',
            loggingNoPII: false,
            usePKCE: false,
            state: true
        },
        async (req, iss, sub, profile, accessToken, refreshToken, done) => {
            try {
                console.log('\n\n\n\n\nAuthentication Callback Details:');
                console.log('Request Session Before:', req.session);
                console.log('Issuer:', iss);
                console.log('Subject:', sub);
                console.log('Profile:', JSON.stringify(profile, null, 2));
                console.log('Access Token Present:', !!accessToken);
                console.log('Refresh Token Present:', !!refreshToken);
                console.log('\n\n\n\n\n\n\n');
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
                    'SELECT email, ehsupervisor FROM usuarios WHERE email = $1',
                    [email]
                );

                



                if (userQuery.rowCount === 0) {
                    console.log('usuario nao encontrado, inserindo no banco: ', email);
                    await pool.query(
                        `INSERT INTO usuarios (email, nome) VALUES ($1, $2)`,
                        [email, profile.displayName]
                    );

                } else {
                    user = userQuery.rows[0];
                }

                return done(null, user);
            } catch (error) {
                console.log('erro no callbakc do passport: ', error);
                return done(error, null);
            }
        }
    )
);



module.exports = passport
