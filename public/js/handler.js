'use strict';

// var os = require('os');
// var pathFn = require('path');
var fs = require('graceful-fs');
var spawn = require('./spawn');
var gitClone = require('./git_clone');
var gitDeploy = require('./git_deploy');

// ================ 设置git克隆参数 ================ //

var GIT_CLONE_USER_NAME = process.env.GIT_CLONE_USER_NAME; // git配置用户名
var GIT_CLONE_USER_EMAIL = process.env.GIT_CLONE_USER_EMAIL; // git配置邮箱
var GIT_CLONE_REPOSITORY_HOST = process.env.GIT_CLONE_REPOSITORY_HOST; // git克隆仓库的域名
var GIT_CLONE_REPOSITORY_USERNAME = process.env.GIT_CLONE_REPOSITORY_USERNAME; // git克隆仓库的用户名
var GIT_CLONE_REPOSITORY_PASSWORD = encodeURIComponent(process.env.GIT_CLONE_REPOSITORY_PASSWORD); // git克隆仓库的密码
var GIT_CLONE_REPOSITORY_PROJECT = process.env.GIT_CLONE_REPOSITORY_PROJECT; // git克隆仓库的项目名
var GIT_CLONE_REPOSITORY_BRANCH = process.env.GIT_CLONE_REPOSITORY_BRANCH || 'master'; // git克隆仓库的分支

var GIT_CLONE_REPOSITORY_URL = `https://${GIT_CLONE_REPOSITORY_USERNAME}:${GIT_CLONE_REPOSITORY_PASSWORD}@${GIT_CLONE_REPOSITORY_HOST}/${GIT_CLONE_REPOSITORY_USERNAME}/${GIT_CLONE_REPOSITORY_PROJECT}.git`;
var GIT_CLONE_REPOSITORY = process.env.GIT_CLONE_REPOSITORY || (GIT_CLONE_REPOSITORY_URL + ',' + GIT_CLONE_REPOSITORY_BRANCH);

// ================ 设置git部署参数 ================ //

var GIT_DEPLOY_USER_NAME = process.env.GIT_DEPLOY_USER_NAME; // git配置部提交户名
var GIT_DEPLOY_USER_EMAIL = process.env.GIT_DEPLOY_USER_EMAIL; // git配置提交邮箱
var GIT_DEPLOY_REPOSITORY_HOST = process.env.GIT_DEPLOY_REPOSITORY_HOST; // git提交仓库的域名
var GIT_DEPLOY_REPOSITORY_USERNAME = process.env.GIT_DEPLOY_REPOSITORY_USERNAME; // git提交仓库的用户名
var GIT_DEPLOY_REPOSITORY_PASSWORD = encodeURIComponent(process.env.GIT_DEPLOY_REPOSITORY_PASSWORD); // git提交仓库的密码
var GIT_DEPLOY_REPOSITORY_PROJECT = process.env.GIT_DEPLOY_REPOSITORY_PROJECT; // git提交仓库的项目名
var GIT_DEPLOY_REPOSITORY_BRANCH = process.env.GIT_DEPLOY_REPOSITORY_BRANCH || 'master'; // git提交仓库的分支

var GIT_DEPLOY_REPOSITORY_URL = `https://${GIT_DEPLOY_REPOSITORY_USERNAME}:${GIT_DEPLOY_REPOSITORY_PASSWORD}@${GIT_DEPLOY_REPOSITORY_HOST}/${GIT_DEPLOY_REPOSITORY_USERNAME}/${GIT_DEPLOY_REPOSITORY_PROJECT}.git`;
var GIT_DEPLOY_REPOSITORY = process.env.GIT_DEPLOY_REPOSITORY || (GIT_DEPLOY_REPOSITORY_URL + ',' + GIT_DEPLOY_REPOSITORY_BRANCH);

// ================ 设置默认参数 ================ //

var TMP_DIR = process.env.TMP_DIR || '/tmp'; // 临时目录
// var LIMIT_FILE_PATH = process.env.TMP_DIR || '/.limit'; // 限制文件，设置访问时间限制
var WORKSPACE_DIR = process.env.WORKSPACE_DIR || `${TMP_DIR}/${GIT_CLONE_REPOSITORY.slice(GIT_CLONE_REPOSITORY.lastIndexOf('/') + 1, GIT_CLONE_REPOSITORY.lastIndexOf(','))}`; // 工作空间目录
var NPM_REPOSITORY = process.env.NPM_REPOSITORY || 'https://registry.npm.taobao.org'; // npm仓库镜像
// var OS_PLATFORM = process.env.OS_PLATFORM || os.platform(); // 操作系统平台，'darwin', 'freebsd', 'linux', 'sunos' , 'win32'

function handler() {
    fs.readFile('./test.txt', 'utf8', function (err, data) {
        console.log(data);
    });

    console.log('======= 开始执行自动部署 =======');

    console.log('1.清理工作空间');
    return spawn('rm', ['-rf', WORKSPACE_DIR], {
        verbose: false,
        stdio: 'inherit'
    }).then(function () {
        console.log('2.克隆项目源码');
        return gitClone({
            'base_dir': WORKSPACE_DIR,
            'repository': GIT_CLONE_REPOSITORY,
            'name': GIT_CLONE_USER_NAME,
            'email': GIT_CLONE_USER_EMAIL,
            'verbose': false
        });
    }).then(function () {
        console.log('3.设置npm仓库使用国内镜像');
        return npm('config', 'set', 'registry', NPM_REPOSITORY);
    }).then(function () {
        console.log('4.安装hexo-cli');
        return spawn('npm', ['install', 'hexo-cli'], {
            verbose: false,
            stdio: 'inherit'
        });
    }).then(function () {
        console.log('5.安装项目依赖');
        return npm('install');
    }).then(function () {
        console.log('6.编译项目html');
        return hexo('generate');
    }).then(function () {
        console.log('7.提交部署到指定仓库');
        return gitDeploy({
            'base_dir': WORKSPACE_DIR,
            'repository': GIT_DEPLOY_REPOSITORY,
            'name': GIT_DEPLOY_USER_NAME,
            'email': GIT_DEPLOY_USER_EMAIL,
            'verbose': false
        });
    }).then(function () {
        console.log('======= 完成自动部署 =======');
    });
}

function npm() {
    var len = arguments.length;
    var args = new Array(len);

    for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
    }

    return spawn('npm', args, {
        cwd: WORKSPACE_DIR,
        verbose: false,
        stdio: 'inherit'
    });
}

function hexo() {
    var len = arguments.length;
    var args = new Array(len);

    for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
    }

    return spawn('hexo', args, {
        cwd: WORKSPACE_DIR,
        verbose: false,
        stdio: 'inherit'
    });
}

// function cleanWorkspace() {
//     if (OS_PLATFORM === 'win32') {
//         return spawn('rd', ['/s', '/q', WORKSPACE_DIR], {
//             verbose: false,
//             stdio: 'inherit'
//         });
//     } else {
//         return spawn('rm', ['-rf', WORKSPACE_DIR], {
//             verbose: false,
//             stdio: 'inherit'
//         });
//     }
// }

module.exports = handler;