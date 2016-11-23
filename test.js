/**
 * Created by koala on 2016/11/16.
 */

'use strict';

const redis = require('redis');
const debug = require('debug')('index');

let client = redis.createClient();

const RedisLock = require('./index');

let options = {
    key: null,
    value: null,
    ttl: 100000
};

const instance = RedisLock.createInstance(client, options);

// instance.del('name', (err, res) => {
// 	debug(res);
// });

for (let i = 0; i < 100; i++) {
    instance.rob({
        // value: 'koala'
    }, (err, res) => {
        if (err) {
            debug('err', err);
            return;
        }
        if (!!res) {
            debug('抢购成功');
            instance.del((err, res) => {
                debug('清理结果', res);
            });
        } else {
            debug('抢购失败');
        }
    });
}