'use strict';

var router = require('express').Router();
var handler = require('../public/js/handler');

/**
 * Hexo博客发布后触发自动编译部署的钩子程序
 */
router.post('/', function (req, res, next) {
    console.log('即将执行自动编译部署程序');

    setTimeout(function () {
        handler();
    }, 10000);

    res.status(200).json({
        message: 'success'
    });
});

/**
 * 手动触发
 */
router.get('/testDeploy', function (req, res, next) {
    console.log('即将执行自动编译部署程序');

    setTimeout(function () {
        handler();
    }, 10000);

    res.status(200).json({
        message: 'success'
    });
});


module.exports = router;
