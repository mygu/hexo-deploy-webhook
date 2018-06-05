var AV = require('leanengine');
var handler = require('./public/js/handler');

/**
 * Hexo博客发布后触发自动编译部署的钩子程序
 */
AV.Cloud.define('hook', function (req, res) {
    console.log('延时30秒唤醒');

    setTimeout(function () {
        handler();
    }, 10000);

    res.success();
});
