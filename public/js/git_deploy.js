'use strict';

var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('./fs');
var spawn = require('./spawn');
var parseConfig = require('./parse_config');

function gitDeploy(args) {
    if (!args.base_dir) throw new TypeError('base_dir is required!');
    if (!args.repo && !args.repository) throw new TypeError('repo or repository is required!');

    var baseDir = args.base_dir;
    var deployDir = pathFn.join(baseDir, '.deploy_git');
    var publicDir = args.public_dir || pathFn.join(baseDir, 'public');
    var extendDirs = args.extend_dirs;
    var ignoreHidden = args.ignore_hidden;
    var ignorePattern = args.ignore_pattern;
    var message = commitMessage(args);
    var verbose = !args.verbose;

    function git() {
        var len = arguments.length;
        var args = new Array(len);

        for (var i = 0; i < len; i++) {
            args[i] = arguments[i];
        }

        return spawn('git', args, {
            cwd: deployDir,
            verbose: verbose,
            stdio: 'inherit'
        });
    }

    function setup() {
        var userName = args.name || args.user || args.userName || '';
        var userEmail = args.email || args.userEmail || '';

        // Create a placeholder for the first commit
        return fs.writeFile(pathFn.join(deployDir, 'placeholder'), '').then(function () {
            return git('init');
        }).then(function () {
            return userName && git('config', 'user.name', userName);
        }).then(function () {
            return userEmail && git('config', 'user.email', userEmail);
        }).then(function () {
            return git('add', '-A');
        }).then(function () {
            return git('commit', '-m', 'First commit');
        });
    }

    function push(repo) {
        return git('add', '-A').then(function () {
            return git('commit', '-m', message).catch(function () {
                // Do nothing. It's OK if nothing to commit.
            });
        }).then(function () {
            return git('push', '-u', repo.url, 'HEAD:' + repo.branch, '--force');
        });
    }

    return new Promise(function (resolve, reject) {
        try {
            fs.exists(deployDir).then(function (exist) {
                if (exist) return;

                console.log('Setting up Git deployment...');
                return setup();
            }).then(function () {
                console.log('Clearing .deploy_git folder...');
                return fs.emptyDir(deployDir);
            }).then(function () {
                var opts = {};
                console.log('Copying files from public folder...');
                if (typeof ignoreHidden === 'object') {
                    opts.ignoreHidden = ignoreHidden.public;
                } else {
                    opts.ignoreHidden = ignoreHidden;
                }

                if (typeof ignorePattern === 'string') {
                    opts.ignorePattern = new RegExp(ignorePattern);
                } else if (typeof ignorePattern === 'object' && ignorePattern.hasOwnProperty('public')) {
                    opts.ignorePattern = new RegExp(ignorePattern.public);
                }

                return fs.copyDir(publicDir, deployDir, opts);
            }).then(function () {
                console.log('Copying files from extend dirs...');

                if (!extendDirs) {
                    return;
                }

                if (typeof extendDirs === 'string') {
                    extendDirs = [extendDirs];
                }

                var mapFn = function (dir) {
                    var opts = {};
                    var extendPath = pathFn.join(baseDir, dir);
                    var extendDist = pathFn.join(deployDir, dir);

                    if (typeof ignoreHidden === 'object') {
                        opts.ignoreHidden = ignoreHidden[dir];
                    } else {
                        opts.ignoreHidden = ignoreHidden;
                    }

                    if (typeof ignorePattern === 'string') {
                        opts.ignorePattern = new RegExp(ignorePattern);
                    } else if (typeof ignorePattern === 'object' && ignorePattern.hasOwnProperty(dir)) {
                        opts.ignorePattern = new RegExp(ignorePattern[dir]);
                    }

                    return fs.copyDir(extendPath, extendDist, opts);
                };

                return Promise.map(extendDirs, mapFn, {
                    concurrency: 2
                });
            }).then(function () {
                return parseConfig(args);
            }).each(function (repo) {
                return push(repo);
            }).then(function () {
                resolve();
            });
        } catch (e) {
            reject(e);
        }
    });
}

function commitMessage(args) {
    var message = args.m || args.msg || args.message || 'Site updated: ' + new Date().toString();
    return message;
}

module.exports = gitDeploy;