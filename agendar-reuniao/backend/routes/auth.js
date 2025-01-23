const express = require('express');
const passport = require('../passport/azure');

const router = express.Router();

router.get('/login', passport.authenticate('azuread-openidconnect', {
    failureRedirect: '/auth/error',
    session: true,
}));

router.get('/callback', passport.authenticate('azuread-openidconnect', {
    failureRedirect: '/auth/error', 
    session: true,
}), (req, res) => {
    res.redirect('https://192.168.0.178:3000/agendamento/major');
});

router.get('/error', (req, res) => {
    return res.json({ error: 'deu ruim'})
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'erro ao deslogar' });
        res.redirect('https://login.microsoftonline.com/common/oauth2/logout');
    });
});

router.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login');
    }
    res.json({ user: req.user });
});

router.get('/check-auth', (req, res) => {
    console.log('Sessão atual:', req.session);
    console.log('Usuário atual:', req.user);
    console.log('Está autenticado?', req.isAuthenticated());

    if (req.isAuthenticated()) {
        console.log('logado');
        return res.json({
            authenticated: true,
            user: req.user  
        });
    } else {
        console.log('nao logo');
        return res.status(401).json({
            authenticated: false,
            message: 'nao logo'
        });
    }
  });

module.exports = router;