var AV = require('leanengine');
var handler = require('./public/js/handler');

/**
 * Hexo博客发布后触发自动编译部署的钩子程序
 */
AV.Cloud.define('hook', function (req, res) {
    console.log('即将执行自动编译部署程序');

    setTimeout(function () {
        handler();
    }, 10000);

    res.success();
});


/**
 * 云引擎唤醒程序
 */
AV.Cloud.define('wakeUp', function (req, res) {
    console.log('======= 云引擎唤醒程序启动 =======');

    var timer;
    var secondClock = 10;

    timer = setInterval(function () {
        console.log('云引擎唤醒中：（%d秒）', secondClock);
        secondClock--;
        if (secondClock === 0) {
            clearInterval(timer);
            console.log('======= 云引擎唤醒程序完成 =======');
        }
    }, 1000);

    res.success();
});