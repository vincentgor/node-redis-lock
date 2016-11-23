/**
 * Created by koala on 2016/11/16.
 */

'use strict';

/**
 * ### instance
 */
module.exports.createInstance = function (client, options) {
    return new RedisLock(client, options);
};

// const debug = require('debug')('index');
const debug = console.log;

/**
 * ### reids 锁对象
 */
function RedisLock(client, options) {
    if (!(this instanceof RedisLock)) {
        return new RedisLock(client, options);
    }
    init.call(this, client, options);
}

/**
 * ### 初始化
 */
function init (client, options) {

    if (options && Object.prototype.toString.call(options) !== '[object Object]') {
        return new Error('options params must be an object');
    }

    options = options || {};

    let type = Object.prototype.toString.call(options.log);

    if (type === '[object Boolean]') {
        this.log = options.log ? debug : noLog;
    } else if (type === '[object Function]') {
        this.log = options.log;
    } else {
        return new Error('options params must be an object');
    }

    this.client = client;
    this.key = options.key || ('redis_lock_key:' + Date.now());
    this.ttl = options.ttl;

    this.log('init success');

    /**
     * ### reids 锁对象
     */
    function noLog () {}

};

/**
 * ### 抢购 若返回0则表示抢不到， 返回1则表示抢购成功
 */
RedisLock.prototype.lock = function (callback) {

    let key = this.key;
    let value = Date.now();
    let ttl = this.ttl;

    if (ttl) {
        this.client.set(key, value, 'NX', 'PX', ttl, cb.bind(this));
    } else {
        this.client.set(key, value, 'NX', cb.bind(this));
    }

    function cb(err, res) {
        if (err) {
            return callback(err);
        }
        let delOperator = null;
        if (res) {
            this.value = value;
            delOperator = del.bind(this);
        }
        callback(err, !!res, delOperator);
    }

};

/**
 * ### 删除抢购的key
 */
function del (callback) {

    this.client.get(this.key, (err, res) => {
        if (res == this.value) {
            this.log('deling', res);
            this.client.del(this.key, callback);
        } else {
            this.log('no need to be deled');
            callback(null, 'no need to be deled');
        }
    });

};