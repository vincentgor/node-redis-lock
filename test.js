/**
 * Created by koala on 2016/11/16.
 */

'use strict';

const redis = require('redis');
const debug = require('debug')('index');

// const debug = function () {}

let client = redis.createClient();

const RedisLock = require('./index');

let options = {
    ttl: 100000,
    log: debug
};

const instance = RedisLock.createInstance(client, options);

for (let i = 0; i < 100; i++) {
    instance.lock((err, res, release) => {
        if (err) {
            debug('err', err);
            return;
        }
        if (!!res) {
            debug('抢购成功');
            release((err, res) => {
                debug('清理结果:', res);
            });
        } else {
            debug('抢购失败');
        }
    });
}