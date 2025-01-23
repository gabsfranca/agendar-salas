const express = require('express');
const passport = require('../passport/azure');

const router = express.Router();

router.get('/login', passport.authenticate('azuread-openidconnect', {
    failureRedirect: '/',
    session: true,
}));

router.get('/callback', passport.authenticate('azuread-openidconnect', {
    failureRedirect: '/', 
    session: true,
}), (req, res) => {
    res.redirect('/auth/oie');
});

router.get('/oie', (req, res) => {
    return res.sendStatus(200);
})

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

router.get('/api/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
        console.log('logado');
        return res.sendStatus(200);
    } else {
        console.log('nao logo');
        return res.sendStatus(401);
    }
  });

module.exports = router;