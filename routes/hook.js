'use strict';

var router = require('express').Router();
var handler = require('../public/js/handler');

router.get('/', function (req, res, next) {
    handler();

    res.status(200).json({
        message: 'success'
    });
});

module.exports = router;
