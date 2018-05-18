var AV = require('leanengine');
var handler = require('./public/js/handler');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hook', function (request) {
    handler();
    return 'success';
});
