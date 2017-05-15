const express = require('express');
const router = express.Router();
const trans = require('../src/assets/i18n/US/en.json');


router.get('/', (req, res) => {
    res.send('api works!');
});

router.post('/login', (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    if (email == 'admin' && password == 'admin123') {
        res.status(200).send({token: 'fake-token'});
    } else {
        res.status(404).send('error');
    }
});

router.get('/assets/i18n/US/en.json', (req, res) => {
    res.status(200).send(trans)
})

module.exports = router;