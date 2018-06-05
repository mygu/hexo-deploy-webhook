'use strict';

// var os = require('os');
// var pathFn = require('path');
var fs = require('graceful-fs');
var spawn = require('./spawn');
var gitClone = require('./git_clone');
var gitDeploy = require('./git_deploy');

// ================ 设置git克隆参数 ================ //

var GIT_CLONE_USER_NAME = process.env.GIT_CLONE_USER_NAME || '"admin"'; // git配置用户名
var GIT_CLONE_USER_EMAIL = process.env.GIT_CLONE_USER_EMAIL || '"admin@admin.com"'; // git配置邮箱
var GIT_CLONE_REPOSITORY_HOST = process.env.GIT_CLONE_REPOSITORY_HOST; // git克隆仓库的域名
var GIT_CLONE_REPOSITORY_USERNAME = process.env.GIT_CLONE_REPOSITORY_USERNAME; // git克隆仓库的用户名
var GIT_CLONE_REPOSITORY_PASSWORD = process.env.GIT_CLONE_REPOSITORY_PASSWORD; // git克隆仓库的密码
var GIT_CLONE_REPOSITORY_PROJECT = process.env.GIT_CLONE_REPOSITORY_PROJECT; // git克隆仓库的项目名
var GIT_CLONE_REPOSITORY_BRANCH = process.env.GIT_CLONE_REPOSITORY_BRANCH || 'master'; // git克隆仓库的分支

var GIT_CLONE_REPOSITORY = process.env.GIT_CLONE_REPOSITORY;

// ================ 设置git部署参数 ================ //

var GIT_DEPLOY_USER_NAME = process.env.GIT_DEPLOY_USER_NAME || '"admin"'; // git配置部提交户名，多个配置用英文逗号分隔
var GIT_DEPLOY_USER_EMAIL = process.env.GIT_DEPLOY_USER_EMAIL || '"admin@admin.com"'; // git配置提交邮箱，多个配置用英文逗号分隔
var GIT_DEPLOY_REPOSITORY_HOST = process.env.GIT_DEPLOY_REPOSITORY_HOST; // git提交仓库的域名，多个配置用英文逗号分隔
var GIT_DEPLOY_REPOSITORY_USERNAME = process.env.GIT_DEPLOY_REPOSITORY_USERNAME; // git提交仓库的用户名，多个配置用英文逗号分隔
var GIT_DEPLOY_REPOSITORY_PASSWORD = process.env.GIT_DEPLOY_REPOSITORY_PASSWORD; // git提交仓库的密码，多个配置用英文逗号分隔
var GIT_DEPLOY_REPOSITORY_PROJECT = process.env.GIT_DEPLOY_REPOSITORY_PROJECT; // git提交仓库的项目名，多个配置用英文逗号分隔
var GIT_DEPLOY_REPOSITORY_BRANCH = process.env.GIT_DEPLOY_REPOSITORY_BRANCH || 'master'; // git提交仓库的分支，多个配置用英文逗号分隔

var GIT_DEPLOY_REPOSITORY = process.env.GIT_DEPLOY_REPOSITORY;

// ================ 设置默认参数 ================ //

var TMP_DIR = process.env.TMP_DIR || '/tmp'; // 临时目录
// var LIMIT_FILE_PATH = process.env.TMP_DIR || '/.limit'; // 限制文件，设置访问时间限制
var WORKSPACE_DIR = process.env.WORKSPACE_DIR || `${TMP_DIR}/project`; // 工作空间目录
var NPM_REPOSITORY = process.env.NPM_REPOSITORY || 'https://registry.npm.taobao.org'; // npm仓库镜像
// var OS_PLATFORM = process.env.OS_PLATFORM || os.platform(); // 操作系统平台，'darwin', 'freebsd', 'linux', 'sunos' , 'win32'

