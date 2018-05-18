'use strict';

var pathFn = require('path');
var spawn = require('./spawn');
var fs = require('./fs');
var parseConfig = require('./parse_config');

function gitClone(args) {
    if (!args.base_dir) throw new TypeError('base_dir is required!');
    if (!args.repo && !args.repository) throw new TypeError('repo or repository is required!');

    var baseDir = args.base_dir;
    var verbose = !args.verbose;

    function git() {
        var len = arguments.length;
        var args = new Array(len);

        for (var i = 0; i < len; i++) {
            args[i] = arguments[i];
        }

        return spawn('git', args, {
            verbose: verbose,
            stdio: 'inherit'
        });
    }

    function setup() {
        var userName = args.name || args.user || args.userName || '';
        var userEmail = args.email || args.userEmail || '';

        return userName && git('config', '--global', 'user.name', userName).then(function () {
            return userEmail && git('config', '--global', 'user.email', userEmail);
        });
    }

    function clone(repo) {
        return git('clone', '-b', repo.branch, repo.url, baseDir);
    }

    return new Promise(function (resolve, reject) {
        try {
            setup(args).then(function () {
                return parseConfig(args);
            }).each(function (repo) {
                return clone(repo);
            }).then(function () {
                resolve();
            });
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = gitClone;