function handler() {
    // 检查环境变量配置
    if (!checkProcessEnv()) {
        console.log('环境变量配置检查未通过，取消自动部署');
        return false;
    }

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

/**
 * 检查环境变量参数配置
 * @returns {boolean}
 */
function checkProcessEnv() {
    var result = false;
    if (checkCloneProcessEnv() && checkDeployProcessEnv()) {
        result = true;
    }
    return result;
}

/**
 * 检查克隆仓库相关参数配置
 * @returns {boolean}
 */
function checkCloneProcessEnv() {
    var result = false;

    if (!GIT_CLONE_REPOSITORY) {
        if (!GIT_CLONE_REPOSITORY_HOST) {
            console.log('请配置克隆仓库的域名：GIT_CLONE_REPOSITORY_HOST');
        } else if (!GIT_CLONE_REPOSITORY_USERNAME) {
            console.log('请配置克隆仓库的用户名：GIT_CLONE_REPOSITORY_USERNAME');
        } else if (!GIT_CLONE_REPOSITORY_PASSWORD) {
            console.log('请配置克隆仓库的密码：GIT_CLONE_REPOSITORY_PASSWORD');
        } else if (!GIT_CLONE_REPOSITORY_PROJECT) {
            console.log('请配置克隆仓库的项目名：GIT_CLONE_REPOSITORY_PROJECT');
        } else if (!GIT_CLONE_REPOSITORY_BRANCH) {
            console.log('请配置克隆仓库的分支：GIT_CLONE_REPOSITORY_BRANCH');
        } else {
            var host = GIT_CLONE_REPOSITORY_HOST;
            var username = GIT_CLONE_REPOSITORY_USERNAME;
            var password = encodePassword(GIT_CLONE_REPOSITORY_PASSWORD);
            var project = GIT_CLONE_REPOSITORY_PROJECT;
            var branch = GIT_CLONE_REPOSITORY_BRANCH;

            var repositoryUrl = `https://${username}:${password}@${host}/${username}/${project}.git,${branch}`;

            GIT_CLONE_REPOSITORY = repositoryUrl;
            result = true;
        }
    } else {
        result = true;
    }

    return result;
}

/**
 * 检查部署仓库相关参数配置
 * @returns {boolean}
 */
function checkDeployProcessEnv() {
    var result = false;

    if (!GIT_DEPLOY_REPOSITORY) {
        if (!GIT_DEPLOY_REPOSITORY_HOST) {
            console.log('请配置提交仓库的域名，多个配置用英文逗号分隔：GIT_DEPLOY_REPOSITORY_HOST');
        } else if (!GIT_DEPLOY_REPOSITORY_USERNAME) {
            console.log('请配置提交仓库的用户名，多个配置用英文逗号分隔：GIT_DEPLOY_REPOSITORY_USERNAME');
        } else if (!GIT_DEPLOY_REPOSITORY_PASSWORD) {
            console.log('请配置提交仓库的密码，多个配置用英文逗号分隔：GIT_DEPLOY_REPOSITORY_PASSWORD');
        } else if (!GIT_DEPLOY_REPOSITORY_PROJECT) {
            console.log('请配置提交仓库的项目名，多个配置用英文逗号分隔：GIT_DEPLOY_REPOSITORY_PROJECT');
        } else if (!GIT_DEPLOY_REPOSITORY_BRANCH) {
            console.log('请配置提交仓库的分支，多个配置用英文逗号分隔：GIT_DEPLOY_REPOSITORY_BRANCH');
        } else {
            var repositories = [];
            var multiHost = GIT_DEPLOY_REPOSITORY_HOST.split(',');
            var multiUsername = GIT_DEPLOY_REPOSITORY_USERNAME.split(',');
            var multiPassword = GIT_DEPLOY_REPOSITORY_PASSWORD.split(',');
            var multiProject = GIT_DEPLOY_REPOSITORY_PROJECT.split(',');
            var multiBranch = GIT_DEPLOY_REPOSITORY_BRANCH.split(',');

            for (var i = 0, len = multiHost.length; i < len; i++) {
                var host = multiHost[i];
                var username = i < multiUsername.length ? multiUsername[i] : multiUsername[i - 1];
                var password = i < multiPassword.length ? encodePassword(multiPassword[i]) : encodePassword(multiPassword[i - 1]);
                var project = i < multiProject.length ? multiProject[i] : multiProject[i - 1];
                var branch = i < multiBranch.length ? multiBranch[i] : multiBranch[i - 1];

                var repositoryUrl = `https://${username}:${password}@${host}/${username}/${project}.git,${branch}`;
                repositories.push(repositoryUrl);
            }

            GIT_DEPLOY_REPOSITORY = repositories.join(';');
            result = true;
        }
    } else {
        result = true;
    }

    return result;
}

/**
 * 仓库密码解密后的字符串作为URI组件进行编码，如果解密异常则原字符串编码
 * @param pass
 */
function encodePassword(pass) {
    var result = pass;
    try {
        // 先对字符串进行解密，再对解密后的内容进行加密。如果加密后的内容和传过来的值相同则就是加密过的，否则就是未加密的
        var decodePass = Buffer.from(pass, 'base64').toString();
        var encodePass = Buffer.from(decodePass).toString('base64');
        if (encodePass === pass) {
            result = encodeURIComponent(decodePass);
        } else {
            result = encodeURIComponent(pass);
        }
    } catch (e) {
        console.log(e);
        result = encodeURIComponent(pass);
    }
    return result;
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